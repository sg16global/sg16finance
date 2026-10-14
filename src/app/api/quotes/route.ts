import { NextResponse } from "next/server";
import { ensureDataSeeded } from "@/db/ensure-data";
import { hasLiveAccess, loadMarketAssets } from "@/lib/market";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Pass holders get the latest stored prices; everyone else gets the same data 15 minutes behind.
    const live = await hasLiveAccess(request);
    await ensureDataSeeded();
    const assets = await loadMarketAssets(live);

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        streaming: live,
        delayMinutes: live ? 0 : 15,
        quotes: assets.map((a) => ({
          symbol: a.symbol,
          name: a.name,
          category: a.category,
          price: a.price,
          basePrice: a.price,
          change: a.change,
          changePercent: a.changePercent,
          volume: a.volume,
          aiSentiment: a.aiSentiment,
          lastTick: a.asOf ?? a.updatedAt.toISOString(),
          source: a.source,
          delayed: a.delayed,
          live,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Quotes API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch quotes" }, { status: 500 });
  }
}
