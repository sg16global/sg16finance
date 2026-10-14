import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { marketAssets } from "@/db/schema";
import { requireActivePass } from "@/lib/access";
import { getSessionEmail } from "@/lib/security";

/** Free-tier quotes are served this far behind the latest stored price. */
export const DELAY_MS = 15 * 60_000;

export type MarketAsset = typeof marketAssets.$inferSelect & {
  /** True when this price is the 15-minute-old one (free tier). */
  delayed: boolean;
  /** ISO time the underlying price was last refreshed from the data source. */
  asOf: string | null;
  source: string | null;
};

let tablesReady = false;

/** Same tables the ingestion Worker creates; harmless if they already exist. */
async function ensureMarketTables() {
  if (tablesReady) return;
  const db = await getDb();
  await db.run(sql`CREATE TABLE IF NOT EXISTS market_meta (
    symbol TEXT PRIMARY KEY, prev_close REAL NOT NULL, source TEXT NOT NULL, as_of INTEGER NOT NULL)`);
  await db.run(sql`CREATE TABLE IF NOT EXISTS quote_history (
    symbol TEXT NOT NULL, ts INTEGER NOT NULL, price REAL NOT NULL, PRIMARY KEY (symbol, ts))`);
  tablesReady = true;
}

const fmtPrice = (n: number) => n.toFixed(Math.abs(n) < 10 ? 4 : 2);

/** True only for a signed-in visitor with an active pass: they get the latest stored prices. */
export async function hasLiveAccess(request: Request): Promise<boolean> {
  if (!(await getSessionEmail(request))) return false;
  return (await requireActivePass(request)).ok;
}

/** All tracked assets. Everyone gets real stored data; non-pass visitors get it 15 minutes behind. */
export async function loadMarketAssets(live: boolean): Promise<MarketAsset[]> {
  await ensureMarketTables();
  const db = await getDb();
  const assets = await db.select().from(marketAssets);

  const meta = new Map(
    (await db.all<{ symbol: string; prev_close: number; source: string; as_of: number }>(sql`SELECT * FROM market_meta`)).map(
      (m) => [m.symbol, m],
    ),
  );

  const delayedPrice = new Map<string, number>();
  if (!live) {
    const cutoff = Date.now() - DELAY_MS;
    const rows = await db.all<{ symbol: string; price: number }>(sql`
      SELECT h.symbol, h.price FROM quote_history h
      WHERE h.ts = (SELECT MAX(ts) FROM quote_history WHERE symbol = h.symbol AND ts <= ${cutoff})`);
    for (const r of rows) delayedPrice.set(r.symbol, r.price);
  }

  return assets.map((a) => {
    const m = meta.get(a.symbol);
    const base: MarketAsset = { ...a, delayed: false, asOf: m ? new Date(m.as_of).toISOString() : null, source: m?.source ?? null };
    const older = delayedPrice.get(a.symbol);
    if (live || older === undefined) return base;

    const change = m ? older - m.prev_close : Number(a.change);
    const pct = m && m.prev_close ? (change / m.prev_close) * 100 : Number(a.changePercent);
    return {
      ...base,
      price: fmtPrice(older),
      change: change.toFixed(Math.abs(change) < 10 ? 4 : 2),
      changePercent: pct.toFixed(2),
      delayed: true,
      asOf: new Date(Date.now() - DELAY_MS).toISOString(),
    };
  });
}
