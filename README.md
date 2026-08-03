# SG16 Finance

International stock intelligence — sector overviews, earnings breakdowns, and plain-English market context.

**Domain:** [sg16finance.com](https://sg16finance.com)  
**Operator:** [Saif Tech Global Limited](https://saiftechglobal.com)

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output: `dist/`

## Deploy (Cloudflare Pages)

**Netlify is not used.** `sg16finance.com` DNS is on Cloudflare; connect Pages and add the custom domain to replace any old Netlify origin.

### One-time setup (Cloudflare dashboard)

1. [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) → **Create** → **Pages** → **Connect to Git**
2. Repo: `sg16global/sg16finance`, branch `main`
3. Build command: `npm run build` · Output directory: `dist`
4. **Custom domains** → add `sg16finance.com` and `www.sg16finance.com`  
   Cloudflare updates DNS automatically — this removes Netlify from the path.
5. Optional env: `FINNHUB_API_KEY` for live quotes at `/api/quotes`

### CI deploy (alternative)

Add GitHub repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Pushes to `main` run `.github/workflows/deploy.yml`.

- Build command: `npm run build`
- Output directory: `dist`
- Project name: `sg16finance`

## Routes

`/`, `/markets`, `/sectors`, `/sectors/:slug`, `/earnings`, `/earnings/:symbol`, `/about`, `/disclaimer`, `/privacy`, `/contact`, `/premium`
