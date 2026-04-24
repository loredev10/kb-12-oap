# Backend

Backend part of the course app for Laboratory Work #3.

## Stack

- Express
- TypeScript
- SQLite
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

From the project root or from the `backend` directory:

- `pnpm seed:backend`
- or `pnpm seed`

## Database

- SQLite file is created locally at `backend/data/app.db`
- DB schema is initialized automatically on server start
- Test data can be added with the seed script

## Database schema

### users
- `id` - primary key
- `full_name` - required
- `email` - required, unique
- `role` - required
- `notes`
- `is_deleted`

### access_requests
- `id` - primary key
- `user_id` - foreign key -> `users.id`
- `start_date_time` - required
- `end_date_time` - required
- `comments` - required
- `is_deleted`

## Relations

- one user -> many access requests
- `access_requests.user_id` references `users.id`

## Constraints

- `NOT NULL` for required fields
- `UNIQUE` for `users.email`
- `CHECK` for allowed values / simple rules
- `FOREIGN KEY` for relation between users and access requests

## API examples

```bash
curl -i http://localhost:3000/api/users
curl -i http://localhost:3000/api/users/1
curl -i -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"fullName":"Test User","email":"test.user@example.com","role":"student","notes":"created from curl"}'
curl -i http://localhost:3000/api/access-requests
curl -i -X POST http://localhost:3000/api/access-requests -H "Content-Type: application/json" -d '{"userId":1,"startDateTime":"2026-04-23T10:00","endDateTime":"2026-04-23T12:00","comments":"test request"}'