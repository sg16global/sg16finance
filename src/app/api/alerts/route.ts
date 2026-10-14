import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { marketAlerts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureDataSeeded } from "@/db/ensure-data";
import { getSessionEmail, jsonError } from "@/lib/security";

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
  const email = await getSessionEmail(request);
  if (!email) return jsonError("Sign in required", 401);

  try {
    const db = await getDb();
    const body = (await request.json()) as { id?: unknown };
    const id = Number(body.id);
    if (Number.isInteger(id) && id > 0) {
      await db.update(marketAlerts).set({ read: true }).where(eq(marketAlerts.id, id));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Alerts POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to update alert" }, { status: 500 });
  }
}
