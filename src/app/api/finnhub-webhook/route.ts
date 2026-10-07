import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { marketAssets } from "@/db/schema";

export const dynamic = "force-dynamic";

interface FinnhubTrade {
  p: number; // last price
  s: string; // symbol
  t: number; // unix ms timestamp
  v: number; // volume
}

interface FinnhubPayload {
  type?: string;
  data?: FinnhubTrade[];
}

async function getWebhookSecret(): Promise<string | undefined> {
  try {
    const { env } = await import("cloudflare:workers");
    const value = (env as { FINNHUB_WEBHOOK_SECRET?: string }).FINNHUB_WEBHOOK_SECRET;
    if (value) return value;
  } catch {
    // Not running on Workers (local dev) — fall through to process.env
  }
  return process.env.FINNHUB_WEBHOOK_SECRET;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Finnhub webhook receiver: POST https://sg16finance.com/api/finnhub-webhook */
export async function POST(request: Request) {
  const secret = await getWebhookSecret();
  if (!secret) {
    console.error("FINNHUB_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ success: false, error: "Webhook not configured" }, { status: 500 });
  }

  const provided = request.headers.get("x-finnhub-secret") ?? "";
  if (!safeEqual(provided, secret)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let payload: FinnhubPayload;
  try {
    payload = (await request.json()) as FinnhubPayload;
  } catch {
    // Acknowledge anyway so Finnhub does not keep retrying a malformed body
    return NextResponse.json({ success: true, processed: 0 });
  }

  // Keep only the latest trade per symbol
  const latest = new Map<string, FinnhubTrade>();
  if (payload.type === "trade" && Array.isArray(payload.data)) {
    for (const trade of payload.data) {
      if (!trade || typeof trade.s !== "string" || !Number.isFinite(trade.p)) continue;
      const prev = latest.get(trade.s);
      if (!prev || trade.t >= prev.t) latest.set(trade.s, trade);
    }
  }

  let processed = 0;
  try {
    const db = await getDb();
    for (const [symbol, trade] of latest) {
      const digits = trade.p < 10 ? 4 : 2;
      await db
        .update(marketAssets)
        .set({ price: trade.p.toFixed(digits), updatedAt: new Date() })
        .where(eq(marketAssets.symbol, symbol.toUpperCase()));
      processed++;
    }
  } catch (error) {
    console.error("Finnhub webhook processing error:", error);
  }

  return NextResponse.json({ success: true, processed });
}
