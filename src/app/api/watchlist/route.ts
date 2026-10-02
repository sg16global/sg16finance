import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userWatchlist, marketAssets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureDataSeeded } from "@/db/ensure-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDataSeeded();
    const db = await getDb();
    const watchlist = await db.select().from(userWatchlist).orderBy(userWatchlist.createdAt);
    const assets = await db.select().from(marketAssets);
    const assetMap = new Map(assets.map((a) => [a.symbol, a]));

    const enriched = watchlist.map((item) => {
      const currentAsset = assetMap.get(item.symbol);
      const currentPrice = currentAsset ? Number(currentAsset.price) : Number(item.priceAtAdd);
      const priceAtAdd = Number(item.priceAtAdd);
      const gainSinceAdd = (((currentPrice - priceAtAdd) / priceAtAdd) * 100).toFixed(2);

      return {
        ...item,
        currentPrice: currentPrice.toFixed(2),
        changePercent: currentAsset?.changePercent ?? "0.00",
        gainSinceAdd,
        aiSentiment: currentAsset?.aiSentiment ?? "Neutral",
      };
    });

    return NextResponse.json({ success: true, watchlist: enriched });
  } catch (error) {
    console.error("Watchlist GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDataSeeded();
    const db = await getDb();
    const body = await request.json();
    const { symbol, targetPrice, notes, alertCondition } = body;

    if (!symbol) {
      return NextResponse.json({ success: false, error: "Symbol is required" }, { status: 400 });
    }

    // Lookup asset price
    const asset = await db.select().from(marketAssets).where(eq(marketAssets.symbol, symbol)).limit(1);
    const priceAtAdd = asset.length > 0 ? asset[0].price : "100.00";
    const name = asset.length > 0 ? asset[0].name : symbol;

    const inserted = await db
      .insert(userWatchlist)
      .values({
        symbol: symbol.toUpperCase(),
        name,
        priceAtAdd,
        targetPrice: targetPrice ? String(targetPrice) : null,
        notes: notes || `Monitored via SG16 Institutional Terminal`,
        alertCondition: alertCondition || "above",
      })
      .returning();

    return NextResponse.json({ success: true, item: inserted[0] });
  } catch (error) {
    console.error("Watchlist POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to add to watchlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await db.delete(userWatchlist).where(eq(userWatchlist.id, Number(id)));

    return NextResponse.json({ success: true, message: "Asset removed from watchlist" });
  } catch (error) {
    console.error("Watchlist DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
