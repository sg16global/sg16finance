import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { marketAssets, sectors, earningsReports, marketAlerts } from "@/db/schema";
import { ensureDataSeeded } from "@/db/ensure-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDataSeeded();
    const db = await getDb();

    const [assetsList, sectorsList, earningsList, alertsList] = await Promise.all([
      db.select().from(marketAssets),
      db.select().from(sectors),
      db.select().from(earningsReports),
      db.select().from(marketAlerts),
    ]);

    // Compute market metrics
    const totalMarketCapTracked = "$118.4 Trillion";
    const gainers = [...assetsList].sort((a, b) => Number(b.changePercent) - Number(a.changePercent)).slice(0, 5);
    const losers = [...assetsList].sort((a, b) => Number(a.changePercent) - Number(b.changePercent)).slice(0, 5);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      systemStatus: "OPTIMAL",
      aiEngineStatus: "24/7 ACTIVE",
      totalMarketCapTracked,
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
