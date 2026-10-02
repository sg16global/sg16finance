# SG16 Finance

Institutional-grade market intelligence — global indices, GICS sectors, earnings breakdowns, watchlist, and 24/7 AI Sentinel.

**Production:** [sg16finance.com](https://sg16finance.com)  
**Operator:** Saif Tech Global LLC

Stack: **Next.js 16** (App Router), **Drizzle ORM**, **PostgreSQL**, deployed to **Cloudflare Workers** via [vinext](https://github.com/cloudflare/vinext).

## Local development

```bash
npm install
cp .env.example .env.local
# Start PostgreSQL and create database `sg16finance`
npx drizzle-kit push
npx tsx src/db/run-seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run dev:vinext` | vinext dev (Workers-like) |
| `npm run build` | Next.js production build |
| `npm run build:vinext` | Build for Cloudflare Workers |
| `npm run deploy:vinext` | Deploy Worker to Cloudflare |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |

## Database (fresh / clean data)

To wipe and re-seed locally:

```bash
# Drop and recreate public schema in your Postgres DB, then:
npx drizzle-kit push
npx tsx src/db/run-seed.ts
```

The app auto-seeds on first request if tables are empty (`ensureDataSeeded`).

## Deploy to Cloudflare (sg16finance.com)

### 1. PostgreSQL in production

Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) (free tier is fine). Create a database and note the connection string.

Optional but recommended: [Hyperdrive](https://developers.cloudflare.com/hyperdrive/) in the Cloudflare dashboard, pointed at that database. Use the Hyperdrive connection string as `DATABASE_URL`.

### 2. Worker secrets

In Cloudflare → Workers → **sg16finance** → Settings → Variables:

- **`DATABASE_URL`** (secret): Postgres or Hyperdrive connection string

After first deploy, run schema + seed against production once (from your machine with production `DATABASE_URL`):

```bash
npx drizzle-kit push
npx tsx src/db/run-seed.ts
```

### 3. Custom domain

After `npm run deploy:vinext`, attach **sg16finance.com** and **www.sg16finance.com** to the Worker in the Cloudflare dashboard (Workers & Pages → sg16finance → Custom domains).

DNS for the zone should stay on Cloudflare; remove any legacy Netlify/Pages origins for the apex.

### 4. GitHub Actions (optional)

Add repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Pushes to `main` run `.github/workflows/deploy.yml` (build + `deploy:vinext`).

## Routes

`/`, `/markets`, `/sectors`, `/sectors/:slug`, `/earnings`, `/earnings/:symbol`, `/watchlist`, `/ai-copilot`, `/premium`, `/about`, `/contact`, `/disclaimer`, `/privacy`
