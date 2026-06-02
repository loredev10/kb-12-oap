# Frontend

Frontend part of the OAP course app.

This frontend is used for the course project **"Менеджер заявок на доступ до лабораторії"**.

The frontend works as a separate client application and communicates with the backend only through HTTP API requests.

## Current stack

- HTML
- CSS
- TypeScript
- Vite
- Fetch API

## Current structure

```text
frontend/
  index.html
  access-requests.html
  package.json
  README.md
  tsconfig.json

  src/
    apiClient.ts
    config.ts
    dtos.ts
    users.page.ts
    accessRequests.page.ts
    styles.css
```

## Pages

### Users page

URL:

```text
http://127.0.0.1:5500/
```

Main files:

```text
index.html
src/users.page.ts
```

This page allows the user to:

- view users from the backend;
- create a new user;
- delete a user;
- filter users by role;
- search users by name or email;
- switch between active / deleted / all records.

### Access Requests page

URL:

```text
http://127.0.0.1:5500/access-requests.html
```

Main files:

```text
access-requests.html
src/accessRequests.page.ts
```

This page allows the user to:

- view access requests from the backend;
- create a new access request;
- delete an access request;
- view only the current demo user's requests;
- search requests by comments;
- switch between active / deleted / all records.

## API configuration

The backend API base URL is configured in:

```text
src/config.ts
```

Current value:

```ts
export const API_BASE_URL = "http://localhost:3000/api/v1";
```

If the backend runs on another port or without the `/api/v1` prefix, this value must be changed.

## DTO contracts

Frontend DTO types are described in:

```text
src/dtos.ts
```

The frontend expects backend DTOs in camelCase format, for example:

```ts
fullName
startDateTime
endDateTime
```

The frontend should not depend on database column names such as:

```text
full_name
start_date_time
end_date_time
```

Database-specific names must be mapped to API DTOs on the backend side.

## Backend API endpoints used by frontend

### Users

```text
GET    /api/v1/users?status=active
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
```

Expected list response:

```json
{
  "items": []
}
```

Create user request body example:

```json
{
  "fullName": "Павло Іваненко",
  "email": "pavlo@example.com",
  "role": "student",
  "notes": "Потрібен доступ до лабораторії"
}
```

Allowed user roles:

```text
student
teacher
lab_assistant
admin
```

### Access Requests

```text
GET    /api/v1/access-requests?status=active
GET    /api/v1/access-requests/with-users?status=active&limit=100
POST   /api/v1/access-requests
PUT    /api/v1/access-requests/:id
DELETE /api/v1/access-requests/:id
```

Expected list response:

```json
{
  "items": []
}
```

Create access request body example:

```json
{
  "startDateTime": "2026-06-05T10:00",
  "endDateTime": "2026-06-05T12:00",
  "status": "pending",
  "comments": "Потрібен доступ для виконання практичної роботи"
}
```

The owner is not selected in the form and is not sent in the JSON body. The frontend adds the educational header:

```http
X-Demo-UserId: 1
```

The backend assigns the owner from the verified request context. The client cannot override `userId` or `isDeleted`.

Allowed access request statuses:

```text
pending
approved
rejected
```

## Error handling

The frontend expects the backend error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": []
  }
}
```

Network and CORS errors are handled in:

```text
src/apiClient.ts
```

The UI should show understandable messages instead of failing silently.

## UI states

The frontend handles basic UI states:

- loading — data is being loaded;
- success — data was loaded successfully;
- empty — there are no records;
- error — the backend returned an error or the request failed.

## Install dependencies

From the `frontend` directory:

```bash
pnpm install
```

If dependencies are missing:

```bash
pnpm add -D vite typescript
```

## Frontend scripts

The frontend package contains the following scripts:

```json
{
  "dev": "vite --host 127.0.0.1 --port 5500",
  "build": "tsc && vite build",
  "preview": "vite preview --host 127.0.0.1 --port 5500",
  "type-check": "tsc --noEmit",
  "start": "vite preview --host 127.0.0.1 --port 5500"
}
```

### Development mode

Use this command during development:

```bash
cd frontend
pnpm dev
```

The frontend will be available at:

```text
http://127.0.0.1:5500
```

Available pages:

```text
http://127.0.0.1:5500/
http://127.0.0.1:5500/access-requests.html
```

The frontend uses Vite as a local development server. It serves the HTML pages and compiles TypeScript files from the `src/` directory.

The backend must be running separately.

Backend API URL used by the frontend:

```text
http://localhost:3000/api/v1
```

This value is configured in:

```text
src/config.ts
```

### Type checking

To check TypeScript types without building the frontend:

```bash
cd frontend
pnpm type-check
```

### Production build

To build the frontend:

```bash
cd frontend
pnpm build
```

This command runs TypeScript checking and builds the frontend using Vite.

### Preview production build

To preview the built frontend locally:

```bash
cd frontend
pnpm build
pnpm preview
```

or:

```bash
cd frontend
pnpm build
pnpm start
```

The `start` script is an alias for previewing the production build. It should be used after `pnpm build`.

## Full local run

Use two terminal windows.

Terminal 1 — backend:

```bash
cd backend
pnpm dev
```

Backend API:

```text
http://localhost:3000
```

Terminal 2 — frontend:

```bash
cd frontend
pnpm dev
```

Frontend:

```text
http://127.0.0.1:5500
```

Available frontend pages:

```text
http://127.0.0.1:5500/
http://127.0.0.1:5500/access-requests.html
```

## CORS requirement

Because frontend and backend run on different ports, the backend must allow requests from the frontend origin.

Frontend origin:

```text
http://127.0.0.1:5500
```

Backend origin:

```text
http://localhost:3000
```

These are different origins, so CORS must be configured on the backend.

## Notes

The frontend is no longer a plain static JavaScript client. It now uses TypeScript and Vite.

The main integration logic is separated into:

```text
src/apiClient.ts
```

Page-specific logic is separated into:

```text
src/users.page.ts
src/accessRequests.page.ts
```

DTO contracts are separated into:

```text
src/dtos.ts
```

This structure is intentionally simple and is suitable for Lab 4.
## ЛР5: перевірка захисту від Stored XSS

Для демонстрації використовується поле `comments` у заявці на доступ.
Створіть заявку з HTML-маркером через форму або запит із файлу
`backend/http/lab5-after-xss-fix.http`:

```html
<strong id="lab5-xss-marker">LAB5-XSS</strong>
```

До виправлення рядок, вставлений через `innerHTML`, інтерпретувався браузером
як розмітка. Після виправлення користувацькі дані вставляються через
`textContent`, тому маркер відображається буквально як текст разом із тегами.


## ЛР5: демо-користувач і серверна авторизація

Для навчальної демонстрації frontend передає `X-Demo-UserId`, значення якого визначене у `src/config.ts`. Заявки на сторінці обмежуються поточним демо-користувачем. Перевірка власника виконується на backend для читання, оновлення й видалення; приховування елементів UI не використовується як механізм безпеки.
