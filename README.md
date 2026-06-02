# KB-12 OAP — Менеджер заявок на доступ до лабораторії

Наскрізний навчальний проєкт для лабораторних робіт з ОАП.

## Структура

```text
backend/   Express + TypeScript + SQLite
frontend/  Vite + TypeScript + Fetch API
docs/      матеріали звіту
```

## Локальний запуск

Встановити залежності:

```bash
pnpm install
```

Заповнити локальну SQLite-базу тестовими даними:

```bash
pnpm seed:backend
```

Запустити бекенд і фронтенд у різних терміналах:

```bash
pnpm dev:backend
pnpm dev:frontend
```

Адреси:

```text
Backend:  http://localhost:3000
Frontend: http://127.0.0.1:5500
```

## ЛР5 — уразливості й захист

У фінальній версії реалізовано чотири сценарії:

1. SQL Injection — параметризовані SQLite-запити;
2. Stored XSS — безпечний DOM-рендер через `textContent`;
3. Broken Access Control / IDOR — серверна перевірка власника заявки;
4. Security Misconfiguration — security headers, строгий CORS і production hardening.

Фінальний набір HTTP-перевірок:

```text
backend/http/lab5-security-regression.http
```

Автоматизована частина regression-перевірки:

```bash
pnpm security:regression
```

Перед її запуском бекенд має працювати у development-режимі, а тестові записи `1` і `2` мають існувати в локальній БД.

Чернетка звіту:

```text
docs/lab5/REPORT.md
```
