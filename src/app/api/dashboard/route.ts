import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { sectors, earningsReports, marketAlerts } from "@/db/schema";
import { hasLiveAccess, loadMarketAssets } from "@/lib/market";
import { ensureDataSeeded } from "@/db/ensure-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await ensureDataSeeded();
    const db = await getDb();
    const live = await hasLiveAccess(request);

    const [assetsList, sectorsList, earningsList, alertsList] = await Promise.all([
      loadMarketAssets(live),
      db.select().from(sectors),
      db.select().from(earningsReports),
      db.select().from(marketAlerts),
    ]);

    const gainers = [...assetsList].sort((a, b) => Number(b.changePercent) - Number(a.changePercent)).slice(0, 5);
    const losers = [...assetsList].sort((a, b) => Number(a.changePercent) - Number(b.changePercent)).slice(0, 5);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      streaming: live,
      delayMinutes: live ? 0 : 15,
      assets: assetsList,
      sectors: sectorsList,
      earnings: earningsList,
      alerts: alertsList,
      gainers,
      losers,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch institutional dashboard data" },
      { status: 500 }
    );
  }
}
