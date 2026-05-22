# kb-12 OAP My Course App

Course monorepo with separate frontend and backend parts.

Project topic: **Менеджер заявок на доступ до лабораторії**.

The application consists of two separate parts:

- `frontend/` — client-side application built with HTML, CSS, TypeScript and Vite;
- `backend/` — REST API built with Express, TypeScript and SQLite.

The frontend and backend are started as **separate processes** and communicate only through HTTP API requests.

---

## Сутності, реалізовані в проєкті

У поточній версії застосунку реалізовано три сутності.

### 1. `Users`

Сутність користувачів системи.

Використовується для зберігання інформації про осіб, які можуть подавати заявки на доступ до лабораторії.

Основні поля:

- `id`
- `fullName`
- `email`
- `role`
- `notes`

Дозволені ролі користувача:

```text
student
teacher
lab_assistant
admin
```

### 2. `AccessRequests`

Основна доменна сутність застосунку — заявки на доступ до лабораторії.

Початково вона розглядалася як сутність із полями `Date` і `Comments`, але в реалізації була розширена до практичнішої моделі із часовим інтервалом доступу.

Основні поля:

- `id`
- `userId`
- `startDateTime`
- `endDateTime`
- `comments`
- `status`

Дозволені статуси заявки:

```text
pending
approved
rejected
```

### 3. `Approvals`

Сутність погоджень заявок.

Використовується для зберігання інформації про рішення щодо заявки на доступ.

---

## Structure

```text
.
├── backend/
│   └── src/
│       ├── app.ts
│       ├── index.ts
│       ├── routes/
│       ├── middleware/
│       ├── db/
│       └── migrations/
│
├── frontend/
│   ├── index.html
│   ├── access-requests.html
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   └── src/
│       ├── apiClient.ts
│       ├── config.ts
│       ├── dtos.ts
│       ├── users.page.ts
│       ├── accessRequests.page.ts
│       └── styles.css
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Requirements

- Node.js version from `.nvmrc`
- Corepack
- pnpm

Check versions:

```bash
node -v
pnpm -v
```

If pnpm is not available, enable it through Corepack:

```bash
corepack enable
corepack prepare pnpm@10.32.1 --activate
```

---

## Workspace install

From the repository root:

```bash
pnpm install
```

---

## Available packages

- `frontend/`
- `backend/`

---

## Available commands

Commands are defined in the root `package.json`.

### Backend

Run backend in development mode:

```bash
pnpm dev:backend
```

Build backend:

```bash
pnpm build:backend
```

Run TypeScript type checking for backend:

```bash
pnpm type-check:backend
```

Start compiled backend build:

```bash
pnpm start:backend
```

Check backend code with ESLint:

```bash
pnpm lint:check:backend
```

Fix backend lint issues automatically:

```bash
pnpm lint:fix:backend
```

Check backend formatting with Prettier:

```bash
pnpm format:check:backend
```

Format backend code automatically:

```bash
pnpm format:fix:backend
```

### Frontend

Run frontend in development mode:

```bash
pnpm dev:frontend
```

Build frontend:

```bash
pnpm build:frontend
```

Run TypeScript type checking for frontend:

```bash
pnpm type-check:frontend
```

Start frontend preview build:

```bash
pnpm start:frontend
```

Check frontend code with ESLint:

```bash
pnpm lint:check:frontend
```

Fix frontend lint issues automatically:

```bash
pnpm lint:fix:frontend
```

Check frontend formatting with Prettier:

```bash
pnpm format:check:frontend
```

Format frontend code automatically:

```bash
pnpm format:fix:frontend
```

---

## Full local run

Use two terminal windows.

### Terminal 1 — backend

From the repository root:

```bash
pnpm dev:backend
```

Backend API:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/health
```

### Terminal 2 — frontend

From the repository root:

```bash
pnpm dev:frontend
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

---

## Frontend package scripts

The frontend package contains Vite-based scripts.

From the `frontend/` directory:

```bash
pnpm dev
```

Runs the frontend development server:

```text
http://127.0.0.1:5500
```

Type checking:

```bash
pnpm type-check
```

Production build:

```bash
pnpm build
```

Preview production build:

```bash
pnpm build
pnpm preview
```

or:

```bash
pnpm build
pnpm start
```

The `start` script is an alias for previewing the production build. It should be used after `pnpm build`.

---

## API configuration

The frontend API base URL is configured in:

```text
frontend/src/config.ts
```

Current value:

```ts
export const API_BASE_URL = "http://localhost:3000/api/v1";
```

If the backend runs on another port or without the `/api/v1` prefix, this value must be changed.

---

## API versioning

The project uses API versioning through the `/api/v1` prefix.

Main API routes:

```text
/api/v1/users
/api/v1/access-requests
/api/v1/approvals
```

Old non-versioned routes may exist for backward compatibility, but the frontend uses only `/api/v1`.

---

## Backend API endpoints used by frontend

### Users

```text
GET    /api/v1/users?status=active
GET    /api/v1/users/:id
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
  "userId": 1,
  "startDateTime": "2026-05-15T10:00",
  "endDateTime": "2026-05-15T12:00",
  "status": "pending",
  "comments": "Потрібен доступ для виконання практичної роботи"
}
```

---

## DTO contracts

Frontend DTO types are described in:

```text
frontend/src/dtos.ts
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

---

## DTO compatibility rules

The API follows simple backward compatibility rules for `/api/v1`.

1. Existing fields used by the frontend must not be renamed or removed in `/api/v1`.
2. Existing field types must not be changed in `/api/v1`.
3. New fields may be added only as optional fields or with default values.
4. Breaking changes must be introduced only through a new API version, for example `/api/v2`.
5. The frontend should use fallback values for optional fields, for example `notes || "—"`.

Examples of breaking changes:

```text
fullName -> name
id: number -> id: string
removing status from AccessRequestResponseDto
moving userFullName into user.fullName without introducing /api/v2
```

Examples of compatible changes:

```text
adding optional field createdAt
adding optional field updatedAt
adding optional field userEmail to joined response
```

---

## Error handling

The backend returns errors in a stable JSON format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": []
  }
}
```

The frontend handles errors in:

```text
frontend/src/apiClient.ts
```

The frontend normalizes backend errors into `ApiClientError` and displays readable messages in the UI.

Handled error scenarios:

- HTTP errors such as `400`, `404`, `409`, `500`;
- backend validation errors with `details`;
- network errors;
- CORS errors;
- request timeout.

---

## Frontend request timeout

The frontend uses `AbortController` in `apiClient.ts` to prevent requests from hanging forever.

Current behavior:

```text
timeout: 10 seconds
```

If the backend does not respond within 10 seconds, the frontend returns an error with code:

```text
REQUEST_TIMEOUT
```

Expected user-facing message:

```text
Запит перевищив таймаут.
```

This is required for the advanced reliability part of Lab 4.

---

## CORS requirement

Because frontend and backend run on different ports, they have different origins.

Frontend origin:

```text
http://127.0.0.1:5500
```

Backend origin:

```text
http://localhost:3000
```

These are different origins, so CORS must be configured on the backend.

Expected backend CORS configuration:

```ts
const corsOptions: cors.CorsOptions = {
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
```

Important: CORS middleware must be registered before API routes.

Correct order:

```ts
app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/access-requests", accessRequestsRouter);
```

---

## Frontend UI states

The frontend handles the following UI states:

- `loading` — data is being loaded;
- `success` — data was loaded successfully;
- `empty` — there are no records;
- `error` — the backend returned an error or the request failed.

Examples:

- while data is loading, the UI displays `Завантаження...`;
- if there are no records, the UI displays an empty state message;
- if the backend is unavailable, the UI displays a network/CORS error;
- if the backend returns validation errors, the UI displays backend error details.

---

## Frontend validation and backend validation test mode

The frontend has client-side validation for forms.

For testing backend validation, the Users form contains a special checkbox:

```text
Вимкнути фронтенд-валідацію для тесту бекенду
```

When this checkbox is enabled, the frontend sends invalid data directly to the backend.

This allows testing backend validation errors such as:

```text
400 VALIDATION_ERROR
```

This scenario is useful for demonstrating that validation exists both on the frontend and on the backend.

---

## Manual test scenarios for Lab 4

### 1. Load users

1. Start backend:

   ```bash
   pnpm dev:backend
   ```

2. Start frontend:

   ```bash
   pnpm dev:frontend
   ```

3. Open:

   ```text
   http://127.0.0.1:5500/
   ```

Expected result:

- frontend sends `GET /api/v1/users?status=active`;
- users are rendered in the table;
- no CORS error appears in DevTools Console.

---

### 2. View user details

1. Open the Users page.
2. Click the `Деталі` button in the users table.

Expected result:

- frontend sends `GET /api/v1/users/:id`;
- user details are displayed below the table.

---

### 3. Create user

1. Fill in the user form with valid data.
2. Click `Додати`.

Expected result:

- frontend sends `POST /api/v1/users`;
- backend returns `201 Created`;
- list is reloaded.

---

### 4. Backend validation error

1. Enable the checkbox:

   ```text
   Вимкнути фронтенд-валідацію для тесту бекенду
   ```

2. Send invalid data, for example:
   - short name;
   - invalid email;
   - missing role;
   - invalid notes length.

Expected result:

- frontend sends `POST /api/v1/users`;
- backend returns `400`;
- frontend displays backend validation details.

---

### 5. Network / CORS error

1. Stop the backend.
2. Reload the frontend page.

Expected result:

- frontend shows a network/CORS error;
- UI does not crash.

---

### 6. Delete user

1. Click `Видалити`.
2. Confirm deletion.

Expected result:

- frontend sends `DELETE /api/v1/users/:id`;
- backend returns `204 No Content`;
- list is reloaded.

---

### 7. Load access requests

1. Open:

   ```text
   http://127.0.0.1:5500/access-requests.html
   ```

Expected result:

- frontend sends `GET /api/v1/access-requests/with-users?status=active&limit=100`;
- access requests are rendered in the table;
- related user data is displayed.

---

### 8. Create access request

1. Select a user.
2. Fill in start and end date/time.
3. Select status.
4. Enter comments.
5. Click `Додати`.

Expected result:

- frontend sends `POST /api/v1/access-requests`;
- backend returns `201 Created`;
- list is reloaded.

---

### 9. Delete access request

1. Click `Видалити`.
2. Confirm deletion.

Expected result:

- frontend sends `DELETE /api/v1/access-requests/:id`;
- backend returns `204 No Content`;
- list is reloaded.

---

### 10. Request timeout

To test timeout behavior, temporarily stop or delay the backend response.

Expected result:

- frontend aborts the request after 10 seconds;
- frontend shows timeout error;
- UI does not crash.

---

## API request examples for verification

These examples can be used to verify backend API behavior independently from the frontend.

Base API URL:

```text
http://localhost:3000/api/v1
```

### Health check

```bash
curl -i http://localhost:3000/health
```

Expected result:

```text
HTTP/1.1 200 OK
```

Response body example:

```json
{
  "ok": true
}
```

### Get users list

```bash
curl -i "http://localhost:3000/api/v1/users?status=active"
```

Expected result:

```text
HTTP/1.1 200 OK
```

Response body example:

```json
{
  "items": []
}
```

### Get user by id

```bash
curl -i http://localhost:3000/api/v1/users/1
```

Expected result:

```text
HTTP/1.1 200 OK
```

or, if the user does not exist:

```text
HTTP/1.1 404 Not Found
```

### Create user

```bash
curl -i -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Павло Іваненко",
    "email": "pavlo@example.com",
    "role": "student",
    "notes": "Потрібен доступ до лабораторії"
  }'
```

Expected result:

```text
HTTP/1.1 201 Created
```

### Create user with validation error

```bash
curl -i -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "A",
    "email": "wrong-email",
    "role": "",
    "notes": "abc"
  }'
```

Expected result:

```text
HTTP/1.1 400 Bad Request
```

Response body example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": []
  }
}
```

### Delete user

```bash
curl -i -X DELETE http://localhost:3000/api/v1/users/1
```

Expected result:

```text
HTTP/1.1 204 No Content
```

or, if the user does not exist:

```text
HTTP/1.1 404 Not Found
```

### Get access requests with users

```bash
curl -i "http://localhost:3000/api/v1/access-requests/with-users?status=active&limit=100"
```

Expected result:

```text
HTTP/1.1 200 OK
```

Response body example:

```json
{
  "items": []
}
```

### Create access request

```bash
curl -i -X POST http://localhost:3000/api/v1/access-requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "startDateTime": "2026-05-15T10:00",
    "endDateTime": "2026-05-15T12:00",
    "status": "pending",
    "comments": "Потрібен доступ для виконання практичної роботи"
  }'
```

Expected result:

```text
HTTP/1.1 201 Created
```

### Delete access request

```bash
curl -i -X DELETE http://localhost:3000/api/v1/access-requests/1
```

Expected result:

```text
HTTP/1.1 204 No Content
```

### CORS verification in browser

CORS should be verified from the frontend page, not only with curl.

Start backend:

```bash
pnpm dev:backend
```

Start frontend:

```bash
pnpm dev:frontend
```

Open:

```text
http://127.0.0.1:5500
```

Then open DevTools:

```text
DevTools -> Network -> Fetch/XHR
```

Expected result:

- requests to `http://localhost:3000/api/v1/...` are visible;
- responses have successful HTTP statuses;
- no CORS error appears in Console.

### Network error scenario

Stop the backend and reload the frontend page.

Expected result:

- frontend shows a network/CORS error;
- UI does not crash.

### Timeout scenario

If the backend response is delayed for more than 10 seconds, the frontend aborts the request with `AbortController`.

Expected result:

```text
REQUEST_TIMEOUT
```

User-facing message:

```text
Запит перевищив таймаут.
```

---

## Project architecture

### Backend

- `index.ts` — application entry point, starts the server.
- `app.ts` — creates and configures Express application.
- `routes/` — API routes.
- `middleware/logger.ts` — request logging.
- `middleware/error-handler.ts` — centralized error handling.
- `middleware/not-found.ts` — handles unknown routes.
- `db/` — SQLite connection, migrations and database helpers.
- `migrations/` — numbered SQL migrations.

### Frontend

- `index.html` — Users page.
- `access-requests.html` — Access Requests page.
- `src/config.ts` — API base URL.
- `src/dtos.ts` — frontend DTO types.
- `src/apiClient.ts` — HTTP client, response parsing, error handling, timeout.
- `src/users.page.ts` — Users page logic.
- `src/accessRequests.page.ts` — Access Requests page logic.
- `src/styles.css` — shared styles.
