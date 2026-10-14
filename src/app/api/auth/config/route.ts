import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Public Turnstile site key (safe to expose; the secret never leaves the Worker). */
export async function GET() {
  return Response.json(
    { turnstileSiteKey: (await getEnv("TURNSTILE_SITE_KEY")) ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
