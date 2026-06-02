#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_URL="${BASE_URL}/api/v1"
ALLOWED_ORIGIN="${ALLOWED_ORIGIN:-http://127.0.0.1:5500}"
BLOCKED_ORIGIN="${BLOCKED_ORIGIN:-https://example.invalid}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

PASS_COUNT=0

fail() {
  printf '\n[FAIL] %s\n' "$1" >&2
  exit 1
}

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf '[PASS] %s\n' "$1"
}

request() {
  local name="$1"
  shift

  LAST_HEADERS="$TMP_DIR/${name}.headers"
  LAST_BODY="$TMP_DIR/${name}.body"
  LAST_STATUS="$(curl -sS -D "$LAST_HEADERS" -o "$LAST_BODY" -w '%{http_code}' "$@")"
}

assert_status() {
  local expected="$1"
  local message="$2"

  if [[ "$LAST_STATUS" != "$expected" ]]; then
    printf '\nResponse headers:\n' >&2
    cat "$LAST_HEADERS" >&2
    printf '\nResponse body:\n' >&2
    cat "$LAST_BODY" >&2
    printf '\n' >&2
    fail "$message: expected HTTP $expected, got $LAST_STATUS"
  fi

  pass "$message"
}

assert_header_contains() {
  local header_name="$1"
  local expected_value="$2"
  local message="$3"

  if ! grep -Eiq "^${header_name}:[[:space:]]*${expected_value}[[:space:]]*\r?$" "$LAST_HEADERS"; then
    printf '\nResponse headers:\n' >&2
    cat "$LAST_HEADERS" >&2
    printf '\n' >&2
    fail "$message"
  fi

  pass "$message"
}

assert_header_absent() {
  local header_name="$1"
  local message="$2"

  if grep -Eiq "^${header_name}:" "$LAST_HEADERS"; then
    printf '\nResponse headers:\n' >&2
    cat "$LAST_HEADERS" >&2
    printf '\n' >&2
    fail "$message"
  fi

  pass "$message"
}

assert_body_contains() {
  local expected="$1"
  local message="$2"

  if ! grep -Fq "$expected" "$LAST_BODY"; then
    printf '\nResponse body:\n' >&2
    cat "$LAST_BODY" >&2
    printf '\n' >&2
    fail "$message"
  fi

  pass "$message"
}

assert_body_absent() {
  local forbidden="$1"
  local message="$2"

  if grep -Fq "$forbidden" "$LAST_BODY"; then
    printf '\nResponse body:\n' >&2
    cat "$LAST_BODY" >&2
    printf '\n' >&2
    fail "$message"
  fi

  pass "$message"
}

printf 'Lab 5 security regression against %s\n\n' "$BASE_URL"
printf 'Prerequisite: run the backend in development mode and ensure seeded records 1 and 2 exist.\n\n'

request health "$BASE_URL/health"
assert_status 200 'Health endpoint is available'
assert_header_contains 'X-Content-Type-Options' 'nosniff' 'nosniff header is present'
assert_header_contains 'X-Frame-Options' 'DENY' 'frame embedding is denied'
assert_header_contains 'Referrer-Policy' 'no-referrer' 'referrer policy is present'
assert_header_contains 'Permissions-Policy' 'camera=\(\), microphone=\(\), geolocation=\(\)' 'unused browser permissions are disabled'
assert_header_absent 'X-Powered-By' 'Express fingerprint header is absent'

request cors_allowed -H "Origin: $ALLOWED_ORIGIN" "$BASE_URL/health"
assert_status 200 'Allowed frontend origin reaches health endpoint'
assert_header_contains 'Access-Control-Allow-Origin' "$ALLOWED_ORIGIN" 'Allowed frontend origin receives CORS permission'

request cors_blocked -H "Origin: $BLOCKED_ORIGIN" "$BASE_URL/health"
assert_status 200 'Blocked origin request is handled normally'
assert_header_absent 'Access-Control-Allow-Origin' 'Blocked origin does not receive CORS permission'

request no_auth "$API_URL/access-requests/1"
assert_status 401 'Missing X-Demo-UserId is rejected'
assert_body_contains '"code":"UNAUTHORIZED"' 'Missing demo user returns a stable error code'

request own_read -H 'X-Demo-UserId: 1' "$API_URL/access-requests/1"
if [[ "$LAST_STATUS" != '200' ]]; then
  printf '\nSeed prerequisite failed. Request 1 must exist, belong to user 1, and remain active.\n' >&2
  printf 'For a reproducible run, use a clean local database:\n' >&2
  printf '  rm -f backend/data/lab5-regression.db*\n' >&2
  printf '  DB_PATH=data/lab5-regression.db pnpm seed:backend\n' >&2
  printf '  DB_PATH=data/lab5-regression.db pnpm dev:backend\n\n' >&2
  fail 'Seeded own access request is unavailable'
fi
pass 'Owner can read own access request'

request foreign_read -H 'X-Demo-UserId: 1' "$API_URL/access-requests/2"
assert_status 403 'Foreign access request cannot be read'
assert_body_contains '"code":"FORBIDDEN"' 'Foreign read returns a stable forbidden code'

request foreign_delete -X DELETE -H 'X-Demo-UserId: 1' "$API_URL/access-requests/2"
assert_status 403 'Foreign access request cannot be deleted'

request protected_fields \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'X-Demo-UserId: 1' \
  --data '{"userId":2,"startDateTime":"2026-06-05T10:00","endDateTime":"2026-06-05T11:00","comments":"Protected field regression","status":"pending"}' \
  "$API_URL/access-requests"
assert_status 400 'Client cannot assign a foreign owner during creation'
assert_body_contains '"code":"PROTECTED_FIELDS"' 'Protected-field violation returns a stable error code'

request sqli \
  --get \
  -H 'X-Demo-UserId: 1' \
  --data-urlencode "q=' OR 1=1 --" \
  "$API_URL/access-requests/search"
assert_status 200 'SQLi payload is handled without a server error'
assert_body_contains '"items":[]' 'SQLi payload is treated as plain text and returns no extra rows'

request debug_error "$API_URL/debug/500"
assert_status 500 'Development debug endpoint returns controlled HTTP 500'
assert_body_contains '"code":"INTERNAL_SERVER_ERROR"' 'Unexpected error uses the stable public format'
assert_body_absent 'Lab 5 test error' 'Internal exception text is not exposed to clients'
assert_body_absent 'Error:' 'Stack trace is not exposed to clients'

printf '\nAll %d automated checks passed.\n' "$PASS_COUNT"
printf 'Manual XSS check remains browser-based: run backend/http/lab5-security-regression.http and verify document.querySelector("#lab5-xss-marker") returns null.\n'
printf 'Production-only check remains manual: start with NODE_ENV=production and verify GET /api/v1/debug/500 returns 404.\n'
