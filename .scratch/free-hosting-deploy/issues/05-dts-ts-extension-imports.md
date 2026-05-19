# 05 — Emitted .d.ts files carry `.ts` import extensions

**Status:** ready-for-agent

## Context

`packages/wa/src` and `packages/types/src` write relative imports with explicit `.ts` extensions (e.g. `export * from './gateway.ts'`). `rewriteRelativeImportExtensions` rewrites these to `.js` in emitted **JS**, but NOT in emitted **.d.ts** declarations — so `packages/wa/dist/index.d.ts` contains `export * from './gateway.ts'` while only `gateway.d.ts` exists on disk.

Benign today: `apps/api` (and others) inherit `skipLibCheck: true`, so tsc reads symbols from the `.d.ts` without type-checking the declaration's own import paths. Issue-02 e2e + `tsc --noEmit` all pass.

Latent fragility: if `skipLibCheck` is ever set false, consumers fail resolving `./gateway.ts` (no such file in dist).

## Remaining

- Rewrite relative imports in `packages/wa/src/**` and `packages/types/src/**` as extensionless (`from './gateway'`) — keeps JS + d.ts clean under `moduleResolution: Node`. Adjust `packages/wa/jest.config.cjs`/`jest.resolver.cjs` if the resolver keyed on `.ts`/`.js` needs updating; keep wa 13 + api 21 tests green.
- Rebuild, confirm `dist/*.d.ts` have no `.ts`/`.js`-less mismatch and `apps/api tsc --noEmit` stays 0 (try also with skipLibCheck disabled locally as a check).

## Done when

`packages/{wa,types}/dist/**/*.d.ts` contain no `./*.ts` import specifiers; all suites green; API still boots from `node apps/api/dist/main.js`.
