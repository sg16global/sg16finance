# SG16 Finance — Ops & Security Runbook

Last updated: **2026-10-30** (after the failed Workers Builds deploy `06972dd3` and the site-wide 403 challenge incident).

---

## 0. What actually happened (two separate problems)

### Problem 1 — the site is challenging/blocking real traffic (this is your "blocked traffic")

Evidence, taken live on 2026-10-30 from this sandbox:

```
GET https://sg16finance.com/          → 403, cf-mitigated: challenge
GET https://sg16finance.com/api/health → 403, cf-mitigated: challenge
```

Every request — browsers, APIs, and **payment/webhook calls from Dodo & Finnhub servers** —
is being hit by a Cloudflare **managed challenge** at the zone level. That is why the site
looks "blocked". This is a **zone security setting**, not the Worker code and not GitHub.

> **It was NOT the Claude bot.** `ClaudeBot` is only Anthropic's web crawler (like Googlebot).
> Blocking or allowing it can never block human visitors or API traffic. The blocking comes
> from an over-aggressive zone setting: Under Attack mode / Security Level / a catch-all
> "Managed Challenge" WAF rule / Super Bot Fight Mode misconfiguration. Fix it in Part 1.

### Problem 2 — the Workers Builds deploy died at the "Deploying" step

The build log ends with:

```
✘ [ERROR] It looks like you've run `wrangler preview` in a project that builds for the Cloudflare CLI (`cf`).
  Cloudflare Build Output was found at `.cloudflare/output`. Deploying it with Wrangler reads a
  different configuration, so it may target the wrong [Worker]. Please run `cf previews deploy` instead.
```

This project is a **`cf` CLI project** (`cloudflare.config.ts` + `@cloudflare/vite-plugin` 2.x beta:
`vite build` writes Cloudflare Build Output to `.cloudflare/output/v0/`). The dashboard build
trigger, however, still runs a **Wrangler** deploy command (`npx wrangler preview` /
`npx wrangler deploy`). Current Wrangler refuses to deploy a `.cloudflare/output` directory —
so the build succeeds and the deploy aborts. Fix in Part 2 (dashboard) — the repo side is
already fixed in this branch (`npm run deploy` / `deploy:prebuilt` now use `cf`).

---

## 1. UNBLOCK THE SITE (do this first, ~5 minutes, dashboard only)

Cloudflare dashboard → zone **sg16finance.com**:

1. **Security → Settings**
   - *Security Level*: **Medium** (not High / Under Attack).
   - If you see **"I'm Under Attack Mode" / Under Attack Mode**: switch **OFF**.
2. **Security → WAF → Custom rules**
   - Look for any rule whose action is **Managed Challenge / Challenge / Block** with a broad
     match (e.g. `true`, all traffic, or "not known bot"). **Disable or delete it.**
   - If unsure which rule fires: **Security → Events** shows the rule ID + rule name for each
     mitigation — the 403s on `/` and `/api/health` will name the culprit.
3. **Security → Bots** (Super Bot Fight Mode — you are on a paid plan)
   - *Definitely automated*: **Block**
   - *Likely automated*: **Managed Challenge** (or Block if you prefer strict)
   - *Verified bots*: **Allow**
   - *AI crawlers / training bots*: **Block** (this is the correct place to stop ClaudeBot/GPTBot —
     plus `robots.txt` now disallows them too)
4. **Exempt machine-to-machine endpoints from bot products** (otherwise Dodo/Finnhub webhooks
   keep getting challenged and payments/retries break).
   **Security → WAF → Custom rules → Create rule**:
   - Name: `Skip bot mgmt for signed webhooks`
   - Expression (Edit expression):
     ```
     (http.host eq "sg16finance.com" and http.request.method eq "POST" and (http.request.uri.path eq "/api/finnhub-webhook" or starts_with(http.request.uri.path, "/api/webhooks/")))
     ```
   - Action: **Skip** → tick *Bot Fight Mode* and *WAF Managed Rules* (keep your own rate limits on).
   - These endpoints are already authenticated in code (HMAC signature + 5-min timestamp window,
     constant-time compare), so skipping edge bot checks is safe.
5. Verify from any terminal: `curl -sI https://sg16finance.com/api/health` must return **200**
   (no `cf-mitigated` header).

---

## 2. FIX THE AUTO-DEPLOY (Workers Builds, dashboard)

Dashboard → **Workers & Pages → sg16finance → Settings → Build**:

| Setting | Value |
|---|---|
| Build command | `npm run build:vinext` |
| Deploy command (production trigger) | `npx cf deploy --prebuilt` |
| Deploy command (preview / branch triggers, e.g. auto-created `npx wrangler preview` ones) | `npx cf previews deploy --prebuilt` |
| Root directory | `/` (repo root) |

Why `--prebuilt`: the Build step already produced `.cloudflare/output`; `cf deploy --prebuilt`
uploads exactly that output using `cloudflare.config.ts` (domains, D1 `DB`, AI binding,
rate-limit bindings, secrets). Workers Builds injects `CLOUDFLARE_API_TOKEN` /
`CLOUDFLARE_ACCOUNT_ID` automatically, so `cf` authenticates without extra secrets.

Then press **Retry deployment** on the failed build (or push this branch).

> Never point Wrangler at this project again while `.cloudflare/output` exists — current
> Wrangler hard-errors by design. `cron-worker/` is a plain Wrangler Worker (no Build Output)
> and stays on Wrangler: `npm run deploy:cron`.

### Manual deploy from your machine

```bash
npm install
cf auth login
npm run build:vinext     # vite build → .cloudflare/output/v0
npm run deploy:prebuilt  # cf deploy --prebuilt (or: npm run deploy = build+deploy in one)
npm run deploy:cron      # cron Worker only
```

---

## 3. SECURITY HEADERS ON EVERY RESPONSE (paid plan → Transform Rules)

`public/_headers` now covers **static assets** (HSTS, XFO DENY, nosniff, Referrer-Policy,
Permissions-Policy, X-Permitted-Cross-Domain-Policies). SSR pages and `/api/*` responses are
generated by the Worker, so mirror the same headers at the edge:

Dashboard → zone → **Rules → Transform Rules → Modify Response Header → Create rule**:
- Name: `Security headers (static)`; Expression: `true` (all traffic)
- Set static headers (operation *Set static*; add one per header):
  - `Strict-Transport-Security` = `max-age=63072000; includeSubDomains`
  - `X-Content-Type-Options` = `nosniff`
  - `X-Frame-Options` = `DENY`
  - `Referrer-Policy` = `strict-origin-when-cross-origin`
  - `Permissions-Policy` = `camera=(), microphone=(), geolocation=(), payment=(self)`
- (Skip-if-present behaviour: use "Set static" so edge values win consistently.)

Do **not** add a strict Content-Security-Policy yet — vinext/Next emits inline scripts and
nonces per request; a wrong CSP would break the app. Revisit after testing with
`Content-Security-Policy-Report-Only` if you want one.

---

## 4. PAID-PLAN SECURITY CHECKLIST (tension-free package)

- [ ] **SSL/TLS → Overview**: mode **Full (strict)**.
- [ ] **SSL/TLS → Edge Certificates**: Minimum TLS **1.2**, TLS 1.3 on, HSTS enabled (or rely on the header above), Always Use HTTPS on.
- [ ] **Security → WAF → Managed rules**: Deployed / On (paid plan includes the Cloudflare Managed Ruleset).
- [ ] **Security → WAF → Rate limiting rules**: e.g. `(http.host eq "sg16finance.com" and starts_with(http.request.uri.path, "/api/"))` → 100 req/10s per IP → Managed Challenge. (App-level limits already exist: 60/min access & copilot, 5/min checkout, 8/min auth per IP.)
- [ ] **Security → Settings**: zone-level *Rate limiting* sanity + *Security Level: Medium*.
- [ ] **Workers → sg16finance → Settings**: keep `workersDev` route only for testing; production traffic via the two custom domains.
- [ ] **Secrets hygiene**: `SESSION_SECRET`, `TURNSTILE_*`, `RESEND_API_KEY`, `DODO_*`, `FINNHUB_WEBHOOK_SECRET` set via `wrangler secret put` / dashboard; never in git. `AUTH_DEV_LOG_CODE` must never exist in production (already enforced by config comments).
- [ ] **D1**: `sg16finance-db` backups on (paid), `cf d1 migrations apply sg16finance-db --remote` for schema changes.
- [ ] **Observability**: enable Workers Logs + zone Security Events email alerts so you see mitigations (this is how you would have caught the 403-challenge issue on day one).

---

## 5. Bot facts (so this never causes panic again)

| Thing | What it is | Can it block your users? |
|---|---|---|
| `ClaudeBot`, `GPTBot`, `PerplexityBot`… | AI training crawlers | **No** — they only fetch pages for indexing/training. |
| Super Bot Fight Mode | Edge bot classifier | **Yes**, if misconfigured (this incident). |
| WAF Managed Challenge | JS/interactive challenge | **Yes** — browsers pass it, APIs/webhooks/curl do not. |
| `robots.txt` Disallow | Polite crawler instruction | **No** — humans and search UIs unaffected. |

The commit that "removed the Anthropic engine" (2ffe85f) only changed which AI model answers
the in-app copilot; it never touched traffic. And commit 30e7161 (service-worker kill switch)
only clears stale Pages-era caches in visitors' browsers.

---

## 6. Repo changes shipped with this runbook (branch `redeploy-by-qwen`)

- `package.json`: deploy scripts moved to the `cf` CLI (`deploy`, `deploy:prebuilt`, `deploy:cron`);
  floating dependency tags (`latest`, `beta`) pinned to exact versions (supply-chain hygiene).
- `public/_headers`: + HSTS, Permissions-Policy, X-Permitted-Cross-Domain-Policies.
- `public/robots.txt`: AI-training crawlers disallowed (documented, harmless to humans/SEO).
- `public/.well-known/security.txt`: vulnerability contact point (RFC 9116).
- `wrangler.deploy.jsonc`: marked DEPRECATED (Wrangler guard makes it unusable while Build Output exists).
- `README.md`: deploy instructions updated to the `cf` path + dashboard table.
