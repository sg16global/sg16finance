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

## 1. UNBLOCK THE SITE — measured state & fixes (zone is on the FREE plan)

Live diagnosis 2026-10-30 (via API token `qwen-ops-temp-2026-10-30`):

| Finding | Value | Meaning |
|---|---|---|
| Zone plan | **Free Website** | No Super Bot Fight Mode, no skip-rule exemption for Bot Fight Mode |
| `security_level` | `medium` | already sane — was NOT the blocker |
| Bot Fight Mode | `fight_mode: true` | **THE blocker**: challenges/blocks every non-browser client (webhooks, curl, monitors) |
| Custom/managed/ratelimit rulesets | 403 for token on Free plan | no catch-all challenge rule exists to disable |
| Workers paid plan | yes (separate from zone) | unrelated to zone bot behaviour |

### Applied via API on 2026-10-30 (already live ✅)
- `security_header`: HSTS `max-age=63072000; includeSubDomains` + `nosniff` at the edge.
- Transform rule (phase `http_response_headers_transform`, expression `true`): sets on **every
  response** — `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(),
  geolocation=(), payment=(self)`, `X-Permitted-Cross-Domain-Policies: none`.
  (Free-plan API rejects a rule-level `name` field — the rule is intentionally unnamed.)

### STILL REQUIRED — one dashboard click (token gets 405 on Free plan)
**Zone sg16finance.com → Security → Bots → Bot Fight Mode: switch OFF.**
Keep *crawler protection / AI-crawlers* options as they are (AI training already disallowed,
matching `robots.txt`). Bot Fight Mode on Free plan cannot be exempted per-path (Cloudflare docs:
"you cannot skip Bot Fight Mode"), and it is what challenges Dodo/Finnhub webhook POSTs —
those endpoints authenticate themselves in code (HMAC + 5-min timestamp window), so edge
bot-guessing adds risk, not security, here.

Compensating controls while fight mode is off: security level medium, Free-plan managed ruleset,
app-level Workers rate limits (60/5/8 per min per IP), Turnstile on checkout/sign-in, HMAC-signed
webhooks, encrypted sessions. If the zone is ever upgraded to Pro/Business: re-enable **Super**
Bot Fight Mode (definitely=block, likely=managed challenge, verified=allow) AND add the webhook
skip rule from `tools/cf-fix.mjs` comments — SBFM (unlike free Bot Fight Mode) *can* be skipped.

Verify after the click: `curl -sI https://sg16finance.com/api/health` → **200**, no `cf-mitigated`.

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

## 3. SECURITY HEADERS ON EVERY RESPONSE — DONE via API ✅

`public/_headers` covers **static assets**; the edge transform rule (Part 1) covers **every
response including SSR pages and `/api/*`**: nosniff, XFO DENY, Referrer-Policy,
Permissions-Policy, X-Permitted-Cross-Domain-Policies, plus HSTS via the zone `security_header`
setting. Nothing left to click here.

Do **not** add a strict Content-Security-Policy yet — vinext/Next emits inline scripts and
nonces per request; a wrong CSP would break the app. Revisit after testing with
`Content-Security-Policy-Report-Only` if you want one.

---

## 4. PAID-PLAN SECURITY CHECKLIST (tension-free package)

- [ ] **SSL/TLS → Overview**: mode **Full (strict)**.
- [ ] **SSL/TLS → Edge Certificates**: Minimum TLS **1.2**, TLS 1.3 on, HSTS enabled (or rely on the header above), Always Use HTTPS on.
- [ ] **Security → WAF → Managed rules**: Deployed / On (paid plan includes the Cloudflare Managed Ruleset).
- [ ] **Security → WAF → Rate limiting rules**: e.g. `(http.host eq "sg16finance.com" and starts_with(http.request.uri.path, "/api/"))` → 100 req/10s per IP → Managed Challenge. (App-level limits already exist: 60/min access & copilot, 5/min checkout, 8/min auth per IP.)
- [ ] **Security → Bots**: Bot Fight Mode **OFF** (Free plan; the one required click — see Part 1). Revisit only after a zone upgrade to Pro+.
- [ ] **Security → Settings**: zone-level *Security Level: Medium* (verified 2026-10-30 ✅).
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
