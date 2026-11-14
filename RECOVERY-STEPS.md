# SG16 Finance — recovery checklist (2026-11-14)

**How this works:** everything in **Part A** is already done in git by me and pushed to
`arena/8cffe4fa-sg16finance`. **Part B** is the part only you can do, because it needs the
Cloudflare dashboard and the provider accounts. Do the steps **in order** — Step 0 must
happen before anything is changed.

Never paste API tokens, secrets or passwords into chat. Put them only in the Cloudflare
dashboard or in a local `.dev.vars` / `.env.local` (both are gitignored).

---

## Part A — already done in git (by me)

| Change | Why |
|---|---|
| `FORENSIC-AUDIT-2026-11-14.md` | Full findings and evidence for your police file. |
| `RECOVERY-STEPS.md` (this file) | Your checklist. |
| `src/lib/market.ts` + `/api/quotes` + `/api/dashboard` | Delayed quotes now report the **real** `quote_history` timestamp instead of `Date.now() - 15min`. New `dataAsOf` + `stale` fields so a dead ingest can never be presented as fresh again. |
| `src/app/api/version/route.ts`, `vite.config.ts`, `src/types/cloudflare-workers.d.ts` | Every build is stamped with its git commit; `/api/version` lets you prove Cloudflare == git. |
| `tools/verify-deploy.mjs` + `npm run verify:deploy` | One command, no credentials, checks health, build drift, stale cron build, data freshness, Turnstile and edge config. |
| `cron-worker/tsconfig.json` + root `tsconfig.json` + `package.json` | `npm run typecheck` now passes the app **and** the cron Worker (was 11 errors). |
| `.github/workflows/ci.yml` | Verify-only CI (lint, typecheck, 25 tests, build). **No deploy**, no Cloudflare tokens in GitHub — so the old red X cannot come back. |
| `.env.example`, `README.md`, `OPS-RUNBOOK.md` | Complete secret inventory, correct D1 name, Node >= 22.23, verification instructions. |

Verified locally at HEAD: `npm ci` OK, `npm run lint` OK, `npm test` 25/25 OK,
`npm run typecheck` OK, `npm run build:vinext` OK.

---

## Part B — your steps

### STEP 0 — Preserve evidence FIRST (before touching anything)
Do this today; logs expire.

- [ ] GitHub → Actions → download logs for runs `38614800773`, `38615261647` and the older failed runs (Actions logs are retained ~90 days; October is close).
- [ ] Cloudflare → **Audit Log** → export 2026-10-09 → 2026-11-14. This is the single most important item for the police report: it shows who deployed/changed secrets/bindings/projects and when.
- [ ] Cloudflare → Workers & Pages → screenshot **both** project cards including their exact names/IDs (the "SG 16 Finance" and "SG 16 Finance Conns" pages).
- [ ] Export Workers Builds deployment history + build logs, zone HTTP analytics, D1 metrics, Workers Logs and Security Events for the same period.
- [ ] Take a **D1 backup/snapshot** of `sg16finance-db` before any repair.
- [ ] Export Dodo Payments, Resend and Finnhub **webhook delivery logs** for 2026-10-09 → 2026-11-14.
- [ ] Keep `FORENSIC-AUDIT-2026-11-14.md` and this file with the case documents.

### STEP 1 — Secure the accounts (do this before the developer leaves)
- [ ] Revoke Cloudflare API tokens, including the one named `qwen-ops-temp-2026-10-30` (PR #1 asked for this on 2026-10-29; it is still referenced in the docs).
- [ ] Revoke GitHub PATs / deploy keys / SSH keys you do not recognise; remove extra collaborators; enforce 2FA.
- [ ] **Rotate every Worker secret**: `SESSION_SECRET`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, `RESEND_API_KEY`, `DODO_API_KEY`, `DODO_WEBHOOK_SECRET`, `FINNHUB_WEBHOOK_SECRET`, `FINNHUB_API_KEY`, `SG16_BRAIN_KEY`, `MISTRAL_API_KEY`. (Rotating `SESSION_SECRET` logs everyone out — fine during maintenance.)
- [ ] Confirm `AUTH_DEV_LOG_CODE` and `CRON_SECRET` are **NOT** present on any production Worker. `AUTH_DEV_LOG_CODE=1` would print users' login codes into logs.
- [ ] Confirm you alone control: Cloudflare account, the domain `sg16finance.com`, the GitHub org `sg16global`, and the Dodo / Resend / Finnhub accounts.
- [ ] Optional but recommended: make the GitHub repo **private** — it is currently public and contains the full security runbook, the D1 UUID and the product IDs.

### STEP 2 — Get these fixes onto the branch Cloudflare builds
- [ ] Merge the pull request I opened from `arena/8cffe4fa-sg16finance` → `main` (link in my message). If you prefer, cherry-pick the commit onto `main` yourself.
- [ ] Note: my session is fixed to the `arena/8cffe4fa-sg16finance` branch, so I cannot push directly to `main`. Merging the PR is the one-click step that makes Workers Builds pick up the fixes.
- [ ] After merging, GitHub → Actions should show a **green "CI"** check on `main`. That is the new, correct status (the old red X on `a56a784` is historical and will stay there forever — ignore it).

### STEP 3 — Fix the Cloudflare Workers Builds settings (the actual root cause)
Cloudflare dashboard → **Workers & Pages → sg16finance → Settings → Build**:

| Setting | Exact value |
|---|---|
| Production branch | `main` |
| Root directory | `/` |
| Build command | `npm run build:vinext` |
| Deploy command (production) | `npx cf deploy --prebuilt` |
| Deploy command (preview / non-production) | `npx cf previews deploy --prebuilt` |
| Node version | `22.23.0` or newer 22.x (>= 22.23, or 24.22+, or 26.12+) |

- [ ] **Never use `wrangler deploy` / `wrangler preview` on this project** while `.cloudflare/output` exists — current Wrangler hard-errors and the deploy aborts (this is why the project looked "empty" from 15 Oct to 12 Nov).
- [ ] If there is a second, Git-connected project ("SG 16 Finance Conns") with no deployments, either point it at `main` with the same settings or **delete it** so it cannot confuse the audit. Screenshot it before deleting.

### STEP 4 — Check the main Worker's bindings and secrets
Cloudflare → `sg16finance` → Settings → Variables / Bindings:

- [ ] D1 binding `DB` → database id `8671a510-3431-41ad-be92-cdcb3faa3f72`, **bound by id only** (no `name` field — `dd8b521` fixed this; including the name makes `cf deploy` see a destructive diff and abort).
- [ ] `AI` binding present, and the three rate-limit bindings `RL_ACCESS` (1001), `RL_CHECKOUT` (1002), `RL_AUTH` (1003).
- [ ] Declared secrets present: `SESSION_SECRET`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`. `cloudflare.config.ts` declares these, so `cf deploy` **fails if any is missing**.
- [ ] Also set (dashboard-only, not declared): `RESEND_API_KEY`, `DODO_API_KEY`, `DODO_WEBHOOK_SECRET`, `FINNHUB_WEBHOOK_SECRET`, `SUPPORT_NOTIFY_EMAIL`, optional `MISTRAL_API_KEY` / `SG16_BRAIN_KEY`. See `.env.example` for the full list.
- [ ] Custom domains `sg16finance.com` and `www.sg16finance.com` still attached; disconnect the **legacy Pages `dist` project** if it is still serving traffic (README has warned about it since October).

### STEP 5 — Redeploy the CRON Worker (this is what restores live data)
- [ ] From the repo, inside `cron-worker/`: `npm run deploy:cron` (i.e. `npx wrangler deploy` using `cron-worker/wrangler.jsonc`).
- [ ] Ensure `FINNHUB_API_KEY` is set on `sg16finance-cron` (the main Worker does not need it).
- [ ] Confirm triggers are `"* * * * *"` (ingest every minute) and `"0 3 * * *"` (daily cleanup).
- [ ] Confirm the deployed source is the **direct-D1 version** (`cron-worker/src/index.ts` calling `ingestMinute`), NOT the 12 Nov HTTP-POST experiment that called `/api/cron`.
- [ ] Do **not** set `CRON_SECRET` anywhere; it belongs to the discarded experiment.

### STEP 6 — Turn off the challenge that blocks webhooks
- [ ] Cloudflare zone `sg16finance.com` → **Security → Bots → Bot Fight Mode: OFF**. `OPS-RUNBOOK.md` measured it challenging *all* traffic including Dodo/Finnhub webhook POSTs on the Free plan.
- [ ] Keep Security Level = Medium. The app already does Turnstile, per-IP rate limits and HMAC webhook verification.
- [ ] Check `curl -sI https://sg16finance.com/api/health` → **200**, with **no** `cf-mitigated` header.

### STEP 7 — Deploy, then verify
- [ ] In Workers Builds press **Retry deployment** on the latest build (or push an empty commit to `main`).
- [ ] Wait for the deploy to finish, then on your machine:

```bash
git checkout main && git pull
npm ci
npm run verify:deploy
```

Expected: `PASS health / D1 binding`, `PASS build identity` (deployed SHA == your local SHA),
`PASS stale /api/cron build gone`, `PASS market-data ingest`, `PASS truthful quote timestamps`,
`PASS API stale flag`, `PASS Turnstile / sign-in config`.

- [ ] If `build identity` shows a mismatch → Cloudflare is still serving an old build; retry the deploy.
- [ ] If `/api/cron` is still 405 → the 12 Nov build is still live; force a fresh deploy.
- [ ] If `market-data ingest` FAILs → the cron Worker is not writing D1; check its logs and `FINNHUB_API_KEY`.
- [ ] After ~2 minutes, re-check `/api/dashboard`: `updatedAt` should advance every minute and `stale` should be `false`.

### STEP 8 — Make the affected users whole (important for the police file)
- [ ] From the Dodo webhook logs you exported, list payments between 2026-10-15 and 2026-11-14 whose webhook was challenged/failed.
- [ ] Compare with `access_passes` in D1. For anyone charged but not granted a pass: restore the pass manually or refund. Keep the reconciliation table as evidence.
- [ ] Re-send/reset email-verification for anyone locked out; check Resend delivery failures.
- [ ] Publish a short status note to users explaining the stale market data and the fix.
- [ ] Give your lawyer / the police: `FORENSIC-AUDIT-2026-11-14.md`, the git log, the Cloudflare Audit Log export, the deploy logs, and this reconciliation table. The audit found **no evidence of hacking or data theft** — it documents a change-control failure — so the report should help clarify what actually happened.

### STEP 9 — Stop it recurring
- [ ] Enable **Workers Logs** + zone Security Events email alerts.
- [ ] Enable **D1 backups** and alert on `stale: true` from `/api/quotes` (a 5-minute external monitor is enough).
- [ ] Require pull requests for `main`; no more "Add files via upload" straight to production.
- [ ] After every deploy, run `npm run verify:deploy` and keep its output.
- [ ] Have counsel correct the public claims in `src/app/privacy/page.tsx`, `src/app/premium/page.tsx`, `src/app/about/page.tsx` and the hard-coded prices in `src/components/LiveTickerBar.tsx` (see Section 6 of the audit). Those pages currently claim PostgreSQL, SOC-2, sub-second/FIX feeds and GDPR/CCPA compliance that the system does not provide.

---

## If you want me to continue

Connect the Cloudflare account in Arena, or attach the exported Audit Log / Workers Builds
logs / D1 snapshot, and I can verify the second project, the exact failed deploys and the
webhook losses. I can also implement the front-end "stale data" banner and the marketing-copy
corrections as a follow-up commit on this same branch.
