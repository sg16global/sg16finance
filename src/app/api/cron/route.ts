/**
 * sg16finance Worker — NEW API ROUTE
 * 
 * Add this file to your Next.js project at:
 *   app/api/cron/route.ts   (App Router)
 *   or pages/api/cron.ts     (Pages Router)
 *
 * This endpoint receives the HTTP request from sg16finance-cron
 * and performs the same D1 operations the cron Worker used to do.
 *
 * The ingest.ts logic (fetchFinnhub, fetchCrypto, fetchFx, fetchYields,
 * applyQuotes, ingestMinute, cleanup, pruneHistory) should be copied
 * from the cron Worker into this project (e.g., as lib/ingest.ts).
 *
 * IMPORTANT: Exclude this route from rate limiting (RL_ACCESS, RL_AUTH)
 * so the every-minute cron calls are not throttled.
 */

import { ingestMinute, cleanup, pruneHistory } from "@/lib/ingest";

export const runtime = "edge"; // or "nodejs" depending on your setup

export async function POST(request: Request, env: Env): Promise<Response> {
  // 1. Authenticate — only the cron Worker knows this secret
  const secret = request.headers.get("X-Cron-Secret");
  if (!secret || secret !== env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Parse the job type
  let body: { job: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Execute the requested job
  try {
    switch (body.job) {
      case "ingest":
        await ingestMinute(env);
        return new Response(
          JSON.stringify({ ok: true, job: "ingest" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );

      case "cleanup":
        await cleanup(env);
        await pruneHistory(env);
        return new Response(
          JSON.stringify({ ok: true, job: "cleanup" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );

      default:
        return new Response(
          JSON.stringify({ error: `Unknown job: ${body.job}` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
  } catch (err) {
    console.error(`[api/cron] ${body.job} failed:`, err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
