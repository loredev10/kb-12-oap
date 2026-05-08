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

- SQLite file is created locally at `backend/data/app.db`
- The database file is not committed to the repository
- Migrations are applied automatically on server start
- Test data can be added with the seed script

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
- `role` — `CHECK (role IN ('student', 'teacher', 'lab_assistant'))`
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

## API

### Users

- `GET /api/users` — get user list
- `GET /api/users/:id` — get user by id
- `POST /api/users` — create user
- `PUT /api/users/:id` — replace user
- `PATCH /api/users/:id` — partially update user
- `DELETE /api/users/:id` — soft delete user

### Access Requests

- `GET /api/access-requests` — get access request list
- `GET /api/access-requests/:id` — get access request by id
- `POST /api/access-requests` — create access request
- `PUT /api/access-requests/:id` — replace access request
- `PATCH /api/access-requests/:id` — partially update access request
- `DELETE /api/access-requests/:id` — soft delete access request

### Approvals

- `GET /api/approvals` — get approval list
- `GET /api/approvals/:id` — get approval by id
- `POST /api/approvals` — create approval
- `PUT /api/approvals/:id` — replace approval
- `PATCH /api/approvals/:id` — partially update approval
- `DELETE /api/approvals/:id` — soft delete approval

### Access Requests analytics and joined data

#### Get access requests count (`COUNT` aggregation)

Returns the number of access requests depending on the selected record status.

Available query param:

- `status=active`
- `status=deleted`
- `status=all`

Example:

```bash
curl -i "http://localhost:3000/api/access-requests/stats/count?status=active"
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
curl -i "http://localhost:3000/api/access-requests/with-users?status=active&limit=10"
```

Example response:

```json
{
  "items": [
    {
      "id": 3,
      "userId": 2,
      "startDateTime": "2026-03-20T09:00",
      "endDateTime": "2026-03-20T12:00",
      "comments": "Практична робота в лабораторії",
      "status": "pending",
      "isDeleted": false,
      "userFullName": "Олена Петренко",
      "userEmail": "olena.petrenko@example.com",
      "userRole": "teacher"
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
curl -i "http://localhost:3000/api/users?status=active"
```

### 3. Get all users

```bash
curl -i "http://localhost:3000/api/users?status=all"
```

### 4. Get user by id

```bash
curl -i http://localhost:3000/api/users/1
```

### 5. Create a new user

```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Ірина Мельник\",\"email\":\"iryna.melnyk@example.com\",\"role\":\"student\",\"notes\":\"Потрібен доступ до лабораторії\"}"
```

### 6. Try to create an invalid user (`400 Bad Request`)

```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"\",\"email\":\"bad-email\",\"role\":\"\",\"notes\":\"12\"}"
```

### 7. Try to create a duplicate user (`409 Conflict`)

```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Ірина Мельник\",\"email\":\"iryna.melnyk@example.com\",\"role\":\"student\",\"notes\":\"Duplicate email test\"}"
```

### 8. Partially update a user with `PATCH`

```bash
curl -i -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d "{\"notes\":\"Оновлений коментар через PATCH\"}"
```

### 9. Soft delete a user with `DELETE`

```bash
curl -i -X DELETE http://localhost:3000/api/users/1
```

### 10. Get deleted users

```bash
curl -i "http://localhost:3000/api/users?status=deleted"
```

### 11. Get active access requests

```bash
curl -i "http://localhost:3000/api/access-requests?status=active"
```

### 12. Get all access requests

```bash
curl -i "http://localhost:3000/api/access-requests?status=all"
```

### 13. Get access request by id

```bash
curl -i http://localhost:3000/api/access-requests/1
```

### 14. Create a new access request

```bash
curl -i -X POST http://localhost:3000/api/access-requests \
  -H "Content-Type: application/json" \
  -d "{\"userId\":2,\"startDateTime\":\"2026-03-20T09:00\",\"endDateTime\":\"2026-03-20T12:00\",\"status\":\"pending\",\"comments\":\"Практична робота в лабораторії\"}"
```

### 15. Try to create an invalid access request (`400 Bad Request`)

```bash
curl -i -X POST http://localhost:3000/api/access-requests \
  -H "Content-Type: application/json" \
  -d "{\"userId\":2,\"startDateTime\":\"2026-03-20T09:00\",\"endDateTime\":\"2026-03-20T16:30\",\"status\":\"pending\",\"comments\":\"Занадто довгий доступ\"}"
```

### 16. Partially update an access request with `PATCH`

```bash
curl -i -X PATCH http://localhost:3000/api/access-requests/1 \
  -H "Content-Type: application/json" \
  -d "{\"comments\":\"Оновлена заявка через PATCH\",\"status\":\"approved\"}"
```

### 17. Soft delete an access request with `DELETE`

```bash
curl -i -X DELETE http://localhost:3000/api/access-requests/1
```

### 18. Get deleted access requests

```bash
curl -i "http://localhost:3000/api/access-requests?status=deleted"
```

### Unsafe search endpoint (SQL injection demonstration)

The project contains one intentionally unsafe search endpoint for educational demonstration only:

- `GET /api/access-requests/search?q=...`

It uses string concatenation to build the SQL `WHERE` clause.

Example implementation idea:

```sql
WHERE comments LIKE '%${q}%'
```

This is dangerous because user input becomes part of the SQL query text and can change the query logic.

Example request:

```bash
curl -i --get "http://localhost:3000/api/access-requests/search" \
  --data-urlencode "q=лабораторія"
```

curl -i "http://localhost:3000/api/access-requests/search?q=лабораторія"

Example of intentionally bad input for demonstration:

```text
' OR 1=1 --
```

```bash
curl -i --get "http://localhost:3000/api/access-requests/search" \
  --data-urlencode "q=' OR 1=1 --"
```

If such input is inserted directly into SQL, it can break the intended filter logic and return more rows than expected.

This endpoint is included only as a learning example for Laboratory Work #3.
It must be used only locally in the educational project.
It is intentionally not fixed yet, because protection against SQL injection will be implemented later with parameterized queries.
