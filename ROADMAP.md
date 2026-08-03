# SG16 Finance — roadmap

| Area | Status | Notes |
|------|--------|-------|
| **Deploy** | Done | GitHub → Cloudflare Pages → sg16finance.com live |
| **Inner pages** | Done | Markets, sectors, earnings, about — glass-shield theme |
| **Premium** | Done | Orange brand, waitlist CTA |
| **Live data** | Ready | `/api/quotes` + `/api/ticker` — add `FINNHUB_API_KEY` in Pages env |
| **Search** | Done | Header search → sectors, symbols, companies, pages |
| **AI assistant** | Phase 1 | Bot icon links to [sg16engine.com](https://sg16engine.com) |
| **Auth / Premium pay** | Later | Dodo or Stripe when you approve |
| **Mobile** | Done | Map height + card stack on small screens |
| **SEO** | Done | sitemap, robots, OG image, Twitter card |
| **Content** | Ongoing | 8 earnings, 6 sectors — add articles weekly for AdSense |
| **Legal / ads** | Ready | Privacy, cookie banner, AdSlot placeholders |
| **Performance** | Done | Geo JSON loads when map enters viewport |
| **Favicon** | Done | Globe-only SVG at `/favicon.svg` |

## Next boss moves

1. **Google Search Console** — submit `sitemap.xml`
2. **AdSense** — apply, then wire publisher ID into `AdSlot.tsx`
3. **Finnhub** — Cloudflare Pages → Settings → Environment → `FINNHUB_API_KEY`
4. **www** — confirm `www.sg16finance.com` custom domain active
5. **Cross-links** — saiftechglobal.com → SG16 Finance (when you say go)
