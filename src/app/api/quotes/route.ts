import { NextResponse } from "next/server";
import { db } from "@/db";
import { marketAssets } from "@/db/schema";
import { ensureDataSeeded } from "@/db/ensure-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDataSeeded();
    const assets = await db.select().from(marketAssets);

    // Provide quotes with micro-tick variance for realistic 24/7 institutional live feed simulation
    const liveQuotes = assets.map((asset) => {
      const basePrice = Number(asset.price);
      // Small simulated jitter between -0.05% and +0.05%
      const jitterFactor = 1 + (Math.random() * 0.001 - 0.0005);
      const simulatedPrice = (basePrice * jitterFactor).toFixed(basePrice < 10 ? 4 : 2);

      return {
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        price: simulatedPrice,
        basePrice: asset.price,
        change: asset.change,
        changePercent: asset.changePercent,
        volume: asset.volume,
        aiSentiment: asset.aiSentiment,
        lastTick: new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      feedLatencyMs: (1.2 + Math.random() * 0.8).toFixed(2),
      quotes: liveQuotes,
    });
  } catch (error) {
    console.error("Quotes API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch quotes" }, { status: 500 });
  }
}
