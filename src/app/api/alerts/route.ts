import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { marketAlerts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureDataSeeded } from "@/db/ensure-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDataSeeded();
    const db = await getDb();
    const alerts = await db.select().from(marketAlerts).orderBy(desc(marketAlerts.createdAt)).limit(15);
    return NextResponse.json({ success: true, alerts });
  } catch (error) {
    console.error("Alerts GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { id } = body;
    if (id) {
      await db.update(marketAlerts).set({ read: true }).where(eq(marketAlerts.id, Number(id)));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Alerts POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to update alert" }, { status: 500 });
  }
}
