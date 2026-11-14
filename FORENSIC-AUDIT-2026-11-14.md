# SG16 Finance — forensic audit of commit `a56a784` and the Oct 15 – Nov 14 outage

**Prepared:** 2026-11-14 (UTC) · **Repository:** `sg16global/sg16finance`, branch `main` (HEAD `dd8b521`)
**Scope:** full git history (un-shallowed), GitHub Actions/check-runs, PR #1, all source & config files at `a56a784` and HEAD, plus live read-only probes of `sg16finance.com`.
**Important:** the audit itself was **read-only** — no production setting was touched and the git history is unmodified (nothing force-pushed, nothing rewritten). All findings below describe the state as of 2026-11-14 19:10 UTC. A **separate follow-up commit** (see [`RECOVERY-STEPS.md`](./RECOVERY-STEPS.md) and the addendum at the end) then repaired the repo-side defects on the working branch; that commit does not alter any of the historical evidence cited here.

---

## 1. Bottom line (plain English)

1. **Nothing is "locked".** The red cross you clicked on `a56a784` is a **failed GitHub Actions deploy job from 14 Oct 2026**, not a lock, not encryption, and not a permissions block. The "Some content is hidden / large commits" banner is GitHub hiding a big diff in the browser — the files are all present and readable in git.
2. **Your "Oct 9–15 locked" observation is real, but it means something different:** the entire email-verification / login / payments / security subsystem was **not in the GitHub repo** until 15 Oct. Commit `a56a784` imported **27 brand-new files** in one go, including all four `/api/auth/*` routes, `src/lib/security.ts`, `src/lib/otp.ts`, the cron Worker and the D1 migration. The repo's own `SECURITY-CHANGELOG.md` admits these were "**the 27 files that were missing from the old '3.8 upgrade' archive**". So for 6 days the live system had core code that GitHub did not contain. No version-control trail exists for that work.
3. **"Millions of data reads" vs GitHub traffic is not a discrepancy.** GitHub Insights → Traffic counts **views and clones of the repository page**. It never counts requests to your website. Cloudflare/D1 counts every HTTP request and every database row read. The app polls (`/markets` every 30 s, `/api/access` every 5 min per open tab), each `/api/dashboard` and `/api/quotes` call reads all 25 assets + `market_meta` + a correlated subquery over up to 48 h of `quote_history` (~14,000 rows), and the cron Worker runs **1,440 times/day**. Crawlers, bots and monitoring add more. Millions of D1 row-reads/day is expected and is billed by Cloudflare, not recorded by GitHub. GitHub also shows **zero deployments** (`/deployments` is empty) because deploys happen through Cloudflare Workers Builds, not GitHub.
4. **"Green but cross" = two different dashboards.** Cloudflare says the Git connection / Worker is active (green). GitHub shows a **frozen historical** red X on the October commit (0 of 1 checks passed). GitHub Actions has since been deleted — `/actions/workflows` returns **0 workflows** today — so no new checks will ever turn that X green.
5. **The two Cloudflare projects:** from the repo I can see only two Worker names, `sg16finance` and `sg16finance-cron`, plus a **legacy Cloudflare Pages `dist` deploy** that README keeps telling you to "disconnect … if still active". There is **no string "Conns"/"Connections" anywhere in the repository**. A second dashboard project ("SG 16 Finance Conns") is therefore a Cloudflare-side object — almost certainly the **Workers Builds / Git-connection project**. Its build/deploy history lives only in the Cloudflare dashboard; git cannot see it. That project looks "empty" because **its deploy step has been aborting since 15 Oct** (documented in `OPS-RUNBOOK.md` and PR #1), so it has no successful deployment versions to show.
6. **Why everything "stopped yesterday":** on **12 Nov 21:14–21:20 UTC (= 13 Nov 05:14–05:20 Malaysia time)** three "Add files via upload" commits were pushed. They were an attempt to make cron traffic visible in Cloudflare analytics (the code comment literally says "**which routes through the Cloudflare edge and shows up in zone HTTP traffic analytics**"). That experiment **broke the market-data pipeline**. It was deleted/reverted from git **about an hour later** (22:10–22:20 UTC), **but production was never brought back in sync**. Live probes prove it.
7. **Production is currently running code that no longer exists in GitHub.** `GET https://sg16finance.com/api/cron` returns `{"error":"Method Not Allowed"}` (a route exists), while a made-up path returns the app's normal 404 page. `/api/cron` is **not in HEAD**. This is exactly your "superficial overlay": the GitHub repo and the live Worker have diverged.
8. **Real market data has been frozen since 12 Nov 21:33 UTC**, yet the site still labels it "15 minutes delayed" with a *fresh-looking* timestamp. `/api/health` returns `{"ok":true}` and D1 works — the site is not dead, the ingest pipeline is. Users (including paying users) were served ~2-day-old prices presented as current. This is the most likely trigger for the user reports.
9. **I found no evidence of hacking, credential theft, data exfiltration or deliberate sabotage.** No hardcoded API keys, tokens or passwords in any commit; `.dev.vars` / `.env.local` were never committed; no unexpected outbound endpoint. What I did find is a serious **change-control failure**, several **inaccurate privacy/marketing claims**, and one **dev-only login backdoor** that was briefly declared as a production secret. Those need attention, but they are not evidence of a break-in.

---

## 2. Verified timeline

Times below are UTC unless marked MYT (UTC+8, your local time).

| When | Commit | What happened |
|---|---|---|
| 2026-10-09 02:55 MYT | `720b073` | Last commit before the gap: "Fix Cloudflare build: add Workers type declarations". Repo contains **83 files**, no auth routes, no `security.ts`, no `otp.ts`, no cron Worker. |
| 2026-10-09 → 10-14 | — | **No commits at all.** Changelog documents work on Oct 9, 10 and 14 (login, payments, real data, 22 tests). That work lived outside git (a private archive / the deployed Worker). |
| 2026-10-14 18:21 UTC / 15 Oct 02:21 MYT | **`a56a784`** | "Security + payments + real data upgrade (Oct 9-14)" — **57 files, +4,107 / −565**, **27 new files**, 1 parent. Bulk import of the missing subsystem. |
| 2026-10-14 18:23–18:24 UTC | run `38614800773` | GitHub Actions `deploy` job: checkout, setup-node, `npm ci`, **Lint ✓**, **Build ✓**, **Deploy Worker ✗ (exit 1)**. This is the X on the commit. |
| 2026-10-15 (11 commits) | `dde4e33` … `30e7161` | Deploy-command churn, workflow **deleted** (`2ff4d41`), dev-only secrets removed from `cloudflare.config.ts` (`a36bc32`), Anthropic engine removed, refund/chargeback handling, service-worker kill switch. Changelog claims Workers Builds auto-deploy connected. |
| 2026-10-15 → 10-29 | — | **14-day commit gap.** |
| 2026-10-29 | `36196d3`, `33e85d4`, `6865b9c`, PR #1 | "Qwen Ops" branch merged. `OPS-RUNBOOK.md` records: (a) zone-wide `403 cf-mitigated: challenge` caused by **Bot Fight Mode**, (b) Workers Builds **dying at the "Deploying" step** because Wrangler refuses `.cloudflare/output` — build succeeds, deploy aborts. PR #1 says the dashboard deploy commands must be changed **manually** and token `qwen-ops-temp-2026-10-30` must be revoked. |
| 2026-10-29 → 11-12 | — | **Another 14-day commit gap.** No successful auto-deploy is recorded anywhere. |
| **2026-11-12 21:14 / 21:17 / 21:20 UTC** (13 Nov 05:14–05:20 MYT) | `ac40581`, `6dcf8dc`, `c2393d6` | Three "Add files via upload": `src/lib/ingest.ts` (439 lines), `src/app/api/cron/route.ts` (75 lines), and a **rewritten `cron-worker/src/index.ts`** that stops writing to D1 and instead POSTs to `https://sg16finance.com/api/cron` with an `X-Cron-Secret` header — explicitly "so it … shows up in zone HTTP traffic analytics". This is the "check the discrepancy" work. |
| ~2026-11-12 21:33 UTC | — | **Last real D1 price write** visible live today (`updatedAt` on `/api/dashboard`). Ingestion stops here. |
| 2026-11-13 06:10 / 06:12 / 06:20 MYT | `1e7f0fe`, `64f3921`, `646c874` | Both uploaded files deleted; cron Worker **byte-for-byte reverted** to the `a56a784` version. |
| 2026-11-13 07:51 MYT | `dd8b521` (HEAD) | "Bind D1 by id only so Workers Builds deploys stop aborting" — removes `name` from `bindings.d1(...)` because a dashboard-created D1 binding has no `name` and `cf deploy` saw a destructive diff. Confirms deploys were still aborting. |
| 2026-11-14 19:10 UTC (probe) | — | Site serves Oct-15 `sw.js`, Oct-29 `robots.txt` and `security.txt`, **and the deleted `/api/cron` route**. Data still frozen at Nov 12. |

GitHub metadata: repo is **public**, `pushed_at` = `2026-11-12T23:51:30Z`, **0 workflows**, **0 deployments**, **0 issues**, **1 merged PR** (#1), branches `main`, `redeploy-by-qwen`, `fix-real-404s`.

---

## 3. Every symptom explained

| What you saw | What it actually is | Evidence |
|---|---|---|
| Commit dated "a month ago" with an X / "0/1" | One failed CI check on `a56a784`; checks are immutable, so the X is permanent | `check-runs` → `{"name":"deploy","conclusion":"failure"}`; annotation `Process completed with exit code 1` at the Deploy Worker step; workflow removed 15 Oct; 0 workflows today |
| "Some content is hidden" on the diff | GitHub's large-diff viewer (57 files, >4k lines). Not a lock. All 57 files are readable via `git show a56a784 -- <path>` | Screenshot 1 + `git show --stat` |
| "Email verification & core elements locked Oct 9–15" | Those files **did not exist in git** before 15 Oct; they arrived as 27 new files in `a56a784` | `git diff --diff-filter=A --name-only 720b073 a56a784` → 27 files; `SECURITY-CHANGELOG.md`: "27 files that were missing from the old '3.8 upgrade' archive" |
| "Oct 15 – Nov 12 project empty" | Auto-deploy broken (Wrangler vs `cf` mismatch, then D1 binding diff). Cloudflare's Git-connected project has no successful deployment versions; only two small commit clusters (Oct 29, Nov 12/13) in that window | `OPS-RUNBOOK.md` §0/§2, PR #1 body, `dd8b521` message, commit-per-day counts |
| "Green but cross" | Cloudflare connection = active; GitHub check = old failure | `check-runs` vs `/actions/workflows` |
| "Millions of reads but no GitHub traffic" | Different systems. GitHub Traffic = repo page views/clones. Cloudflare = all HTTP + D1 row reads | Code: `src/app/markets/page.tsx` (30 s poll), `src/lib/useAccess.ts` (`REFRESH_MS = 5*60_000`), `src/lib/market.ts` (`SELECT * FROM market_meta` + correlated `MAX(ts)` subquery over `quote_history`), `cron-worker/wrangler.jsonc` (`"* * * * *"`), `src/db/ensure-data.ts` (seed check per isolate) |
| "Current settings are a superficial overlay" | **True in the technical sense.** Production ≠ git HEAD | Live `/api/cron` = 405 (route exists) but HEAD has no `src/app/api/cron/route.ts`; control `/api/definitely-not-a-route` = normal 404 |
| "Everything stopped yesterday" | Market-data ingest stopped 13 Nov ~05:33 MYT; site still serves stale data with a synthetic freshness timestamp | `/api/dashboard` `updatedAt` max `2026-11-12T21:33:52.498Z`; `/api/quotes` `lastTick` = `2026-11-14T18:55:02Z` |

---

## 4. Live, read-only evidence (captured 2026-11-14 ~19:10 UTC)

| Probe | Result | Meaning |
|---|---|---|
| `GET /api/health` | `200 {"ok":true}` | Worker + D1 binding alive. The project is **not** dead. |
| `GET /api/auth/config` | `{"turnstileSiteKey":"0x4AAAAAAFSN11W5cUwfSw8K"}` | Auth/Turnstile config is present in the deployed Worker. |
| `GET /api/quotes` | 25 quotes, all `delayed:true`, `delayMinutes:15`, `lastTick: 2026-11-14T18:55:02Z` | `lastTick` is **synthetic**: `src/lib/market.ts` sets `asOf = new Date(Date.now() - 15min)` for delayed prices. It is *not* the real ingest time. |
| `GET /api/dashboard` | `updatedAt` between `2026-11-12T21:00:52Z` and **`2026-11-12T21:33:52Z`**; sparklines flat/repeating; `asOf: 2026-11-14T18:55:02Z` | `cron-worker/src/ingest.ts::applyQuotes` writes `updated_at = now` on every price change. No writes for ~46 hours ⇒ **ingest has been stopped since 12 Nov**. |
| `GET /api/cron` | JSON `{"error":"Method Not Allowed"}` (405-style rejection) | A POST-only route **exists in production**, absent from git HEAD. |
| `GET /api/definitely-not-a-route` | normal app 404 page | Control: 405 is not a generic response. |
| `GET /robots.txt`, `/sw.js`, `/.well-known/security.txt` | Oct-29 and Oct-15 versions | Production contains post-`a56a784` code, i.e. it was deployed at least once after Oct 29 — but it is **not** HEAD. |

**Repo health at HEAD (`dd8b521`), measured locally:**
- `npm ci` → OK (warning: `cf@1.0.0-beta.25` requires Node `^22.23.0 || ^24.22.0 || ^26.12.0`; sandbox has 22.22.3 — Workers Builds must use ≥22.23).
- `npm test` → **22/22 pass**.
- `npm run lint` → clean.
- `npm run build:vinext` → **build complete** (all 26 routes emitted).
- `npm run typecheck` → **FAILS with 11 errors**, all in `cron-worker/src/{index,ingest}.ts` (`D1Database`, `D1PreparedStatement`, `ScheduledController`, `ExecutionContext`, `ExportedHandler` not found; one implicit `any`). `tsconfig.json` includes `**/*.ts` but the cron Worker needs `@cloudflare/workers-types` globals. Changelog's claim "`tsc --noEmit` … clean" is no longer true, and CI never enforced typecheck (workflow ran lint + build only).

---

## 5. Root cause of the Nov 13 stoppage

The three Nov 12 uploads were a **diagnostic experiment to reconcile traffic**, and they could not work:

1. `cron-worker/src/index.ts` was changed to `fetch("https://sg16finance.com/api/cron", { headers: { "X-Cron-Secret": env.CRON_SECRET } })` instead of doing D1 work itself.
2. **`CRON_SECRET` was never added to `cloudflare.config.ts`, `wrangler.toml`, `cron-worker/wrangler.jsonc`, `.env.example` or any deploy config.** It appears only in those three commits. So the shared secret on "both Workers" (required by the uploaded code's own REQUIREMENTS comment) was never provisioned.
3. `src/app/api/cron/route.ts` uses `export async function POST(request: Request, env: Env)`. In Next.js App Router the second argument is a **route context (`{ params }`), not Cloudflare env**, and the `Env` type is not even imported (a TypeScript error). `env.CRON_SECRET` would always be `undefined` ⇒ every cron POST returns **401**.
4. The upload also says "Exclude this route from rate limiting" — never done.
5. About an hour later (22:10–22:20 UTC / 06:10–06:20 MYT on 13 Nov) the files were deleted from git and the cron Worker reverted **exactly** (verified byte-for-byte against `a56a784`). **But the deployed Worker was not reverted/redeployed**, so production kept the broken build. `dd8b521` (23:51 UTC) shows deploys were still aborting on a D1 config diff.

Net effect: cron Worker stopped writing D1 → `market_assets.updated_at` froze → sparklines froze → free-tier "15-min delayed" prices are actually ~2 days old while the API advertises a timestamp 15 minutes ago.

---

## 6. Security & compliance findings (what to fix, what is *not* a breach)

**Reassuring:**
- Scanned every blob in every commit for `sk-`, `re_`, `ghp_`, `AKIA`, PEM keys and hardcoded key assignments: **no live secrets committed**. Only `${{ secrets.CLOUDFLARE_API_TOKEN }}` references.
- `.dev.vars`, `.env.local`, `.env` were **never tracked** (`.env.*` was already gitignored before `a56a784`; that commit added `.dev.vars` and `.wrangler/`).
- All outbound URLs are legitimate: Finnhub, Coinbase Exchange, CoinGecko, Frankfurter/ECB, US Treasury, Dodo Payments, Resend, Turnstile, Mistral, Anthropic (removed 15 Oct), plus `https://mistralbrain.com` (see below). **No unknown exfiltration host.**
- Auth design itself is sound: AES-256-GCM `__Host-` session cookie, hashed/single-use/expiring OTPs, Turnstile fail-closed, per-IP rate limits, HMAC-signed Dodo webhooks with replay window.

**Needs attention:**
1. **Dev backdoor `AUTH_DEV_LOG_CODE`** — `src/lib/otp.ts` prints the 6-digit login code to the console when `RESEND_API_KEY` is unset and `AUTH_DEV_LOG_CODE === "1"`. `a56a784` **declared it as a production secret** in `cloudflare.config.ts`; `a36bc32` removed it with the comment "must never exist in production". Verify it is **not** set on the live Worker. If it ever was, anyone with log access could sign in as any user.
2. **Undisclosed third-party AI processor** — `src/lib/copilot.ts` defaults `SG16_BRAIN_URL` to `https://mistralbrain.com` and POSTs the user's **question plus the last 2 chat turns** to `/api/brain` when `SG16_BRAIN_KEY` is set. Mistral and (previously) Anthropic also receive prompts. Meanwhile `src/app/privacy/page.tsx` says "**We never sell, monetize, or transmit your … Sentinel AI chat prompts to third-party** … firms". Have counsel reconcile the privacy notice with the actual processors.
3. **Inaccurate public claims** (likely relevant to user complaints / the police report — please have a lawyer review, I am not giving legal advice):
   - `privacy/page.tsx`: "GDPR / CCPA Compliant", "**PostgreSQL** database", "PostgreSQL persistent databases … AES-256", "SOC-2 Alignment", "TLS 1.3". Reality: **Cloudflare D1**, no PostgreSQL, no evidence of SOC-2.
   - `premium/page.tsx`: "$49/mo … **Real-time sub-second price streaming**", "**Unlimited PostgreSQL persistent watchlist items**", "REST API Access (10,000 req/minute)", "$249/mo … **Sub-2ms FIX protocol WebSocket feed**", "Full historical tick data Parquet export", "**SOC-2 Type II** audit compliance telemetry", "Custom webhook triggers on SEC EDGAR filings". None of these are implemented in the repo.
   - `about/page.tsx`: "deep learning neural clusters continuously parse live SEC filings … and options order-flow anomalies 24 hours a day"; `markets/page.tsx`: "Loading real-time institutional feeds…". Not implemented.
   - `src/components/LiveTickerBar.tsx` (rendered on every page via `DashboardShell`) shows **hard-coded fake prices** (BTC $94,820, AAPL $232.80 …) with a `Math.random()` "jitter simulation" every 3.5 s — not real market data.
   - Free-tier quotes are deliberately 15 minutes behind by design, and since 12 Nov are ~2 days behind, while the API reports a fresh `lastTick`.
4. **Public repo** — `visibility: public`. The security architecture, D1 UUID (`8671a510-3431-41ad-be92-cdcb3faa3f72`), Dodo test product IDs, token *names* (`qwen-ops-temp-2026-10-30` in `SECURITY-CHANGELOG.md`, `OPS-RUNBOOK.md`, PR #1) and the full runbook are readable by anyone. No secret *values* are exposed, but consider making the repo private.
5. **Config drift** — D1 is named `sg16finance-db` in `wrangler.toml` / `wrangler.deploy.jsonc`, described as `sg16finance` in `README.md`, and bound **by id only** in `cloudflare.config.ts`. `wrangler.deploy.jsonc` is marked DEPRECATED. `.env.example` lists only 5 of the ~16 secrets the code reads (`SESSION_SECRET`, `TURNSTILE_*`, `RESEND_API_KEY`, `DODO_*`, `FINNHUB_WEBHOOK_SECRET`, `SUPPORT_NOTIFY_EMAIL`, `SG16_BRAIN_*`, `MISTRAL_*`, `AI_PROVIDER`, `AI_WORKERS_MODEL`, `AUTH_FROM_EMAIL` are missing). This drift is what keeps aborting `cf deploy`.
6. **Bot Fight Mode** — `OPS-RUNBOOK.md` (Oct 30) measured all traffic, **including Dodo/Finnhub webhook POSTs**, getting `403 cf-mitigated: challenge`, and says one manual dashboard click (Security → Bots → Bot Fight Mode OFF) is still required. If that click never happened, **payments could be charged while the webhook that grants access was challenged** — a very plausible source of "users reported". Verify webhook delivery logs in Dodo and Cloudflare Security Events for Oct 15 – Nov 14.

---

## 7. What I could NOT verify (needs your Cloudflare / provider access)

I have no Cloudflare API token, no D1 console access and no connector attached, so these must be checked in the dashboards:

- The exact **names/IDs of the two Cloudflare projects** ("SG 16 Finance" vs "SG 16 Finance Conns"), which one owns the custom domain, and which one is the Git-connected Workers Builds project.
- **Workers Builds deployment list** and the exact failure reason/timestamp for each deploy from 15 Oct → 14 Nov.
- **Cloudflare Audit Log** — who deployed, changed secrets, edited bindings, or created/deleted projects, and when. This is the single most important item for your police file.
- **Zone analytics / D1 metrics** for Oct 15 – Nov 14 (to substantiate the "millions of reads" and identify whether they were users, bots or cron self-calls).
- **Live Worker secret names** (are `CRON_SECRET` / `AUTH_DEV_LOG_CODE` present? is `RESEND_API_KEY` set? is `SESSION_SECRET` ≥32 chars?), and the actual deployed bundle hash/version.
- **D1 contents** (row counts in `access_passes`, `login_codes`, `dodo_events`, `quote_history` — needed to reconcile paid users vs granted passes).
- **Dodo / Resend / Finnhub webhook delivery logs** for the same period.
- Whether token `qwen-ops-temp-2026-10-30` and any GitHub PATs were ever revoked.

---

## 8. Action plan

### A. Preserve evidence **today** (retention is short)
1. Download the GitHub Actions logs for runs `38614800773` (`a56a784`) and `38615261647`, plus the older failed runs (Actions logs normally expire after ~90 days — October is close to that).
2. Export/screenshot: Cloudflare Audit Log, Workers Builds deploy history & logs, zone HTTP analytics, D1 metrics, Workers Logs, Security Events, both project settings pages (with names/IDs), secret *name* lists, and Dodo/Resend webhook delivery logs for **2026-10-09 → 2026-11-14**.
3. Take a **D1 backup/snapshot** before any repair. Keep this report plus `git log`/`git show` output as an appendix.
4. Save screenshots of the two Cloudflare project cards and the commit X you saw.

### B. Secure access before the developer leaves
- Revoke Cloudflare API tokens (including `qwen-ops-temp-2026-10-30`), rotate **all** Worker secrets (`SESSION_SECRET`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, `RESEND_API_KEY`, `DODO_API_KEY`, `DODO_WEBHOOK_SECRET`, `FINNHUB_WEBHOOK_SECRET`, `FINNHUB_API_KEY`, `SG16_BRAIN_KEY`, `MISTRAL_API_KEY`), remove `AUTH_DEV_LOG_CODE` and `CRON_SECRET` from production, rotate GitHub PATs/deploy keys, remove unnecessary collaborators, enforce 2FA. (Rotating `SESSION_SECRET` logs everyone out — do it during a maintenance window.)
- Confirm you alone control the Cloudflare account, the domain, the GitHub org and the Dodo/Resend/Finnhub accounts.

### C. Re-sync production with git (the actual fix)
1. Cloudflare → Workers & Pages → `sg16finance` → Settings → Build:
   - Build command: `npm run build:vinext`
   - Production deploy: `npx cf deploy --prebuilt`
   - Preview deploy: `npx cf previews deploy --prebuilt`
   - Node ≥ 22.23 (the `cf` CLI refuses older 22.x).
2. Confirm the three declared secrets and the D1 binding (id `8671a510-…`, **no `name`** — already fixed in `dd8b521`) match the dashboard so `cf deploy` stops aborting.
3. Redeploy the **cron Worker** from `cron-worker/` with `npm run deploy:cron`, with `FINNHUB_API_KEY` set, and make sure its deployed source is the direct-D1 version (`646c874` reverted it in git).
4. Verify after deploy:
   - `GET /api/cron` → **404** (proves the stale Nov-12 build is gone).
   - `/api/dashboard` `updatedAt` starts advancing minute by minute.
   - `/api/health` → 200, no `cf-mitigated` header.
   - Turn **Bot Fight Mode OFF** (Free-plan zone) and replay/reconcile any missed Dodo/Finnhub webhooks; manually restore/refund access for paying users whose passes never landed.

### D. Stop the misleading data
- Replace the synthetic `asOf = Date.now() - 15min` with the **real** `market_meta.as_of`; show "last updated" on the UI; **fail closed / show a stale-data banner** if ingest is older than N minutes; alert on ingest silence. This directly addresses the consumer complaints.
- Have counsel correct `privacy`, `premium`, `about` and the ticker-bar copy to match what the system actually does.

### E. Repo hygiene so this cannot recur
- Separate `tsconfig` for `cron-worker/` (add `@cloudflare/workers-types`) or exclude it from the root typecheck; **enforce `npm run typecheck` in CI** (currently 11 errors).
- Align D1 naming across `wrangler.toml`, `wrangler.deploy.jsonc`, `cloudflare.config.ts`, `README.md`; complete `.env.example` with every secret name; decide on **one** deploy path and document it.
- Add a CI/CD check that the deployed bundle matches the git HEAD (e.g. a `/api/version` route returning the commit SHA) — this would have caught the divergence on day one.
- Never again allow "Add files via upload" directly to `main`; require PRs, and record every deployment in git.

---

## 9. Appendix — key evidence commands

```bash
git fetch --unshallow origin
git show -s --format=full a56a784
git show --stat a56a784                        # 57 files, +4107/-565
git diff --diff-filter=A --name-only 720b073 a56a784 | wc -l   # 27
git show 2ff4d41                                # workflow deleted
git show a36bc32                                # AUTH_DEV_LOG_CODE removed
git show c2393d6 -- cron-worker/src/index.ts   # HTTP-POST cron experiment
git show 1e7f0fe / 64f3921 / 646c874           # deletes + exact revert
git show dd8b521                                # D1 bind-by-id fix
git log --all --date=iso --pretty='%h | %ad | %an <%ae> | %s'

gh api repos/sg16global/sg16finance/commits/a56a784/check-runs
gh api repos/sg16global/sg16finance/actions/runs/38614800773/jobs
gh api repos/sg16global/sg16finance/actions/workflows      # total_count: 0
gh api repos/sg16global/sg16finance/deployments            # empty
gh pr view 1
```

Live probes: `GET /api/health`, `/api/quotes`, `/api/dashboard`, `/api/auth/config`, `/api/cron`, `/api/definitely-not-a-route`, `/robots.txt`, `/sw.js`, `/.well-known/security.txt`.

**Conclusion:** this is a **broken deployment/change-control incident, not a locked or stolen project**. The git history is intact and complete from `a56a784` onward, no secrets leaked, and the code at HEAD builds and passes its 22 tests. The live Worker, however, is running a deleted Nov-12 build with a dead ingest pipeline and is serving stale prices under a fresh-looking timestamp. Fix the deploy pipeline, re-sync production, preserve the logs now, and get the public-facing claims reviewed.

---

## Addendum — repair commit (2026-11-14, after the audit)

Re-probed at 19:45 UTC: `/api/version` → **404** and `/api/quotes` still returned
`lastTick = 19:30` for a `19:45` request with no `dataAsOf` / `stale` fields — confirming
production is still the stale Nov-12 build and still uses the synthetic timestamp.

A follow-up commit on `arena/8cffe4fa-sg16finance` fixes the repo-side defects:

- `src/lib/market.ts`: delayed quotes now carry the **real** `quote_history.ts`; new
  `marketDataFreshness()` adds `dataAsOf` + `stale` to `/api/quotes` and `/api/dashboard`.
  `src/lib/market.test.ts` covers fresh / 2-day-stale / empty data (22 → **25 tests**).
- `src/app/api/version/route.ts` + `vite.config.ts`: build-time git SHA injected
  (`__SG16_COMMIT__`), so `/api/version` proves whether Cloudflare == git.
- `tools/verify-deploy.mjs` / `npm run verify:deploy`: read-only post-deploy check.
  Tested against a local mock: healthy build → 8 PASS; a simulated Nov-12 build →
  **4 FAIL** (stale cron route, dead ingest, `stale:true`, synthetic timestamps) + exit 1.
- `cron-worker/tsconfig.json`, root `tsconfig.json`, `package.json`: `npm run typecheck`
  now passes for both app and cron Worker (previously **11 errors**).
- `.github/workflows/ci.yml`: verify-only CI (lint, typecheck, tests, build); no deploy,
  no Cloudflare tokens in GitHub Actions.
- `.env.example`, `README.md`, `OPS-RUNBOOK.md`: full secret inventory, correct D1 name
  (`sg16finance-db`), Node >= 22.23, verification instructions.

Validated locally: `npm ci` OK · `npm run lint` OK · `npm run typecheck` OK ·
`npm test` 25/25 OK · `npm run build:vinext` OK (27 routes, `/api/version` present,
SHA verified inside the built bundle).

**These are git-side fixes only.** Steps that require the Cloudflare dashboard, secret
rotation, evidence export and user reconciliation are in `RECOVERY-STEPS.md`.
