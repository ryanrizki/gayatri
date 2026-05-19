# 06 — Dev/runtime Node 18 vs declared engines >=20

**Status:** ready-for-human

## Context

Root `package.json` declares `engines: { "node": ">=20" }`. The environment runs Node 18.19.1, so every `pnpm`/`corepack pnpm` command prints `WARN Unsupported engine`. Pre-existing, unrelated to the WA refactor; surfaced repeatedly during this work.

Risk: Node 18 is EOL; some deps may assume 20+. Build/tests currently pass on 18, but the mismatch is a deploy hazard (Render images, CI) and noise.

## Remaining

- Decide: upgrade dev/CI/deploy runtime to Node 20 LTS (preferred — matches engines, aligns with OpenWA's Node 22 too), OR relax the engines constraint to the actually-supported floor.
- Pin the Node version (`.nvmrc` / `engines` / Render runtime) consistently across dev, CI, and the free-hosting deploy runbook (see issue 04).

## Done when

`corepack pnpm` runs without the unsupported-engine warning and the deploy target's Node version is pinned and documented.
