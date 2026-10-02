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

Worker name: **sg16finance** (`cloudflare.config.ts` includes D1 binding `DB`).

```bash
cf auth login
npm run build:vinext
npm run deploy:vinext
```

Attach **sg16finance.com** / **www** as custom domains on the Worker. Disconnect legacy **Pages** `dist` deploy if still active.

### GitHub Actions

Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` — pushes to `main` run `.github/workflows/deploy.yml`.

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev (local SQLite) |
| `npm run dev:vinext` | vinext dev with D1 simulation |
| `npm run build:vinext` | Build for Workers |
| `npm run deploy:vinext` | Deploy to Cloudflare |
| `npm run db:push` | Apply schema (local file) |
| `npm run db:seed` | Load institutional seed data |
