# Backend

Backend part of the course app for Laboratory Work

## Stack

- Express
- TypeScript
- SQLite (via built-in `node:sqlite`)
- tsx
- ESLint
- Prettier

## Entry point

- `src/index.ts`

## Requirements

- Node.js (use version from root `.nvmrc`)
- pnpm via Corepack

## Install

From the `backend` directory:

- `pnpm install`

## Run in development mode

From the `backend` directory:

- `pnpm dev`

## Build

From the `backend` directory:

- `pnpm build`

## Start built version

From the `backend` directory:

- `pnpm start`

## Seed

From the `backend` directory:

- `pnpm seed`

From the project root:

- `pnpm seed:backend`

## Database

- By default, the SQLite file is created locally at `backend/data/app.db`
- The path can be overridden with the `DB_PATH` environment variable
- A relative `DB_PATH` is resolved from the `backend` directory
- The database file is not committed to the repository
- Migrations are applied automatically on server start
- Test data can be added with the seed script

Examples:

```bash
pnpm dev
DB_PATH=data/app.db pnpm dev
DB_PATH=data/lab5.db pnpm dev
```

## Migrations

The project uses simplified SQL migrations without ORM.

Migration files are stored in:

- `backend/migrations`

Current migration files:

- `001_create_users.sql`
- `002_create_access_requests.sql`
- `003_add_access_requests_user_id_index.sql`
- ...

Applied migrations are stored in the `schema_migrations` table.

On application startup, only migrations that are not yet present in `schema_migrations` are executed.

## Database schema

### `users`

Fields:

- `id` — primary key
- `full_name` — required user full name
- `email` — required, unique
- `role` — required user role
- `notes` — required text field, default value is an empty string
- `is_deleted` — logical deletion flag

### `access_requests`

Fields:

- `id` — primary key
- `user_id` — required foreign key to `users.id`
- `start_date_time` — required start date and time
- `end_date_time` — required end date and time
- `comments` — required comment
- `status` — request status (`pending`, `approved`, `rejected`)
- `is_deleted` — logical deletion flag

### `approvals`

Fields:

- `id` — primary key
- `access_request_id` — required foreign key to `access_requests.id`
- `approved_by_user_id` — required foreign key to `users.id`
- `decision` — approval decision (`approved`, `rejected`)
- `comment` — optional explanation or note
- `approved_at` — required date and time of decision
- `is_deleted` — logical deletion flag

## Relations

- One user can have many access requests
- One access request can have many approvals
- One user can create many approvals
- `access_requests.user_id` references `users.id`
- `approvals.access_request_id` references `access_requests.id`
- `approvals.approved_by_user_id` references `users.id`
- Relation type: `1:N`

## Constraints

### `users`

- `full_name` — `NOT NULL`
- `email` — `NOT NULL`
- `email` — `UNIQUE`
- `role` — `NOT NULL`
- `role` — `CHECK (role IN ('student', 'teacher', 'lab_assistant', 'admin'))`
- `notes` — `NOT NULL DEFAULT ''`
- `is_deleted` — `NOT NULL DEFAULT 0`
- `is_deleted` — `CHECK (is_deleted IN (0, 1))`

### `access_requests`

- `user_id` — `NOT NULL`
- `start_date_time` — `NOT NULL`
- `end_date_time` — `NOT NULL`
- `comments` — `NOT NULL`
- `status` — `NOT NULL DEFAULT 'pending'`
- `status` — `CHECK (status IN ('pending', 'approved', 'rejected'))`
- `is_deleted` — `NOT NULL DEFAULT 0`
- `is_deleted` — `CHECK (is_deleted IN (0, 1))`
- `CHECK (end_date_time > start_date_time)`
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT`

### `approvals`

- `access_request_id` — `NOT NULL`
- `approved_by_user_id` — `NOT NULL`
- `decision` — `NOT NULL`
- `decision` — `CHECK (decision IN ('approved', 'rejected'))`
- `approved_at` — `NOT NULL`
- `is_deleted` — `NOT NULL DEFAULT 0`
- `is_deleted` — `CHECK (is_deleted IN (0, 1))`
- `FOREIGN KEY (access_request_id) REFERENCES access_requests(id) ON DELETE RESTRICT`
- `FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE RESTRICT`

## Demo user identification and authorization for Lab 5

Access-request endpoints require the educational header:

```http
X-Demo-UserId: 1
```

The backend verifies that the header contains a positive integer and that the user exists and is not deleted. Missing, invalid, or unknown demo users receive `401 Unauthorized`.

`AccessRequests` are personal resources. Authorization is enforced on the backend: list, search, stats, JOIN, read, update, and delete operations are restricted to the current user. The client cannot assign `userId` or `isDeleted` through the request body.

This header is intentionally a simplified educational substitute for a real login/session mechanism.

Final repeatable checks are stored in:

- `backend/http/lab5-security-regression.http`
- `backend/scripts/lab5-security-regression.sh`

## API

### Users

- `GET /api/v1/users` — get user list
- `GET /api/v1/users/:id` — get user by id
- `POST /api/v1/users` — create user
- `PUT /api/v1/users/:id` — replace user
- `PATCH /api/v1/users/:id` — partially update user
- `DELETE /api/v1/users/:id` — soft delete user

### Access Requests

- `GET /api/v1/access-requests` — get access request list
- `GET /api/v1/access-requests/:id` — get access request by id
- `POST /api/v1/access-requests` — create access request
- `PUT /api/v1/access-requests/:id` — replace access request
- `PATCH /api/v1/access-requests/:id` — partially update access request
- `DELETE /api/v1/access-requests/:id` — soft delete access request

### Approvals

- `GET /api/v1/approvals` — get approval list
- `GET /api/v1/approvals/:id` — get approval by id
- `POST /api/v1/approvals` — create approval
- `PUT /api/v1/approvals/:id` — replace approval
- `PATCH /api/v1/approvals/:id` — partially update approval
- `DELETE /api/v1/approvals/:id` — soft delete approval

### Access Requests analytics and joined data

#### Get access requests count (`COUNT` aggregation)

Returns the number of access requests depending on the selected record status.

Available query param:

- `status=active`
- `status=deleted`
- `status=all`

Example:

```bash
curl -i "http://localhost:3000/api/v1/access-requests/stats/count?status=active" \
  -H "X-Demo-UserId: 1"
```

Example response:

```json
{
  "data": {
    "total": 5,
    "status": "active"
  }
}
```

#### Get access requests with user data (`JOIN`)

Returns access requests together with related user data.

This endpoint uses SQL `JOIN` between:

- `access_requests`
- `users`

Available query params:

- `status=active|deleted|all`
- `limit=1..100`

Example:

```bash
curl -i "http://localhost:3000/api/v1/access-requests/with-users?status=active&limit=10" \
  -H "X-Demo-UserId: 1"
```

Example response:

```json
{
  "items": [
    {
      "id": 1,
      "userId": 1,
      "startDateTime": "2026-03-18T09:00",
      "endDateTime": "2026-03-18T11:00",
      "comments": "Практична робота з мережевих технологій",
      "status": "pending",
      "isDeleted": false,
      "userFullName": "Павло Іваненко",
      "userEmail": "pavlo.ivanenko@example.com",
      "userRole": "student"
    }
  ],
  "meta": {
    "count": 1,
    "status": "active",
    "limit": 10
  }
}
```

## API examples

Base server URL:

```text
http://localhost:3000
```

### 1. Check `health` endpoint

```bash
curl -i http://localhost:3000/health
```

### 2. Get active users

```bash
curl -i "http://localhost:3000/api/v1/users?status=active"
```

### 3. Get all users

```bash
curl -i "http://localhost:3000/api/v1/users?status=all"
```

### 4. Get user by id

```bash
curl -i http://localhost:3000/api/v1/users/1
```

### 5. Create a new user

```bash
curl -i -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Ірина Мельник\",\"email\":\"iryna.melnyk@example.com\",\"role\":\"student\",\"notes\":\"Потрібен доступ до лабораторії\"}"
```

### 6. Try to create an invalid user (`400 Bad Request`)

```bash
curl -i -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"\",\"email\":\"bad-email\",\"role\":\"\",\"notes\":\"12\"}"
```

### 7. Try to create a duplicate user (`409 Conflict`)

```bash
curl -i -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Ірина Мельник\",\"email\":\"iryna.melnyk@example.com\",\"role\":\"student\",\"notes\":\"Duplicate email test\"}"
```

### 8. Partially update a user with `PATCH`

```bash
curl -i -X PATCH http://localhost:3000/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d "{\"notes\":\"Оновлений коментар через PATCH\"}"
```

### 9. Soft delete a user with `DELETE`

```bash
curl -i -X DELETE http://localhost:3000/api/v1/users/1
```

### 10. Get deleted users

```bash
curl -i "http://localhost:3000/api/v1/users?status=deleted"
```

### 11. Get active access requests for demo user 1

```bash
curl -i "http://localhost:3000/api/v1/access-requests?status=active" \
  -H "X-Demo-UserId: 1"
```

### 12. Get all access requests for demo user 1

```bash
curl -i "http://localhost:3000/api/v1/access-requests?status=all" \
  -H "X-Demo-UserId: 1"
```

### 13. Get owned access request by id

```bash
curl -i http://localhost:3000/api/v1/access-requests/1 \
  -H "X-Demo-UserId: 1"
```

### 14. Create a new access request

The owner is taken from `X-Demo-UserId`, not from the JSON body.

```bash
curl -i -X POST http://localhost:3000/api/v1/access-requests \
  -H "Content-Type: application/json" \
  -H "X-Demo-UserId: 1" \
  -d '{"startDateTime":"2026-06-05T10:00","endDateTime":"2026-06-05T12:00","status":"pending","comments":"Практична робота в лабораторії"}'
```

### 15. Try to assign a foreign owner (`400 Bad Request`)

```bash
curl -i -X POST http://localhost:3000/api/v1/access-requests \
  -H "Content-Type: application/json" \
  -H "X-Demo-UserId: 1" \
  -d '{"userId":2,"startDateTime":"2026-06-05T10:00","endDateTime":"2026-06-05T12:00","status":"pending","comments":"Protected owner field test"}'
```

### 16. Partially update an owned access request with `PATCH`

```bash
curl -i -X PATCH http://localhost:3000/api/v1/access-requests/1 \
  -H "Content-Type: application/json" \
  -H "X-Demo-UserId: 1" \
  -d '{"comments":"Оновлена заявка через PATCH","status":"approved"}'
```

### 17. Try to read a foreign access request (`403 Forbidden`)

```bash
curl -i http://localhost:3000/api/v1/access-requests/2 \
  -H "X-Demo-UserId: 1"
```

### 18. Soft delete an owned access request with `DELETE`

```bash
curl -i -X DELETE http://localhost:3000/api/v1/access-requests/1 \
  -H "X-Demo-UserId: 1"
```

### SQL injection demonstration from Laboratory Work #3

Before the Lab 5 fix, the search endpoint was intentionally unsafe for a local educational demonstration:

- `GET /api/v1/access-requests/search?q=...`

The vulnerable implementation inserted user input directly into the SQL `WHERE` clause:

```sql
WHERE comments LIKE '%${q}%'
```

This was dangerous because user input became part of the SQL query text and could change the query logic.

Example of the intentionally bad input used locally before the fix:

```text
' OR 1=1 --
```

```bash
curl -i --get "http://localhost:3000/api/v1/access-requests/search" \
  -H "X-Demo-UserId: 1" \
  --data-urlencode "q=' OR 1=1 --"
```

Before parameterization, this input could bypass the intended filter and return more rows than expected. The endpoint is now fixed as part of Laboratory Work #5.

## SQL Injection protection for Lab 5

All values passed to SQLite are bound separately from SQL text through the shared `db-client` helpers:

```ts
const statement = db.prepare(sql);
return statement.all(...params);
```

The access-request search endpoint now uses a placeholder instead of interpolating the search value into SQL:

```sql
WHERE comments LIKE ?
```

with the bound parameter:

```ts
[`%${query}%`]
```

The same approach is used for `SELECT`, `INSERT`, `UPDATE`, soft-delete operations, migration metadata, and `LIMIT` values. SQL fragments that remain dynamic are selected only from fixed internal branches, not copied from request input.

Repeatable requests for the fixed SQLi scenario are stored in:

- `backend/http/lab5-after-sqli-fix.http`

## Broken Access Control / IDOR protection for Lab 5

Access requests are personal resources. The backend identifies the current demo user through:

```http
X-Demo-UserId: 1
```

The header is an educational substitute for a real login/session mechanism. Authorization is still enforced on the backend:

- `GET /api/v1/access-requests/:id` checks that the current user owns the request;
- `PUT /api/v1/access-requests/:id` checks the owner before updating;
- `PATCH /api/v1/access-requests/:id` checks the owner before updating;
- `DELETE /api/v1/access-requests/:id` checks the owner before soft delete;
- list, search, statistics, and JOIN endpoints return only the current user's access requests.

The `userId` and `isDeleted` fields are server-managed fields. They are not accepted from request bodies. When creating a request, the owner is taken from `req.currentUser.id` rather than from client input.

The shared authorization helper is located in:

- `backend/src/security/access-request-access.ts`

The repeatable requests for the protected IDOR scenario are stored in:

- `backend/http/lab5-after-idor-fix.http`

## Security Misconfiguration hardening for Lab 5

The backend applies a small global hardening middleware before API routes and static files:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Express fingerprinting through `X-Powered-By` is disabled:

```ts
app.disable("x-powered-by");
```

CORS is restricted to explicitly allowed frontend origins. The default local origin is:

```text
http://127.0.0.1:5500
```

Additional local origins can be supplied as a comma-separated environment variable:

```bash
FRONTEND_ORIGINS=http://127.0.0.1:5500,http://localhost:5500 pnpm dev
```

The API does not expose stack traces or raw internal error messages to clients. Unexpected errors are logged server-side and returned in the stable public format:

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Внутрішня помилка сервера.",
    "details": null
  }
}
```

The educational endpoint `GET /api/v1/debug/500` is available only outside production mode. In production it is not registered and returns `404 Not Found`:

```bash
NODE_ENV=production pnpm dev
```

Useful manual checks:

```bash
curl -i http://localhost:3000/health
curl -i -H "Origin: http://127.0.0.1:5500" http://localhost:3000/health
curl -i -H "Origin: https://example.invalid" http://localhost:3000/health
curl -i http://localhost:3000/api/v1/debug/500
```

Repeatable requests for this scenario are stored in:

- `backend/http/lab5-after-misconfiguration-fix.http`


## Final Lab 5 security regression

The final combined HTTP scenario set is stored in:

```text
backend/http/lab5-security-regression.http
```

An automated curl-based subset is available from the repository root:

```bash
pnpm security:regression
```

Prerequisites:

```bash
pnpm seed:backend
pnpm dev:backend
```

For a fully reproducible run without touching the usual local database, use a temporary SQLite file:

```bash
rm -f backend/data/lab5-regression.db*
DB_PATH=data/lab5-regression.db pnpm seed:backend
DB_PATH=data/lab5-regression.db pnpm dev:backend
pnpm security:regression
```

The report draft and screenshot checklist are located in:

```text
docs/lab5/REPORT.md
docs/lab5/screenshots/README.md
```
