/**
 * Real market-data ingestion. Runs from the cron Worker and writes into the shared D1 database.
 *
 * Sources (all free tiers, so every price is shown with its source and an as-of time):
 *  - US stocks + ETF proxies ........ Finnhub /quote (needs FINNHUB_API_KEY)
 *  - Crypto ......................... Coinbase Exchange 24h stats (market caps: CoinGecko, daily)
 *  - FX (daily ECB reference rates) . Frankfurter
 *  - US Treasury yields (daily) ..... home.treasury.gov CSV
 * Indices and commodities have no free licensed feed, so they are tracked through ETF proxies and
 * labelled as such in the asset name.
 */

export interface Env {
  DB: D1Database;
  FINNHUB_API_KEY: string;
}

interface Quote {
  symbol: string;
  price: number;
  prevClose: number;
  high?: number;
  low?: number;
  volume?: string;
  marketCap?: string;
  source: string;
  name?: string;
  exchange?: string;
}

const STOCKS = ["NVDA", "AAPL", "MSFT", "GOOGL", "TSLA"];

/** Display symbol -> [ETF ticker, display name]. */
const PROXIES: Record<string, [string, string]> = {
  SPX: ["SPY", "S&P 500 (via SPY ETF)"],
  NDX: ["QQQ", "Nasdaq 100 (via QQQ ETF)"],
  DJI: ["DIA", "Dow Jones (via DIA ETF)"],
  FTSE: ["EWU", "UK equities (via EWU ETF)"],
  N225: ["EWJ", "Japan equities (via EWJ ETF)"],
  DAX: ["EWG", "Germany equities (via EWG ETF)"],
  HSI: ["EWH", "Hong Kong equities (via EWH ETF)"],
  NIFTY: ["INDA", "India equities (via INDA ETF)"],
  GOLD: ["GLD", "Gold (via GLD ETF)"],
  BRENT: ["BNO", "Brent crude (via BNO ETF)"],
  COPPER: ["CPER", "Copper (via CPER ETF)"],
  NATGAS: ["UNG", "Natural gas (via UNG ETF)"],
};

/** CoinGecko id -> display symbol (Coinbase pair is `<symbol>-USD`). */
const COINS: Record<string, string> = { bitcoin: "BTC", ethereum: "ETH", solana: "SOL" };

const fmtPrice = (n: number) => n.toFixed(Math.abs(n) < 10 ? 4 : 2);
const fmtBig = (n: number) =>
  n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T` : n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : `$${(n / 1e6).toFixed(1)}M`;

function sentiment(pct: number): string {
  if (pct >= 2.5) return "Strong Bullish";
  if (pct >= 0.4) return "Bullish";
  if (pct <= -2.5) return "Strong Bearish";
  if (pct <= -0.4) return "Bearish";
  return "Neutral";
}

async function getJson<T>(url: string, label: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "sg16finance-ingest/1.0" } });
    if (!res.ok) {
      console.warn(`[ingest] ${label}: HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[ingest] ${label}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function ensureTables(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS market_meta (
      symbol TEXT PRIMARY KEY, prev_close REAL NOT NULL, source TEXT NOT NULL, as_of INTEGER NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS quote_history (
      symbol TEXT NOT NULL, ts INTEGER NOT NULL, price REAL NOT NULL, PRIMARY KEY (symbol, ts))`),
  ]);
}

// ---- sources ---------------------------------------------------------------------------------

async function fetchFinnhub(env: Env): Promise<Quote[]> {
  const targets: Array<{ symbol: string; ticker: string; proxy?: [string, string] }> = [
    ...STOCKS.map((s) => ({ symbol: s, ticker: s })),
    ...Object.entries(PROXIES).map(([symbol, p]) => ({ symbol, ticker: p[0], proxy: p })),
  ];
  const results = await Promise.all(
    targets.map(async (t) => {
      const d = await getJson<{ c: number; pc: number; h: number; l: number }>(
        `https://finnhub.io/api/v1/quote?symbol=${t.ticker}&token=${env.FINNHUB_API_KEY}`,
        `finnhub ${t.ticker}`,
      );
      if (!d || !(d.c > 0) || !(d.pc > 0)) return null;
      const quote: Quote = {
        symbol: t.symbol,
        price: d.c,
        prevClose: d.pc,
        high: d.h > 0 ? d.h : undefined,
        low: d.l > 0 ? d.l : undefined,
        source: t.proxy ? `Finnhub · ${t.ticker} ETF proxy` : "Finnhub",
      };
      if (t.proxy) {
        quote.name = t.proxy[1];
        quote.exchange = "NYSE Arca";
      }
      return quote;
    }),
  );
  return results.filter((q): q is Quote => q !== null);
}

async function fetchCrypto(): Promise<Quote[]> {
  const out = await Promise.all(
    Object.entries(COINS).map(async ([, symbol]) => {
      const d = await getJson<{ open: string; high: string; low: string; last: string; volume: string }>(
        `https://api.exchange.coinbase.com/products/${symbol}-USD/stats`,
        `coinbase ${symbol}`,
      );
      const last = Number(d?.last);
      const open = Number(d?.open);
      if (!d || !(last > 0) || !(open > 0)) return null;
      const quote: Quote = {
        symbol,
        price: last,
        prevClose: open, // 24h open: change is the rolling 24h move
        high: Number(d.high),
        low: Number(d.low),
        volume: fmtBig(Number(d.volume) * last),
        source: "Coinbase Exchange",
      };
      return quote;
    }),
  );
  return out.filter((q): q is Quote => q !== null);
}

/** Crypto market caps from CoinGecko, once a day (the free tier rate-limits shared server IPs, so failures are tolerated). */
async function fetchCryptoMarketCaps(): Promise<Record<string, string | null>> {
  const caps: Record<string, string | null> = { BTC: null, ETH: null, SOL: null };
  const d = await getJson<Record<string, { usd_market_cap?: number }>>(
    `https://api.coingecko.com/api/v3/simple/price?ids=${Object.keys(COINS).join(",")}&vs_currencies=usd&include_market_cap=true`,
    "coingecko market caps",
  );
  if (d) for (const [id, symbol] of Object.entries(COINS)) if (d[id]?.usd_market_cap) caps[symbol] = fmtBig(d[id].usd_market_cap!);
  return caps;
}

async function fetchFx(): Promise<Quote[]> {
  const start = new Date(Date.now() - 12 * 86_400_000).toISOString().slice(0, 10);
  const d = await getJson<{ rates: Record<string, Record<string, number>> }>(
    `https://api.frankfurter.dev/v1/${start}..?base=USD&symbols=EUR,JPY,GBP`,
    "frankfurter",
  );
  if (!d?.rates) return [];
  const days = Object.keys(d.rates).sort();
  if (days.length < 2) return [];
  const cur = d.rates[days[days.length - 1]];
  const prev = d.rates[days[days.length - 2]];
  const source = "ECB reference rate (daily)";
  return [
    { symbol: "EURUSD", price: 1 / cur.EUR, prevClose: 1 / prev.EUR, source },
    { symbol: "GBPUSD", price: 1 / cur.GBP, prevClose: 1 / prev.GBP, source },
    { symbol: "USDJPY", price: cur.JPY, prevClose: prev.JPY, source },
  ];
}

async function fetchYields(): Promise<Quote[]> {
  const year = new Date().getUTCFullYear();
  const load = async (y: number) => {
    try {
      const res = await fetch(
        `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${y}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${y}&page&_format=csv`,
      );
      return res.ok ? (await res.text()).trim().split("\n") : [];
    } catch {
      return [];
    }
  };
  let lines = await load(year);
  if (lines.length < 3) lines = [...lines, ...(await load(year - 1)).slice(1)]; // early January
  if (lines.length < 3) return [];
  const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const rows = lines.slice(1, 3).map((l) => l.split(",").map((c) => c.replace(/"/g, "").trim()));
  const col = (name: string) => header.indexOf(name);
  const out: Quote[] = [];
  for (const [symbol, tenor] of [["US10Y", "10 Yr"], ["US02Y", "2 Yr"]] as const) {
    const i = col(tenor);
    const cur = Number(rows[0]?.[i]);
    const prev = Number(rows[1]?.[i]);
    if (i >= 0 && cur > 0 && prev > 0) out.push({ symbol, price: cur, prevClose: prev, source: "US Treasury (daily)" });
  }
  return out;
}

// ---- persistence -----------------------------------------------------------------------------

async function applyQuotes(env: Env, quotes: Quote[], now: number, writeHistory: boolean) {
  if (!quotes.length) return;
  const db = env.DB;
  const existing = await db.prepare("SELECT symbol, price FROM market_assets").all<{ symbol: string; price: string }>();
  const known = new Map(existing.results.map((r) => [r.symbol, r.price]));

  const stmts: D1PreparedStatement[] = [];
  for (const q of quotes) {
    if (!known.has(q.symbol)) continue;
    const price = fmtPrice(q.price);
    const change = q.price - q.prevClose;
    const pct = q.prevClose ? (change / q.prevClose) * 100 : 0;
    const isYield = q.symbol.startsWith("US") && q.source.startsWith("US Treasury");
    const label = sentiment(pct);
    const range = q.high && q.low ? ` Session range ${fmtPrice(q.low)} to ${fmtPrice(q.high)}.` : "";
    const summary = `${pct >= 0 ? "Up" : "Down"} ${Math.abs(pct).toFixed(2)}% versus the prior reference value${isYield ? " (yield, percentage points)" : ""}.${range} Source: ${q.source}.`;

    if (known.get(q.symbol) !== price) {
      stmts.push(
        db
          .prepare(
            `UPDATE market_assets SET price = ?, change = ?, change_percent = ?, high_24h = ?, low_24h = ?,
               volume = COALESCE(?, volume), market_cap = COALESCE(?, market_cap),
               ai_sentiment = ?, ai_summary = ?, updated_at = ?,
               name = COALESCE(?, name), exchange = COALESCE(?, exchange) WHERE symbol = ?`,
          )
          .bind(
            price,
            change.toFixed(Math.abs(change) < 10 ? 4 : 2),
            pct.toFixed(2),
            q.high != null ? fmtPrice(q.high) : null,
            q.low != null ? fmtPrice(q.low) : null,
            q.volume ?? null,
            q.marketCap ?? null,
            label,
            summary,
            now,
            q.name ?? null,
            q.exchange ?? null,
            q.symbol,
          ),
      );
    }
    stmts.push(
      db
        .prepare(
          `INSERT INTO market_meta (symbol, prev_close, source, as_of) VALUES (?, ?, ?, ?)
           ON CONFLICT(symbol) DO UPDATE SET prev_close = excluded.prev_close, source = excluded.source, as_of = excluded.as_of`,
        )
        .bind(q.symbol, q.prevClose, q.source, now),
    );
    if (writeHistory) {
      const slot = Math.floor(now / 300_000) * 300_000; // 5-minute buckets
      stmts.push(db.prepare("INSERT OR IGNORE INTO quote_history (symbol, ts, price) VALUES (?, ?, ?)").bind(q.symbol, slot, q.price));
    }
  }
  for (let i = 0; i < stmts.length; i += 50) await db.batch(stmts.slice(i, i + 50));

  if (writeHistory) await refreshSparklines(db, now);
}

async function refreshSparklines(db: D1Database, now: number) {
  const rows = await db
    .prepare("SELECT symbol, price FROM quote_history WHERE ts >= ? ORDER BY symbol, ts")
    .bind(now - 24 * 3_600_000)
    .all<{ symbol: string; price: number }>();
  const bySymbol = new Map<string, number[]>();
  for (const r of rows.results) {
    const list = bySymbol.get(r.symbol) ?? [];
    list.push(r.price);
    bySymbol.set(r.symbol, list);
  }
  const stmts: D1PreparedStatement[] = [];
  for (const [symbol, series] of bySymbol) {
    if (series.length < 3) continue;
    const step = (series.length - 1) / 6;
    const points = Array.from({ length: 7 }, (_, i) => Number(series[Math.round(i * step)].toFixed(4)));
    stmts.push(db.prepare("UPDATE market_assets SET sparkline = ? WHERE symbol = ?").bind(JSON.stringify(points), symbol));
  }
  for (let i = 0; i < stmts.length; i += 50) await db.batch(stmts.slice(i, i + 50));
}

// ---- entry points ----------------------------------------------------------------------------

/** Runs every minute. Fast sources every run; daily-rate sources every 30 minutes (or when missing). */
export async function ingestMinute(env: Env, now = Date.now()) {
  await ensureTables(env.DB);
  const minute = new Date(now).getUTCMinutes();
  const writeHistory = minute % 5 === 0;

  const meta = await env.DB.prepare("SELECT COUNT(*) AS n FROM market_meta WHERE symbol IN ('EURUSD','US10Y')").first<{ n: number }>();
  const needDaily = minute % 30 === 0 || (meta?.n ?? 0) < 2;

  const [finnhub, crypto, fx, yields] = await Promise.all([
    fetchFinnhub(env),
    fetchCrypto(),
    needDaily ? fetchFx() : Promise.resolve([] as Quote[]),
    needDaily ? fetchYields() : Promise.resolve([] as Quote[]),
  ]);
  const all = [...finnhub, ...crypto, ...fx, ...yields];
  await applyQuotes(env, all, now, writeHistory);
  console.log(`[ingest] ${all.length} quotes (finnhub=${finnhub.length} crypto=${crypto.length} fx=${fx.length} yields=${yields.length})`);

  // Fundamentals refresh: on the first run and then at most once every 24 hours (self-healing, no separate trigger).
  const marker = await env.DB.prepare("SELECT as_of FROM market_meta WHERE symbol = '_fundamentals_v2'").first<{ as_of: number }>();
  if (!marker || now - marker.as_of > 24 * 3_600_000) {
    await ingestFundamentals(env);
    await env.DB
      .prepare(
        `INSERT INTO market_meta (symbol, prev_close, source, as_of) VALUES ('_fundamentals_v2', 0, 'finnhub metric', ?)
         ON CONFLICT(symbol) DO UPDATE SET as_of = excluded.as_of`,
      )
      .bind(now)
      .run();
  }
}

/** Daily: stock fundamentals (market cap, P/E, dividend yield) from Finnhub, and clear fields that do not apply. */
export async function ingestFundamentals(env: Env) {
  const stmts: D1PreparedStatement[] = [];
  for (const symbol of STOCKS) {
    const d = await getJson<{ metric?: Record<string, number | null> }>(
      `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${env.FINNHUB_API_KEY}`,
      `metric ${symbol}`,
    );
    const m = d?.metric;
    if (!m) continue;
    const cap = m.marketCapitalization ? fmtBig(m.marketCapitalization * 1e6) : null;
    const pe = m.peTTM ?? m.peBasicExclExtraTTM;
    const dy = m.dividendYieldIndicatedAnnual;
    stmts.push(
      env.DB
        .prepare("UPDATE market_assets SET market_cap = COALESCE(?, market_cap), pe_ratio = ?, dividend_yield = ? WHERE symbol = ?")
        .bind(cap, pe ? pe.toFixed(2) : null, dy != null ? dy.toFixed(2) : "0.00", symbol),
    );
  }
  const caps = await fetchCryptoMarketCaps();
  for (const [symbol, cap] of Object.entries(caps)) {
    stmts.push(env.DB.prepare("UPDATE market_assets SET market_cap = ?, pe_ratio = NULL, dividend_yield = NULL WHERE symbol = ?").bind(cap, symbol));
  }
  // Indices / commodities / FX / yields have no market cap, P/E or dividend yield: remove the old placeholder values.
  const na = [...Object.keys(PROXIES), "EURUSD", "GBPUSD", "USDJPY", "US10Y", "US02Y"];
  stmts.push(
    env.DB
      .prepare(`UPDATE market_assets SET market_cap = NULL, pe_ratio = NULL, dividend_yield = NULL WHERE symbol IN (${na.map(() => "?").join(",")})`)
      .bind(...na),
  );
  await env.DB.batch(stmts);
  console.log(`[ingest] fundamentals updated for ${stmts.length - 1} stock(s)`);
}

/** Housekeeping for the history table. */
export async function pruneHistory(env: Env, now = Date.now()) {
  await ensureTables(env.DB);
  const res = await env.DB.prepare("DELETE FROM quote_history WHERE ts < ?").bind(now - 48 * 3_600_000).run();
  console.log(`[cron] quote_history: removed ${res.meta.changes ?? 0} row(s)`);
}
