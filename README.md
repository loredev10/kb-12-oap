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


## Перевірка API через `curl`

Базова адреса сервера:

```text
http://localhost:3000
```

### 1. Перевірка `health` endpoint

```bash
curl -i http://localhost:3000/health
```

### 2. Отримати список активних користувачів

```bash
curl -i "http://localhost:3000/api/users?status=active"
```

### 3. Отримати список усіх користувачів

```bash
curl -i "http://localhost:3000/api/users?status=all"
```

### 4. Створити нового користувача

```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Ірина Мельник\",\"email\":\"iryna.melnyk@example.com\",\"role\":\"student\",\"notes\":\"Потрібен доступ до лабораторії\"}"
```

### 5. Спроба створити некоректного користувача (`400 Bad Request`)

```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"\",\"email\":\"bad-email\",\"role\":\"\",\"notes\":\"12\"}"
```

### 6. Частково оновити користувача через `PATCH`

```bash
curl -i -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d "{\"notes\":\"Оновлений коментар через PATCH\"}"
```

### 7. Виконати `soft delete` користувача через `PATCH`

```bash
curl -i -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d "{\"isDeleted\":true}"
```

### 8. Отримати список видалених користувачів

```bash
curl -i "http://localhost:3000/api/users?status=deleted"
```

### 9. Отримати список активних заявок

```bash
curl -i "http://localhost:3000/api/access-requests?status=active"
```

### 10. Створити нову заявку на доступ

```bash
curl -i -X POST http://localhost:3000/api/access-requests \
  -H "Content-Type: application/json" \
  -d "{\"userId\":2,\"startDateTime\":\"2026-03-20T09:00\",\"endDateTime\":\"2026-03-20T12:00\",\"comments\":\"Практична робота в лабораторії\"}"
```

### 11. Спроба створити некоректну заявку (тривалість більше 5 годин)

```bash
curl -i -X POST http://localhost:3000/api/access-requests \
  -H "Content-Type: application/json" \
  -d "{\"userId\":2,\"startDateTime\":\"2026-03-20T09:00\",\"endDateTime\":\"2026-03-20T16:30\",\"comments\":\"Занадто довгий доступ\"}"
```

### 12. Частково оновити заявку через `PATCH`

```bash
curl -i -X PATCH http://localhost:3000/api/access-requests/1 \
  -H "Content-Type: application/json" \
  -d "{\"comments\":\"Оновлена заявка через PATCH\"}"
```

### 13. Виконати `soft delete` заявки через `PATCH`

```bash
curl -i -X PATCH http://localhost:3000/api/access-requests/1 \
  -H "Content-Type: application/json" \
  -d "{\"isDeleted\":true}"
```

### 14. Отримати список видалених заявок

```bash
curl -i "http://localhost:3000/api/access-requests?status=deleted"
```

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