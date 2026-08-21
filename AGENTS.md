# Repository Guidelines

## Project Structure & Module Organization

This Vite + React 19 + TypeScript frontend stores runtime code in `src/`:

- `src/app/` contains application entry points, routing, and shared layouts.
- `src/features/` contains business modules (`auth`, `chat`, `document`, and `struct`), grouped by `api`, `components`, `hooks`, `pages`, `store`, and `types` as needed.
- `src/shared/` contains reusable UI primitives, hooks, stores, types, and HTTP, SSE, storage, and formatting utilities.
- `src/mocks/` contains MSW handlers and fixture data; `public/` contains the generated service worker and other static assets.

Keep feature code self-contained. Use the `@/` alias for cross-feature imports and relative imports within a feature. Do not make business modules depend on the `app` layer.

## Build, Test, and Development Commands

Use pnpm (`pnpm@10.12.0`); commit `pnpm-lock.yaml` updates with dependency changes.

- `pnpm install` installs dependencies.
- `pnpm dev` starts Vite against the configured backend.
- `pnpm dev:mock` regenerates the MSW worker and starts the mock-backed app.
- `pnpm build` runs the TypeScript project build and creates the production bundle.
- `pnpm preview` serves the production bundle locally.
- `pnpm lint` runs ESLint across the repository.
- `pnpm test`, `pnpm test:watch`, and `pnpm test:coverage` run Vitest once, in watch mode, or with coverage.

Copy `.env.example` to a local environment file as appropriate; never commit secrets. `VITE_ENABLE_MOCK=true` enables browser mocks during development.

## Coding Style & Naming Conventions

Format with Prettier: two-space indentation, single quotes, no semicolons, 100-column width, and Tailwind class sorting. ESLint treats explicit `any` and unused variables as errors; prefix intentionally unused arguments with `_`. Use PascalCase for React components, camelCase for functions and variables, and descriptive filenames such as `useDocuments.ts` or `DocumentList.tsx`.

## Testing Guidelines

Vitest is the configured test runner. Place tests next to exercised code using `*.test.ts` or `*.test.tsx`; cover API hooks, state transitions, and user-facing behavior. Run `pnpm test` and `pnpm lint` before submitting. No test files are currently committed, so new behavior should add focused tests rather than rely on an unrecorded coverage threshold.

## Commit & Pull Request Guidelines

Follow the existing Conventional Commit style, for example `refactor(chat): ...` or `chore(project): ...`; keep scope specific and the subject imperative. Pull requests should explain the user-visible change, identify affected modules, link the issue/specification, and include screenshots or recordings for UI changes. Note environment, mock-data, or migration steps and confirm lint, tests, and build status.
