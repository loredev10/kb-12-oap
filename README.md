# kb-12 OAP My Course App

Course monorepo with separate frontend and backend parts.

## Сутності, реалізовані в проєкті

У поточній версії застосунку реалізовано дві сутності:

### 1. `Users`
Сутність користувачів системи.  
Використовується для зберігання інформації про осіб, які можуть подавати заявки на доступ до лабораторії.

Основні поля:
- `id`
- `fullName`
- `email`
- `role`
- `notes`

### 2. `AccessRequests`
Основна доменна сутність застосунку — заявки на доступ до лабораторії.  
Початково вона розглядалася як сутність із полями `Date` і `Comments`, але в реалізації була розширена до більш практичної моделі із часовим інтервалом доступу.

Основні поля:
- `id`
- `userId`
- `startDateTime`
- `endDateTime`
- `comments`

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

## DTO compatibility rules

1. Existing fields used by the frontend must not be renamed or removed in `/api/v1`.
2. New fields may be added only as optional fields or with default values.
3. Breaking changes must be introduced only through a new API version, for example `/api/v2`.
4. The frontend should use fallback values for optional fields, for example `notes || "—"`.

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
- Users, AccessRequests (Date, Comments), Approvals
- Рекомендована ключова сутність AccessRequests 
- Рекомендовані поля ключової сутності
UserName, Date(input date/datetime), AccessType(select),
Comments(textarea), Status(select, по замовчуванню
«Pending»)