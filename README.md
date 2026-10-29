# SG16 Finance

Institutional-grade market intelligence — global indices, GICS sectors, earnings breakdowns, watchlist, and 24/7 AI Sentinel.

**Production:** [sg16finance.com](https://sg16finance.com)  
**Operator:** Saif Tech Global LLC

Stack: **Next.js 16**, **Cloudflare Workers** (vinext), **Cloudflare D1** (SQLite), **Drizzle ORM**.

No external Postgres (Neon/Supabase) required — data lives in **D1** on Cloudflare.

## Local development

```bash
npm install
mkdir -p .data
npm run db:push
npm run db:seed
npm run dev
```

Optional: set `LOCAL_DATABASE_URL=file:.data/sg16finance.db` in `.env.local` (default).

For Workers-parity dev: `npm run dev:vinext`.

## Database (D1)

| Environment | Storage |
|-------------|---------|
| **Production** | Cloudflare D1 binding `DB` (`database_name: sg16finance`) |
| **Local `next dev`** | SQLite file `.data/sg16finance.db` |

### Fresh / clean data

```bash
# Local
rm -f .data/sg16finance.db
npm run db:push
npm run db:seed
```

Production (after deploy, from your machine with Cloudflare CLI):

```bash
cf d1 migrations apply sg16finance --remote
npm run db:seed
```

Or push schema via Drizzle against remote D1 using Cloudflare credentials (see [D1 + Drizzle](https://orm.drizzle.team/docs/get-started/d1-new)).

The app also auto-seeds on first request when tables are empty.

## Deploy to Cloudflare

Worker name: **sg16finance** (`cloudflare.config.ts` includes D1 binding `DB`, domains,
rate limits, AI binding and secrets).

This is a **`cf` CLI project**: `vite build` writes Cloudflare Build Output to
`.cloudflare/output/v0/`, and current Wrangler **refuses** to deploy that directory —
always deploy with `cf`, never with `wrangler deploy`/`wrangler preview` (see `OPS-RUNBOOK.md`).

```bash
npm install
cf auth login
npm run deploy            # build + deploy in one step
# or, when .cloudflare/output already exists:
npm run deploy:prebuilt   # cf deploy --prebuilt
```

Attach **sg16finance.com** / **www** as custom domains on the Worker (already declared in
`cloudflare.config.ts`, re-applied on every deploy). Disconnect legacy **Pages** `dist`
deploy if still active.

### Dashboard auto-deploy (Workers Builds)

| Setting | Value |
|---|---|
| Build command | `npm run build:vinext` |
| Deploy command (production) | `npx cf deploy --prebuilt` |
| Deploy command (preview/branch triggers) | `npx cf previews deploy --prebuilt` |

The Cron Worker is a plain Wrangler Worker: `npm run deploy:cron`.

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev (local SQLite) |
| `npm run dev:vinext` | vinext dev with D1 simulation |
| `npm run build:vinext` | Build for Workers (`.cloudflare/output`) |
| `npm run deploy` | `cf deploy` (build + upload) |
| `npm run deploy:prebuilt` | `cf deploy --prebuilt` (upload existing output) |
| `npm run deploy:cron` | Deploy the cron Worker (Wrangler) |
| `npm run db:push` | Apply schema (local file) |
| `npm run db:seed` | Load institutional seed data |
| `npm test` | Run the vitest suite (security, passes, access gating) |
