# Security changelog

Single source of truth for the edge-security framework, so any tool or person editing this repo stays in sync.
Newest first. Do not remove or bypass the checks below without updating this file.

## 2026-10-15: git connection, Workers Builds auto-deploy, verified deploy

- **Source of truth restored:** the full project (all auth/payment/security/data files, including the 27 files that were missing from the old "3.8 upgrade" archive) now lives in one git repo — `sg16global/sg16finance`, branch `main` — committed on top of the existing history (nothing force-pushed, timeline preserved).
- **Production deploy verified:** `sg16finance` Worker redeployed; live checks confirm `sg16finance.com`, `www.sg16finance.com` (301 → apex) and the workers.dev host all serve the new version with D1 (`sg16finance-db`), Workers AI and the three rate-limit bindings attached. Custom domains were never disconnected — the deploy updated the Worker in place, zero downtime.
- **Auto-deploy connected via Cloudflare Workers Builds** (Workers → Settings → Build): production branch `main`, build `npm run build:vinext`, deploy `npm run deploy:vinext`. Every push now deploys automatically; the broken GitHub Actions workflow was removed (no API tokens in GitHub).
- **Repo hygiene:** `.wrangler/` and relocated build output ignored; stale `.next` type artifacts removed (they broke `tsc --noEmit`); `tsc --noEmit`, `eslint .` and `vitest` (22 tests) all clean; README deploy section updated to match reality.
- **Backups:** full dated copy of the working project kept outside the repo (`BACKUPS/sg16finance-2026-10-15`). No secrets are committed anywhere; `.dev.vars`/`.env.local` stay local-only.
- **Note for future deploys:** `cf deploy` may show a "local configuration differs from the Dashboard" prompt; the remote Worker config now matches `cloudflare.config.ts` (the 2026-10-14 deploy applied it), so the diff should no longer appear. If it ever does, answer Yes — the config in git is the source of truth.

## 2026-10-14: per-account watchlist gating, alerts gating, tests, build repair

- **Build repair:** `next build` failed on 8 TypeScript errors (untyped `request.json()` / `res.json()` in
  `src/app/api/alerts/route.ts`, `src/app/api/watchlist/route.ts`, `src/app/watchlist/page.tsx`). Fixed with explicit
  response types; `npm run build`, `npm run build:vinext`, `tsc --noEmit` and `eslint` are all clean.
- **Watchlist is private and per account:** every `/api/watchlist` handler now requires a session cookie (401 otherwise),
  rows are scoped by `user_watchlist.user_id` = the verified email, `DELETE` only removes rows owned by the caller
  (404 otherwise), and unknown symbols are rejected (404) instead of inventing a `100.00` price. Input is validated
  (symbol pattern, numeric target price, note length). `/watchlist` shows the sign-in panel for signed-out visitors and
  no longer claims "POSTGRESQL PERSISTENT" — storage is Cloudflare D1 (local: SQLite file).
- **Alerts:** `POST /api/alerts` (mark read) requires a session. `GET` stays public (seeded market alerts only, no PII).
- **Support tickets schema:** stale defaults removed — `status` defaults to `Received`, `priority` to `Normal`, and the
  fake `ai_confidence` default "98.5" is gone (the insert route already sets explicit values).
- **Fonts:** Google Fonts `<link>` tags replaced with `next/font` (self-hosted Inter + IBM Plex Mono via CSS variables);
  works in both the `next` and vinext builds and clears the lint warning.
- **Tests:** vitest added (`npm test`, `vitest.config.ts`): 22 tests covering session-token encrypt/decrypt + tamper +
  wrong-secret rejection, cookie flags, timing-safe compare, SHA-256, plan/email parsing and product-id overrides, and
  pass gating (`getAccessStatus`, `requireActivePass`) against an in-memory SQLite database.
- **Local dev:** `.env.local` added (gitignored, same dev-only test values as `.dev.vars`) because `next dev` does not
  read `.dev.vars`; without it local sign-in failed closed (no `SESSION_SECRET` / Turnstile test keys). Verified end to
  end: request code -> verify -> cookie -> per-user watchlist add/list/delete.

## 2026-10-10: real market data, real copilot, support privacy fix

- **Privacy fix:** `GET /api/support` publicly listed every ticket (name, email, message). The handler was removed (405) and the public
  "audit log" feed was removed from `/contact`. Tickets are stored and (optionally) emailed to `SUPPORT_NOTIFY_EMAIL`; nothing is auto-"resolved".
- **Real data engine** (`cron-worker/src/ingest.ts`, every minute): Finnhub (stocks + ETF proxies for indices/commodities), Coinbase Exchange
  (crypto), CoinGecko (crypto market cap, daily), ECB via Frankfurter (FX, daily), US Treasury (yields, daily), Finnhub metrics (fundamentals, daily).
  Tables created by the Worker: `market_meta`, `quote_history` (5-minute history, pruned after 48 h).
- **Truthful delay:** free visitors get the price from 15 minutes ago (`src/lib/market.ts`); signed-in pass holders get the latest.
  Applies to `/api/quotes`, `/api/dashboard` and the home page.
- **Copilot** (`src/lib/copilot.ts`, `/api/ai-copilot`): Claude via `ANTHROPIC_API_KEY`, grounded only in the stored market data, 30 questions per
  account per day (`ai_usage`), history sent from the chat UI. Returns an honest 503 when the key is not configured. No fake confidence scores.
- **Removed invented numbers:** home KPI ribbon, markets macro banner (VIX, 10Y, spread, gold/oil), hard-coded "$118.4T" market cap.
- **Still static / not real yet:** sector performance and weights, earnings reports (2024), market alerts/news, sample watchlist rows.
- **AI engines** (`src/lib/copilot.ts`): default is Cloudflare Workers AI (`AI` binding in `wrangler.deploy.jsonc`, model
  `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, override with `AI_WORKERS_MODEL`). Optional first-in-line engines: Claude (`ANTHROPIC_API_KEY`) and the
  SG16 Brain (`SG16_BRAIN_KEY`, `SG16_BRAIN_URL`; its project key is minted in the brain's admin console). `AI_PROVIDER=sg16|anthropic|workers` picks the
  first engine; Workers AI is always the final backup. A failed answer is refunded to the user's 30/day allowance.
- **AI support** (`src/lib/support-ai.ts`, `/api/support`): each ticket is stored, optionally emailed to `SUPPORT_NOTIFY_EMAIL`, and gets a short
  automated first response from Cloudflare Workers AI built only from true site facts. It is labelled "Automated first response" and the ticket is
  never marked resolved. Falls back to a plain acknowledgement if AI is unavailable.
- Secrets added: `FINNHUB_API_KEY` on `sg16finance-cron`; optional `ANTHROPIC_API_KEY`, `AI_MODEL`, `SUPPORT_NOTIFY_EMAIL` on `sg16finance`.

## 2026-10-09: verified login, server-side gating, abuse shield, cron

### Architecture
- **Identity** = an AES-256-GCM encrypted, authenticated `httpOnly; Secure; SameSite=Lax` cookie named `__Host-sg16_session`
  (30 days). It is created only after a 6-digit emailed code is verified. The email typed in the browser is never trusted.
- **Gate** = `requireActivePass(request)` in `src/lib/access.ts` (session cookie AND an active pass in D1).
- **Bot shield** = Cloudflare Turnstile on checkout and sign-in; Workers Rate Limiting on access / checkout / auth.
- **Housekeeping** = separate Worker `sg16finance-cron` (daily 03:00 UTC).

### New files
| File | Purpose |
|---|---|
| `src/lib/security.ts` | Session encrypt/decrypt, cookie helpers, Turnstile verify (fails closed), rate-limit helper, same-origin (CSRF) check |
| `src/lib/otp.ts` | 6-digit code: hashed at rest, 10 min expiry, 5 attempts, single use, 60 s resend cooldown, Resend email |
| `src/lib/access.ts` | `getAccessStatus(email)` and `requireActivePass(request)` |
| `src/lib/useAccess.ts` | Client hook: pass status from the cookie session, sign-out, post-payment polling |
| `src/app/api/auth/{request,verify,logout,config}/route.ts` | Sign-in API |
| `src/components/SignInPanel.tsx`, `Turnstile.tsx` | Sign-in UI + Turnstile widget |
| `cron-worker/` | Scheduled cleanup Worker |
| `wrangler.deploy.jsonc` | Production deploy config for the main Worker (rate-limit bindings live here) |
| `.dev.vars` | Local-only test secrets (Turnstile *test* keys). Never deployed |

### Changed files
| File | Change |
|---|---|
| `src/app/api/access/route.ts` | Session-based; the `?email=` lookup was removed (it allowed spoofing). Rate limited |
| `src/app/api/checkout/route.ts` | Origin check + rate limit (5/min/IP) + Turnstile token required |
| `src/app/api/ai-copilot/route.ts` | 401 without session, 403 without an active pass |
| `src/app/api/quotes/route.ts` | Live jitter stream only for pass holders; everyone else gets the steady snapshot |
| `src/lib/passes.ts` | Adds the `login_codes` table (created lazily with the others) |
| `src/app/premium/page.tsx`, `AutoSidePanel.tsx` | Sign-in panel, sign-out, subscription status, Turnstile on checkout |
| `AiCopilotModal.tsx`, `ai-copilot/page.tsx` | Friendly message when the API answers 401/403 |
| `cloudflare.config.ts` | Local dev: rate-limit bindings + secret declarations |

### Secrets (Cloudflare Worker `sg16finance`)
`SESSION_SECRET`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, `RESEND_API_KEY` (required for sign-in emails),
optional `AUTH_FROM_EMAIL` (default `SG16 Finance <login@sg16finance.com>`), plus the existing Dodo / Finnhub secrets.
`AUTH_DEV_LOG_CODE=1` exists **only** in local `.dev.vars` and must never be set in production.

### Rate limits (per IP, per minute)
`/api/access` and `/api/ai-copilot`: 60 · `/api/checkout`: 5 · `/api/auth/request` and `/api/auth/verify`: 8 (separate counters)

### Webhooks (unchanged, already strict)
Dodo: HMAC-SHA256 over `id.timestamp.body`, 5-minute timestamp window, constant-time compare, replay ids stored.
Finnhub: shared secret header, constant-time compare.

### Cron (`sg16finance-cron`, `0 3 * * *`)
Deletes passes expired more than 7 days ago, expired login codes, usage rows older than 60 days, webhook event ids older than 90 days.

### Deploy
- Main app: `npm run build:vinext` then `npm run deploy:wrangler`
- Cron: `npm run deploy:cron`
