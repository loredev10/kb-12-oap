# kb-12 OAP My Course App

My course monorepo. I'll build this app step by step.

## Requirements

* Node.js LTS. Version is pinned in `.nvmrc`.

### Node version manager

Any manager (fnm/nvm/asdf). Example with fnm:

* `fnm use`

### Package manager (pnpm via Corepack)

This repo uses pnpm. The pnpm version is pinned in `package.json` via the `packageManager` field.

One-time (on your machine):

* `corepack enable`

Activate the required pnpm version:

* `corepack prepare pnpm@10.32.1 --activate`

Verify:

* `pnpm -v`

## Install

From the repository root:

* `pnpm install`

## Run (dev)

From the repository root:

* `pnpm dev`

## Build

From the repository root:

* `pnpm build`

## Tests

From the repository root:

* `pnpm test`

## Lint / Format (optional)

From the repository root:

* `pnpm lint`
* `pnpm format`

## Structure

* `frontend/` — UI
* `backend/` — API
* `README.md`

## License

MIT
