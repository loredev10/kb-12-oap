# Backend

Backend part of the course app.

## Stack

- Express
- TypeScript
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

TODO: verify the compiled output path used by the `start` script.

## Lint / Format

From the `backend` directory:

- `pnpm lint`
- `pnpm format`

## Notes

This backend is being developed as part of Laboratory Work #2.

Current functionality:

- basic Express server
- `/health` endpoint

TODO:
- add routes for Users
- add routes for AccessRequests
- add routes for Approvals
- define DTOs
- add validation
- add layered structure (`routes`, `controllers`, `services`, `repositories`)