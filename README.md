# kb-12 OAP My Course App

My course monorepo. I build this app step by step.

## Overview

This repository contains two parts:

- `frontend/` — simple client-side part
- `backend/` — backend API built with Express and TypeScript

At this stage, the backend is configured with:

- Express
- TypeScript
- tsx
- ESLint
- Prettier

## Requirements

- Node.js
- fnm, nvm, or another Node version manager
- Corepack enabled
- pnpm

Use the Node.js version from `.nvmrc`.

Example with fnm:

- `fnm use`

Enable Corepack once on your machine:

- `corepack enable`

Activate the required pnpm version:

- `corepack prepare pnpm@10.32.1 --activate`

Verify:

- `pnpm -v`

## Install

From the repository root:

- `pnpm install`

## Run (dev)

From the repository root:

- `pnpm dev`

This runs:

- `backend/src/index.ts`

## Build

From the repository root:

- `pnpm build`

## Lint / Format

From the repository root:

* `pnpm test`

## Lint / Format (optional)

From the repository root:

* `pnpm lint`
* `pnpm format`

## Structure

- `frontend/` — UI
- `backend/` — API
- `backend/src/index.ts` — backend entry point
- `eslint.config.js` — ESLint configuration
- `tsconfig.json` — TypeScript configuration
- `.prettierrc.json` — Prettier configuration
- `README.md` — project documentation

## License

MIT
