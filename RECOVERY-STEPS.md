# SG16 Finance — recovery checklist (updated 2026-11-15, after dashboard evidence)

**STATUS (2026-11-15): EVIDENCE CLOSED — REPAIR PHASE ACTIVE.** The owner confirmed that
Cloudflare's "Manage" button opens GitHub App installation
[`138713841`](https://github.com/settings/installations/138713841) — there is **no second
project and no separate Connections page**. "SG 16 Finance Conns" is that Git connection.
See Addendum 5 of `FORENSIC-AUDIT-2026-11-14.md`.

**Part A** is committed and pushed by me on `arena/8cffe4fa-sg16finance`
(PR #2 → [`sg16global/sg16finance/pull/2`](https://github.com/sg16global/sg16finance/pull/2)).
**Part B** needs the Cloudflare dashboard and the provider accounts. Do the steps **in
order**.

> This version replaces the earlier checklist. Dashboard screenshots proved that the
> **production deploy command was already correct** and that the **main Worker already
> matches git `main`**. The broken part is the **cron Worker + a leftover zone route**.
> See "Addendum 2 — CORRECTIONS" in `FORENSIC-AUDIT-2026-11-14.md`.

Never paste API tokens, secrets or passwords into chat. Put them only in the Cloudflare
dashboard or in a local `.dev.vars` / `.env.local` (both gitignored).

---

## ⚡ DO NOW — exact order (repair phase)

| # | Who | Action |
|---|---|---|
| **1** | **YOU** | Rotate all Worker secrets + Cloudflare/GitHub tokens; **delete `CRON_SECRET` on both Workers**; add `_dmarc.sg16finance.com` TXT + root SPF; scope GitHub App installation `138713841` to the 7 Workers-Builds repos (Step 1). Do **not** Suspend/Uninstall the app. |
| **2** | **ME** | Merge **PR #2 → `main`**. Done on this turn — see the merge commit in the PR. Production build expected to succeed; wait for it in Cloudflare → `sg16finance` → Deployments. |
| **3** | **YOU** | `sg16finance` → Settings → Builds → **Previews Base** → deploy command `npx cf previews deploy --prebuilt` (Step 3). |
| **4** | **YOU — THE MAIN FIX** | `sg16finance-cron` → Domains → **delete route `sg16finance.com/api/cron*`**. Then from the repo root run `npm run deploy:cron` (Step 5). |
| **5** | **YOU** | Zone → Security → Bots → **Bot Fight Mode OFF** (Step 6). |
| **6** | **YOU** | `git checkout main && git pull && npm ci && npm run verify:deploy` → all PASS; `/api/dashboard` `updatedAt` must advance every minute (Step 7). |
| **7** | **YOU** | Reconcile charged-but-not-granted users from Dodo logs on **both** `sg16finance.com` and `payments.saiftechglobal.com`; enable branch protection on `main` + monitoring (Steps 8–9). |

**If only one thing gets done today, make it #4** — deleting that route and redeploying the
cron Worker is what restores live market data. #2 alone makes the site *honest* about stale
data (`stale: true`, real timestamps) but does not restart the ingest.

---

## Part A — already done in git (by me)

| Change | Why |
|---|---|
| `FORENSIC-AUDIT-2026-11-14.md` | Findings + Addendum 2 (dashboard evidence and corrections) for your police file. |
| `RECOVERY-STEPS.md` (this file) | Your checklist. |
| `src/lib/market.ts` + `/api/quotes` + `/api/dashboard` | Delayed quotes now report the **real** `quote_history` timestamp instead of `Date.now() - 15min`. New `dataAsOf` + `stale` fields so a dead ingest can never be presented as fresh. |
| `src/app/api/version/route.ts`, `vite.config.ts`, `src/types/cloudflare-workers.d.ts` | Every build is stamped with its git commit; `/api/version` proves Cloudflare == git. |
| `tools/verify-deploy.mjs` + `npm run verify:deploy` | Read-only post-deploy check: health, build SHA, stale `/api/cron`, ingest freshness, truthful timestamps, Turnstile, edge config. |
| `cron-worker/tsconfig.json` + root `tsconfig.json` + `package.json` | `npm run typecheck` passes for app **and** cron Worker (was 11 errors). |
| `.github/workflows/ci.yml` | Verify-only CI (lint, typecheck, 25 tests, build). **No deploy**, no Cloudflare tokens in GitHub. |
| `.env.example`, `README.md`, `OPS-RUNBOOK.md` | Complete secret inventory, correct D1 name, Node >= 22.23, verification instructions. |

Verified: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` 25/25,
`npm run build:vinext`. PR #2 CI is **green** (`CI / verify (pull_request)` and
`CI / verify (push)`). The red check on PR #2 is a **Preview Deployment**, not CI.

---

## What the dashboard proved (so you know what NOT to change)

| Item | Actual state (verified 2026-11-15 screenshots) |
|---|---|
| `sg16finance` production build | `main`, build `npm run build:vinext`, deploy `npx cf deploy --prebuilt --mode production`, root `/` — **already correct, leave it alone**. |
| Main Worker version | `62c57971-e6fb-48d2-aaa9-8237ccbfaa19` (build `f6cba5f3`, 12 Nov 23:52 UTC, **Ready**) = commit `dd8b521` = current `main`. |
| Custom domains | `sg16finance.com` + `www.sg16finance.com` attached to `sg16finance`; DNS has two proxied `Worker` records. |
| Bindings | `AI`, `DB → sg16finance-db` (`8671a510-3431-41ad-be92-cdcb3faa3f72`), `RL_ACCESS` 1001, `RL_CHECKOUT` 1002, `RL_AUTH` 1003 — all correct. |
| Secrets | `SESSION_SECRET`, `TURNSTILE_*`, `DODO_*`, `FINNHUB_*`, `RESEND_API_KEY` present. **`CRON_SECRET` is also present** (leftover). |
| `/api/version` = 404 | **Expected** — that route is only in PR #2, not `main`. Not a fault. |
| `/api/cron` = 405 | Served by the **cron Worker's route** `sg16finance.com/api/cron*`, not by the main Worker. |
| `sg16finance-cron` | 2 cron triggers, 1.44k invocations/24h, 0 errors, version `3dad27d5` "Manually deployed" 12/13 Nov, **plus the leftover `/api/cron*` route**. |

**Root cause (final):** the 12 Nov experiment made the cron Worker POST to
`https://sg16finance.com/api/cron` instead of writing D1 directly, and added a zone route
for that path. Git reverted the code on 13 Nov, but **the cron Worker and the route were
never redeployed/removed**. Every minute it still POSTs into a loop that never writes D1 —
so `updatedAt` has been frozen since `2026-11-12T21:33:52Z`. HEAD's cron Worker has no
`fetch` handler and no routes at all.

---

## Part B — your steps

### ✅ STEP 0 — Evidence (CLOSED 2026-11-15)
The owner confirmed all evidence is complete: 32 screenshots (git history, Actions logs,
Traffic, PRs, settings, DNS, Workers Builds, bindings/secrets, cron Worker, all 17 projects,
GitHub App installation `138713841`), plus the full git DAG and GitHub API records. No
second project exists. Optional items that were deliberately not supplied (Audit Log export,
cron source/logs, Bot Fight Mode state, token list, webhook logs, D1 snapshot, Drive zips)
are recorded as out of scope in Addendum 5; they can still be exported later without
blocking the repair.

<details>
<summary>Original Step 0 checklist (kept for the case file)</summary>
Do this today; logs expire.

- [ ] GitHub → Actions → download logs for runs `38614800773`, `38615261647` and the older failed runs (retention ~90 days; October is close).
- [ ] Cloudflare → **Audit Log** → export 2026-10-09 → 2026-11-15. This is the most important item for the police report: who deployed, changed secrets, bindings, routes and projects, and when.
- [ ] Screenshot **both** project/connection cards with exact names and IDs — including "SG 16 Finance Conns" (not yet seen in any screenshot).
- [ ] Screenshot/save the **`sg16finance-cron` → Edit code** view (the deployed `3dad27d5` source) and its **Domains → route `sg16finance.com/api/cron*`**. These are the core evidence.
- [ ] Export Workers Builds deployment history + build logs, Workers Logs (especially the cron Worker's `[cron] ingest → HTTP …` lines), zone HTTP analytics, D1 metrics, and Security Events for the same period.
- [ ] Take a **D1 backup/snapshot** of `sg16finance-db` before any repair.
- [ ] Export Dodo Payments, Resend and Finnhub **webhook delivery logs** for 2026-10-09 → 2026-11-15.
- [ ] Keep `FORENSIC-AUDIT-2026-11-14.md` and this file with the case documents.

</details>

### STEP 1 — Secure the accounts (do this before the developer leaves)
- [ ] Cloudflare → **Account API tokens**: list and revoke anything you do not recognise, including `qwen-ops-temp-2026-10-30` (PR #1 asked for this on 29 Oct). Note the token used by Workers Builds is named `Workers Builds - 2026-07-08 05:32` — **rotate it, then re-link it in Settings → Builds** or builds will stop.
- [ ] Revoke GitHub PATs / deploy keys / SSH keys you do not recognise; enforce 2FA. The repo currently has **0 direct collaborators**, which is good.
- [ ] **Rotate every Worker secret**: `SESSION_SECRET`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, `RESEND_API_KEY`, `DODO_API_KEY`, `DODO_WEBHOOK_SECRET`, `DODO_ENV`, `DODO_PRODUCT_*`, `FINNHUB_API_KEY`, `FINNHUB_WEBHOOK_SECRET`, plus any `MISTRAL_API_KEY` / `SG16_BRAIN_*` values. (Rotating `SESSION_SECRET` logs everyone out — fine during maintenance.)
- [ ] **Remove `CRON_SECRET` from BOTH Workers** — it belongs to the discarded 12 Nov experiment and is currently set.
- [ ] Confirm `AUTH_DEV_LOG_CODE` is **NOT** set on any production Worker (the captured list may be scrolled — check the full list). If `AUTH_DEV_LOG_CODE=1`, users' login codes are printed into logs.
- [ ] **Add DNS email protection** (new finding): `_dmarc.sg16finance.com` TXT with a DMARC policy, and an SPF TXT at the root. Cloudflare itself recommends this ("Block fake emails sent from @sg16finance.com addresses"). Root currently has no SPF and no DMARC; only `send.sg16finance.com` has SPF and `resend._domainkey` has DKIM.
- [ ] **Scope down the GitHub App (Addendum 4, G1)** — AFTER the Audit Log export: GitHub → Settings → Applications → "Cloudflare Workers and Pages" → change **"All repositories"** to **"Only select repositories"** and select only the repos that actually use Workers Builds: `sg16finance`, `sg16-ai-engine`, `SG16-Brain-Apache2.0-`, `SG16-IDENTIFIER-ROBO`, `saiftechglobal-website`, `sg16children-website`, `saifglobal-geopolitical-monitor`. The app currently has **read+write administration, checks, code, deployments and pull requests on all 17 repos**. Do **NOT** click *Suspend* or *Uninstall* — that stops all deploys and destroys evidence. Do not save any change before Step 0 is finished.
- [ ] Confirm you alone control: the Cloudflare account, `sg16finance.com`, the GitHub org `sg16global`, and the Dodo / Resend / Finnhub accounts.
- [ ] Optional but recommended: make the GitHub repo **private** — it is public and contains the full runbook, the D1 UUID and the product IDs.

### STEP 2 — Get these fixes onto the branch Cloudflare builds
- [ ] Merge **PR #2** → [`sg16global/sg16finance/pull/2`](https://github.com/sg16global/sg16finance/pull/2) (`arena/8cffe4fa-sg16finance` → `main`). It says "No conflicts … Merging can be performed automatically".
- [ ] My session is fixed to `arena/8cffe4fa-sg16finance`, so I cannot push directly to `main`. Merging the PR is the one-click step that makes Workers Builds pick up the fixes.
- [ ] After merging, the **production** build should succeed (as `dd8b521` did) and GitHub Actions should show a green **CI** check. The red `Workers Builds` check on the PR is a **Preview** deployment and is not required for production.

### STEP 3 — Fix ONLY the Preview deploy settings (production is already correct)
Cloudflare → `sg16finance` → **Settings → Builds → Previews Base**:

- [ ] Set the preview deploy command to `npx cf previews deploy --prebuilt` (production keeps `npx cf deploy --prebuilt --mode production`). This is what makes the red check on PRs go green.
- [ ] Node version `22.23.0` or newer 22.x (>= 22.23, or 24.22+, or 26.12+). Build log showed `nodejs@24.22.1`, which is fine.
- [ ] **Never use `wrangler deploy` on this project** while `.cloudflare/output` exists — Wrangler 4.151.0 hard-errors (exact cause of run `38615261647`). The cron Worker is the only component deployed with Wrangler.
- [ ] If a second Git-connected project ("SG 16 Finance Conns") exists with no deployments, screenshot it, then either point it at `main` with the same settings or **delete it**.

### STEP 4 — Bindings/secrets verification (already mostly correct)
- [ ] D1 `DB` bound **by id only** (`8671a510-3431-41ad-be92-cdcb3faa3f72`) — confirmed, no change needed.
- [ ] `AI` + `RL_ACCESS` / `RL_CHECKOUT` / `RL_AUTH` — confirmed present.
- [ ] `SESSION_SECRET`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET` are declared in `cloudflare.config.ts`, so `cf deploy` **fails if any is missing** — keep all three after rotation.
- [ ] Scroll the full secrets list and compare with `.env.example`; note anything missing (`AUTH_FROM_EMAIL`, `SUPPORT_NOTIFY_EMAIL`, `MISTRAL_API_KEY`, `SG16_BRAIN_*`).
- [ ] Custom domains `sg16finance.com` / `www.sg16finance.com` — confirmed attached. Disconnect any legacy Pages `dist` project if it still serves traffic.

### STEP 5 — THE MAIN FIX: remove the stale route and redeploy the cron Worker
- [ ] Cloudflare → `sg16finance-cron` → **Domains → delete the route `sg16finance.com/api/cron*`**. HEAD's cron Worker has no routes; leaving it means `GET /api/cron` keeps returning 405 forever and the cron POSTs keep looping.
- [ ] From the repo, inside `cron-worker/`: `npm run deploy:cron` (Wrangler, using `cron-worker/wrangler.jsonc`). Confirm the deployed source calls `ingestMinute(env)` directly and has **no** `fetch()` call to `https://sg16finance.com/api/cron`.
- [ ] Keep `FINNHUB_API_KEY` on `sg16finance-cron`; **remove `CRON_SECRET`** (Step 1).
- [ ] Confirm triggers `"* * * * *"` (ingest every minute) and `"0 3 * * *"` (daily cleanup) — already correct in the dashboard.
- [ ] Watch the cron Worker's **Workers Logs** for a fresh `[cron] ingest` line and then check D1 `quote_history` for a new `ts`.

### STEP 6 — Verify Bot Fight Mode (state still unknown)
- [ ] Cloudflare zone `sg16finance.com` → **Security → Bots** → screenshot the current state. If **Bot Fight Mode is ON, turn it OFF**. `OPS-RUNBOOK.md` recorded it challenging all traffic including Dodo/Finnhub webhook POSTs.
- [ ] `curl -sI https://sg16finance.com/api/health` → **200**, with **no** `cf-mitigated` header.

### STEP 7 — Deploy, then verify
- [ ] Merge PR #2 (Step 2) triggers the production build automatically; do **not** press "Retry" on old failed builds.
- [ ] On your machine:

```bash
git checkout main && git pull
npm ci
npm run verify:deploy
```

Expected: `PASS health / D1 binding`, `PASS build identity` (deployed SHA == local SHA),
`PASS stale /api/cron build`, `PASS market-data ingest`, `PASS truthful quote timestamps`,
`PASS API stale flag`, `PASS Turnstile / sign-in config`, `PASS static edge config`.

- [ ] If `build identity` WARNs → `/api/version` missing means PR #2 did not deploy; retry the build.
- [ ] If `/api/cron` is still 405 → **the route was not deleted** (Step 5), not an old build.
- [ ] If `market-data ingest` FAILs → cron Worker still not writing D1; check its logs, `FINNHUB_API_KEY` and the route.
- [ ] After ~2 minutes `/api/dashboard` should show `updatedAt` advancing and `stale: false`.

### STEP 8 — Make the affected users whole (important for the police file)
- [ ] From the Dodo webhook logs you exported, list payments 2026-10-15 → 2026-11-15 whose webhook was challenged/failed. **Collect logs from both `sg16finance.com/api/webhooks/dodo` and `payments.saiftechglobal.com`** — the account has a separate `dodo-payments-gateway` Worker (Addendum 3), so Bot Fight Mode on the main zone is not the only possible cause. Also check the webhook URL configured in the Dodo dashboard.
- [ ] Compare with `access_passes` in D1. For anyone charged but not granted a pass: restore the pass manually or refund. Keep the reconciliation table as evidence.
- [ ] Re-send/reset email verification for anyone locked out; check Resend delivery failures. The missing root DMARC/SPF is relevant here.
- [ ] Publish a short status note explaining the stale market data and the fix.
- [ ] Give your lawyer / the police: `FORENSIC-AUDIT-2026-11-14.md` (including Addendum 2), the git log, Cloudflare Audit Log, build/cron logs, DNS screenshot and the reconciliation table. The audit found **no evidence of hacking or data theft** — it documents a change-control failure by a single account.

### STEP 9 — Stop it recurring
- [ ] **Branch protection on `main`**: require a pull request and require the green `CI` check. PR #1 was merged with 0 reviews and a failing check; the Nov-12/13 "Add files via upload" commits went straight to production.
- [ ] Enable Workers Logs + zone Security Events alerts; alert on `stale: true` from `/api/quotes`.
- [ ] Enable D1 backups.
- [ ] After every deploy, run `npm run verify:deploy` and keep its output.
- [ ] Have counsel correct the public claims in `src/app/privacy/page.tsx`, `src/app/premium/page.tsx`, `src/app/about/page.tsx` and the hard-coded prices in `src/components/LiveTickerBar.tsx` (Section 6 of the audit). Note Addendum 2 C7: `mistralbrain.com` is your own Worker in the same account, not a third party — but the privacy copy still misdescribes the system.

---

## Evidence status — CLOSED (2026-11-15)

The "SG 16 Finance Conns" question is answered: Cloudflare's **Manage** button opens
GitHub App installation [`138713841`](https://github.com/settings/installations/138713841)
— the same page captured in Part 5. There is **no second project** and no separate
Connections page. Full findings: Addenda 3–5 in `FORENSIC-AUDIT-2026-11-14.md`.

**Optional, non-blocking** (can be collected later for the case file): Cloudflare Audit Log
export, cron Worker `Edit code` source + Workers Logs, Security → Bots state, Account API
tokens list, full secrets lists, Dodo/Resend/Finnhub webhook logs for **both**
`sg16finance.com` and `payments.saiftechglobal.com`, D1 snapshot, and the two Google Drive
archives (Drive is blocked here — attach the unzipped `.log`/`.txt` files or use a private
GitHub Gist).

If you want, I can still implement the front-end "stale data" banner and the marketing-copy
corrections as a follow-up commit — but that would need a **new PR** because PR #2 is now
merged. Say the word.
