# kb-12 OAP My Course App

Course monorepo with separate frontend and backend parts.

## Structure

- `frontend/` — client-side part
- `backend/` — API built with Express and TypeScript

## Requirements

- Node.js (use version from `.nvmrc`)
- Corepack
- pnpm

## Workspace install

From the repository root:

- `pnpm install`

## Available packages

- `frontend/`
- `backend/`

## Available commands

Defined in `/package.json`

### Backend

Run backend in development mode:

- `pnpm dev:backend`

Build backend:

- `pnpm build:backend`

Run TypeScript type checking for backend:

- `pnpm type-check:backend`

Start compiled backend build:

- `pnpm start:backend`

Check backend code with ESLint:

- `pnpm lint:check:backend`

Fix backend lint issues automatically:

- `pnpm lint:fix:backend`

Check backend formatting with Prettier:

- `pnpm format:check:backend`

Format backend code automatically:

- `pnpm format:fix:backend`

### Frontend

Run frontend in development mode:

- `pnpm dev:frontend`

Build frontend:

- `pnpm build:frontend`

Run TypeScript type checking for frontend:

- `pnpm type-check:frontend`

Start frontend:

- `pnpm start:frontend`

Check frontend code with ESLint:

- `pnpm lint:check:frontend`

Fix frontend lint issues automatically:

- `pnpm lint:fix:frontend`

Check frontend formatting with Prettier:

- `pnpm format:check:frontend`

Format frontend code automatically:

- `pnpm format:fix:frontend`

## Project architecture

- index.ts — тільки запуск

- app.ts — збирає express-застосунок

- users.routes.ts — маршрути Users

- users.store.ts — дані в пам’яті

- user.validator.ts — нормалізація + валідація

- paths.ts — шлях до папки frontend

- not-found.ts — для не-API маршрутів віддає index.html

- error-handler.ts — єдиний формат помилок

## Notes

TODO:
- describe full project architecture
- document interaction between frontend and backend
- add setup instructions for each lab stage