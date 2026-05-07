# Backend

Backend part of the course app for Laboratory Work #3.

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
- The database is not committed to the repository
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
- `is_deleted` — logical deletion flag

## Relations

- One user can have many access requests
- `access_requests.user_id` references `users.id`
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
- `is_deleted` — `NOT NULL DEFAULT 0`
- `is_deleted` — `CHECK (is_deleted IN (0, 1))`
- `CHECK (end_date_time > start_date_time)`
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT`

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
