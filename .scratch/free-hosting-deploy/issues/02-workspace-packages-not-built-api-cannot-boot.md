# 02 — Workspace TS packages have no build output; API cannot boot via node/nest

**Status:** ready-for-human

## Context

Discovered during Task 12 (e2e verification) of the free-hosting refactor. Pre-existing, **not** caused by the WhatsApp/tick refactor.

`packages/db`, `packages/wa`, `packages/types` declare `"main": "./src/index.ts"` (raw TypeScript) with no `build` output wired into resolution (`packages/db` has no `dist`; `build` script is `tsc` but `main`/`types` still point at `src`). `apps/api` is compiled by `nest build` to CommonJS `dist/`, then `require('@gayatri/db')` resolves via the pnpm workspace symlink to `packages/db/src/index.ts`, which uses ESM `import` and is not transpiled.

Result:
- `node apps/api/dist/main.js` → `SyntaxError: Cannot use import statement outside a module` (at `@gayatri/db` `src/index.ts`).
- `nest start` → same failure.
- `scripts/start-api.sh` (prod start) and `scripts/dev-api.sh` are therefore both non-functional as written.

Running the API needs either (a) the workspace packages built to JS with `main`/`exports` pointing at the built output, or (b) a TS runtime loader for the whole process — but `tsx`/esbuild strips `emitDecoratorMetadata`, which breaks NestJS type-based DI in the type-injected modules (Catalog/Checkout/Admin), so a plain tsx run is not viable either.

## Impact

Blocks the actual free-hosting deploy (Render runs `node dist` / `npm start`). The tick-drain feature itself is verified at the unit/integration level (21 api + 13 wa tests, incl. a real NestJS DI bootstrap test) and the raw `CLAIM_SQL` is verified against live Postgres (claim/lease/SKIP-LOCKED/crash-safety scenarios all pass). What is *not* exercised end-to-end is the running HTTP process.

## Remaining

- Decide a packaging strategy, e.g.:
  - Add `tsup`/`tsc` build for `packages/{db,wa,types}` and set `main`/`types`/`exports` to `dist/` (with `prepare`/turbo `^build` ordering), or
  - Bundle workspace deps into the API build (e.g. nest + webpack `externals` off / `@nestjs/cli` `webpack: true`), or
  - Adopt a CJS-emitting TS runtime that preserves decorator metadata for the API entry.
- Wire it into `scripts/build.sh` / `start-api.sh` and the deploy runbook so `node dist/main.js` boots.
- Then re-run the full Task 12 HTTP smoke (checkout → POST /v1/internal/tick → WaLog QUEUED→SENT via OpenWA stub).

## Done when

`node apps/api/dist/main.js` boots cleanly from a built workspace; the Task 12 HTTP flow (checkout creates QUEUED WaLog; authorized tick drains it to SENT with provider=openwa; unauthorized tick = 401) passes against a live DB + OpenWA stub.
