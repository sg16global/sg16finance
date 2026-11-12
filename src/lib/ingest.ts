/**
 * sg16finance Worker — INGEST LOGIC
 *
 * This is the COMPLETE code extracted from the sg16finance-cron Worker.
 * Place this file at: lib/ingest.ts (or src/lib/ingest.ts) in your
 * sg16finance Next.js project.
 *
 * The sg16finance Worker already has these bindings:
 *   - DB (D1 → sg16finance-db)
 *   - FINNHUB_API_KEY (secret)
 * so no new bindings are needed.
 *
 * Exported functions used by app/api/cron/route.ts:
 *   - ingestMinute(env, now?)  — called every minute
 *   - cleanup(env, now?)       — called daily at 3 AM
 *   - pruneHistory(env, now?)  — called daily at 3 AM
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface Env {
  DB: D1Database;
  FINNHUB_API_KEY: string;
  CRON_SECRET: string;
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

// ─── Constants ───────────────────────────────────────────────────────

const STOCKS = ["NVDA", "AAPL", "MSFT", "GOOGL", "TSLA"];

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

const COINS: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
};

const DAY_MS = 86400000;
const EXPIRED_PASS_GRACE_DAYS = 7;
const USAGE_RETENTION_DAYS = 60;
const WEBHOOK_LOG_RETENTION_DAYS = 90;

// ─── Helpers ────────────────────────────────────────────────────────

const fmtPrice = (n: number): string => n.toFixed(Math.abs(n) < 10 ? 4 : 2);

const fmtBig = (n: number): string =>
  n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T`
  : n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B`
  : `$${(n / 1e6).toFixed(1)}M`;

function sentiment(pct: number): string {
  if (pct >= 2.5) return "Strong Bullish";
  if (pct >= 0.4) return "Bullish";
  if (pct <= -2.5) return "Strong Bearish";
  if (pct <= -0.4) return "Bearish";
  return "Neutral";
}

async function getJson(url: string, label: string): Promise<any | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "sg16finance-ingest/1.0" } });
    if (!res.ok) {
      console.warn(`[ingest] ${label}: HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.warn(`[ingest] ${label}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

// ─── Table Setup ────────────────────────────────────────────────────

async function ensureTables(db: D1Database): Promise<void> {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS market_meta (
      symbol TEXT PRIMARY KEY, prev_close REAL NOT NULL, source TEXT NOT NULL, as_of INTEGER NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS quote_history (
      symbol TEXT NOT NULL, ts INTEGER NOT NULL, price REAL NOT NULL, PRIMARY KEY (symbol, ts))`),
  ]);
}

// ─── Data Fetchers ──────────────────────────────────────────────────

async function fetchFinnhub(env: Env): Promise<Quote[]> {
  const targets = [
    ...STOCKS.map((s) => ({ symbol: s, ticker: s })),
    ...Object.entries(PROXIES).map(([symbol, p]) => ({ symbol, ticker: p[0], proxy: p })),
  ];

  const results = await Promise.all(
    targets.map(async (t) => {
      const d = await getJson(
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
        source: (t as any).proxy ? `Finnhub · ${(t as any).ticker} ETF proxy` : "Finnhub",
      };

      if ((t as any).proxy) {
        quote.name = (t as any).proxy[1];
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
      const d = await getJson(
        `https://api.exchange.coinbase.com/products/${symbol}-USD/stats`,
        `coinbase ${symbol}`,
      );
      const last = Number(d?.last);
      const open = Number(d?.open);
      if (!d || !(last > 0) || !(open > 0)) return null;

      const quote: Quote = {
        symbol,
        price: last,
        prevClose: open,
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

async function fetchCryptoMarketCaps(): Promise<Record<string, string | null>> {
  const caps: Record<string, string | null> = { BTC: null, ETH: null, SOL: null };
  const d = await getJson(
    `https://api.coingecko.com/api/v3/simple/price?ids=${Object.keys(COINS).join(",")}&vs_currencies=usd&include_market_cap=true`,
    "coingecko market caps",
  );
  if (d) {
    for (const [id, symbol] of Object.entries(COINS)) {
      if (d[id]?.usd_market_cap) caps[symbol] = fmtBig(d[id].usd_market_cap);
    }
  }
  return caps;
}

async function fetchFx(): Promise<Quote[]> {
  const start = new Date(Date.now() - 12 * 86400000).toISOString().slice(0, 10);
  const d = await getJson(
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

  const load = async (y: number): Promise<string[]> => {
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
  if (lines.length < 3) lines = [...lines, ...(await load(year - 1)).slice(1)];
  if (lines.length < 3) return [];

  const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const rows = lines.slice(1, 3).map((l) => l.split(",").map((c) => c.replace(/"/g, "").trim()));
  const col = (name: string): number => header.indexOf(name);

  const out: Quote[] = [];
  for (const [symbol, tenor] of [["US10Y", "10 Yr"], ["US02Y", "2 Yr"]] as [string, string][]) {
    const i = col(tenor);
    const cur = Number(rows[0]?.[i]);
    const prev = Number(rows[1]?.[i]);
    if (i >= 0 && cur > 0 && prev > 0) {
      out.push({ symbol, price: cur, prevClose: prev, source: "US Treasury (daily)" });
    }
  }
  return out;
}

// ─── Apply Quotes to D1 ─────────────────────────────────────────────

async function applyQuotes(env: Env, quotes: Quote[], now: number, writeHistory: boolean): Promise<void> {
  if (!quotes.length) return;
  const db = env.DB;

  const existing = await db.prepare("SELECT symbol, price FROM market_assets").all();
  const known = new Map(existing.results.map((r: any) => [r.symbol, r.price]));

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
        db.prepare(
          `UPDATE market_assets SET price = ?, change = ?, change_percent = ?, high_24h = ?, low_24h = ?,
               volume = COALESCE(?, volume), market_cap = COALESCE(?, market_cap),
               ai_sentiment = ?, ai_summary = ?, updated_at = ?,
               name = COALESCE(?, name), exchange = COALESCE(?, exchange) WHERE symbol = ?`,
        ).bind(
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
      db.prepare(
        `INSERT INTO market_meta (symbol, prev_close, source, as_of) VALUES (?, ?, ?, ?)
           ON CONFLICT(symbol) DO UPDATE SET prev_close = excluded.prev_close, source = excluded.source, as_of = excluded.as_of`,
      ).bind(q.symbol, q.prevClose, q.source, now),
    );

    if (writeHistory) {
      const slot = Math.floor(now / 300000) * 300000;
      stmts.push(
        db.prepare("INSERT OR IGNORE INTO quote_history (symbol, ts, price) VALUES (?, ?, ?)").bind(q.symbol, slot, q.price),
      );
    }
  }

  for (let i = 0; i < stmts.length; i += 50) {
    await db.batch(stmts.slice(i, i + 50));
  }

  if (writeHistory) await refreshSparklines(db, now);
}

async function refreshSparklines(db: D1Database, now: number): Promise<void> {
  const rows = await db
    .prepare("SELECT symbol, price FROM quote_history WHERE ts >= ? ORDER BY symbol, ts")
    .bind(now - 24 * 3600000)
    .all();

  const bySymbol = new Map<string, number[]>();
  for (const r of rows.results as any[]) {
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

  for (let i = 0; i < stmts.length; i += 50) {
    await db.batch(stmts.slice(i, i + 50));
  }
}

// ─── Ingest (every minute) ──────────────────────────────────────────

export async function ingestMinute(env: Env, now: number = Date.now()): Promise<void> {
  await ensureTables(env.DB);

  const minute = new Date(now).getUTCMinutes();
  const writeHistory = minute % 5 === 0;

  const meta = await env.DB.prepare("SELECT COUNT(*) AS n FROM market_meta WHERE symbol IN ('EURUSD','US10Y')").first();
  const needDaily = minute % 30 === 0 || (meta?.n ?? 0) < 2;

  const [finnhub, crypto, fx, yields] = await Promise.all([
    fetchFinnhub(env),
    fetchCrypto(),
    needDaily ? fetchFx() : Promise.resolve([]),
    needDaily ? fetchYields() : Promise.resolve([]),
  ]);

  const all = [...finnhub, ...crypto, ...fx, ...yields];
  await applyQuotes(env, all, now, writeHistory);

  console.log(`[ingest] ${all.length} quotes (finnhub=${finnhub.length} crypto=${crypto.length} fx=${fx.length} yields=${yields.length})`);

  const marker = await env.DB.prepare("SELECT as_of FROM market_meta WHERE symbol = '_fundamentals_v2'").first();
  if (!marker || now - marker.as_of > 24 * 3600000) {
    await ingestFundamentals(env);
    await env.DB.prepare(
      `INSERT INTO market_meta (symbol, prev_close, source, as_of) VALUES ('_fundamentals_v2', 0, 'finnhub metric', ?)
         ON CONFLICT(symbol) DO UPDATE SET as_of = excluded.as_of`,
    ).bind(now).run();
  }
}

async function ingestFundamentals(env: Env): Promise<void> {
  const stmts: D1PreparedStatement[] = [];

  for (const symbol of STOCKS) {
    const d = await getJson(
      `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${env.FINNHUB_API_KEY}`,
      `metric ${symbol}`,
    );
    const m = d?.metric;
    if (!m) continue;

    const cap = m.marketCapitalization ? fmtBig(m.marketCapitalization * 1e6) : null;
    const pe = m.peTTM ?? m.peBasicExclExtraTTM;
    const dy = m.dividendYieldIndicatedAnnual;

    stmts.push(
      env.DB.prepare(
        "UPDATE market_assets SET market_cap = COALESCE(?, market_cap), pe_ratio = ?, dividend_yield = ? WHERE symbol = ?",
      ).bind(cap, pe ? pe.toFixed(2) : null, dy != null ? dy.toFixed(2) : "0.00", symbol),
    );
  }

  const caps = await fetchCryptoMarketCaps();
  for (const [symbol, cap] of Object.entries(caps)) {
    stmts.push(
      env.DB.prepare("UPDATE market_assets SET market_cap = ?, pe_ratio = NULL, dividend_yield = NULL WHERE symbol = ?").bind(cap, symbol),
    );
  }

  const na = [...Object.keys(PROXIES), "EURUSD", "GBPUSD", "USDJPY", "US10Y", "US02Y"];
  stmts.push(
    env.DB.prepare(
      `UPDATE market_assets SET market_cap = NULL, pe_ratio = NULL, dividend_yield = NULL WHERE symbol IN (${na.map(() => "?").join(",")})`,
    ).bind(...na),
  );

  await env.DB.batch(stmts);
  console.log(`[ingest] fundamentals updated for ${stmts.length - 1} stock(s)`);
}

// ─── Prune History (daily) ──────────────────────────────────────────

export async function pruneHistory(env: Env, now: number = Date.now()): Promise<void> {
  await ensureTables(env.DB);
  const res = await env.DB.prepare("DELETE FROM quote_history WHERE ts < ?").bind(now - 48 * 3600000).run();
  console.log(`[cron] quote_history: removed ${res.meta.changes ?? 0} row(s)`);
}

// ─── Cleanup (daily) ────────────────────────────────────────────────

export async function cleanup(env: Env, now: number = Date.now()): Promise<void> {
  const cutoff = (days: number): number => now - days * DAY_MS;
  const usageCutoffDay = new Date(cutoff(USAGE_RETENTION_DAYS)).toISOString().slice(0, 10);

  const jobs: [string, D1PreparedStatement][] = [
    ["access_passes", env.DB.prepare("DELETE FROM access_passes WHERE expires_at < ?").bind(cutoff(EXPIRED_PASS_GRACE_DAYS))],
    ["login_codes", env.DB.prepare("DELETE FROM login_codes WHERE expires_at < ?").bind(now)],
    ["pass_usage", env.DB.prepare("DELETE FROM pass_usage WHERE day < ?").bind(usageCutoffDay)],
    ["dodo_events", env.DB.prepare("DELETE FROM dodo_events WHERE created_at < ?").bind(cutoff(WEBHOOK_LOG_RETENTION_DAYS))],
  ];

  for (const [table, stmt] of jobs) {
    try {
      const res = await stmt.run();
      console.log(`[cron] ${table}: removed ${res.meta.changes ?? 0} row(s)`);
    } catch (error) {
      console.warn(`[cron] ${table}: skipped (${error instanceof Error ? error.message : String(error)})`);
    }
  }
}
