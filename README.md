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

- Build command: `npm run build`
- Output directory: `dist`
- Optional env: `FINNHUB_API_KEY` for live quotes at `/api/quotes`
- Custom domain: `sg16finance.com`

## Routes

`/`, `/markets`, `/sectors`, `/sectors/:slug`, `/earnings`, `/earnings/:symbol`, `/about`, `/disclaimer`, `/privacy`, `/contact`, `/premium`
