import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userWatchlist, marketAssets } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ensureDataSeeded } from "@/db/ensure-data";
import { getSessionEmail, jsonError } from "@/lib/security";

export const dynamic = "force-dynamic";

/** Verified session email, or a 401 response. */
async function requireSession(
  request: Request,
): Promise<{ email: string } | { response: Response }> {
  const email = await getSessionEmail(request);
  if (!email) return { response: jsonError("Sign in required", 401) };
  return { email };
}

export async function GET(request: Request) {
  const session = await requireSession(request);
  if ("response" in session) return session.response;

  try {
    await ensureDataSeeded();
    const db = await getDb();
    const watchlist = await db
      .select()
      .from(userWatchlist)
      .where(eq(userWatchlist.userId, session.email))
      .orderBy(userWatchlist.createdAt);
    const assets = await db.select().from(marketAssets);
    const assetMap = new Map(assets.map((a) => [a.symbol, a]));

    const enriched = watchlist.map((item) => {
      const currentAsset = assetMap.get(item.symbol);
      const currentPrice = currentAsset ? Number(currentAsset.price) : Number(item.priceAtAdd);
      const priceAtAdd = Number(item.priceAtAdd);
      const gainSinceAdd =
        priceAtAdd > 0 ? (((currentPrice - priceAtAdd) / priceAtAdd) * 100).toFixed(2) : "0.00";

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
  const session = await requireSession(request);
  if ("response" in session) return session.response;

  try {
    await ensureDataSeeded();
    const db = await getDb();
    const body = (await request.json()) as {
      symbol?: unknown;
      targetPrice?: unknown;
      notes?: unknown;
      alertCondition?: unknown;
    };

    const symbol = typeof body.symbol === "string" ? body.symbol.trim().toUpperCase() : "";
    if (!symbol) {
      return NextResponse.json({ success: false, error: "Symbol is required" }, { status: 400 });
    }
    if (!/^[A-Z0-9.\-^]{1,12}$/.test(symbol)) {
      return NextResponse.json({ success: false, error: "Invalid symbol" }, { status: 400 });
    }

    const targetPrice =
      body.targetPrice === null || body.targetPrice === undefined || body.targetPrice === ""
        ? null
        : Number.isFinite(Number(body.targetPrice)) && Number(body.targetPrice) >= 0
          ? String(body.targetPrice)
          : null;
    const notes = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim().slice(0, 500) : null;
    const alertCondition = body.alertCondition === "below" ? "below" : "above";

    // Only assets with a real stored price can be tracked; never invent a price.
    const asset = await db.select().from(marketAssets).where(eq(marketAssets.symbol, symbol)).limit(1);
    if (asset.length === 0) {
      return NextResponse.json(
        { success: false, error: `Symbol ${symbol} is not available on SG16 Finance` },
        { status: 404 },
      );
    }

    const inserted = await db
      .insert(userWatchlist)
      .values({
        userId: session.email,
        symbol,
        name: asset[0].name,
        priceAtAdd: asset[0].price,
        targetPrice,
        notes: notes ?? "Monitored via SG16 Institutional Terminal",
        alertCondition,
      })
      .returning();

    return NextResponse.json({ success: true, item: inserted[0] });
  } catch (error) {
    console.error("Watchlist POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to add to watchlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireSession(request);
  if ("response" in session) return session.response;

  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ success: false, error: "A valid id is required" }, { status: 400 });
    }

    // Ownership check: a user can only remove their own rows.
    const deleted = await db
      .delete(userWatchlist)
      .where(and(eq(userWatchlist.id, id), eq(userWatchlist.userId, session.email)))
      .returning({ id: userWatchlist.id });

    if (deleted.length === 0) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Asset removed from watchlist" });
  } catch (error) {
    console.error("Watchlist DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
