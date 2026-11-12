/**
 * sg16finance-cron — MODIFIED VERSION
 * 
 * Instead of doing D1 work directly, this Worker now makes HTTP POST
 * requests to https://sg16finance.com/api/cron, which routes through
 * the Cloudflare edge and shows up in zone HTTP traffic analytics.
 *
 * The actual ingest/cleanup logic moves into the sg16finance Worker
 * as an API route (see sg16finance/app/api/cron/route.ts).
 *
 * REQUIREMENTS:
 *   1. Add a CRON_SECRET secret to BOTH Workers (same value)
 *   2. Move ingest.ts logic into the sg16finance Worker project
 *   3. Add the API route handler in sg16finance (see route.ts file)
 *   4. The cron Worker no longer needs the DB binding or FINNHUB_API_KEY
 *      (the sg16finance Worker already has both)
 */

export default {
  async scheduled(controller, env, ctx) {
    const url = "https://sg16finance.com/api/cron";
    const headers = {
      "Content-Type": "application/json",
      "X-Cron-Secret": env.CRON_SECRET,
    };

    switch (controller.cron) {
      case "* * * * *":
        // Every minute: trigger market data ingest via HTTP
        ctx.waitUntil(
          (async () => {
            try {
              const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({ job: "ingest" }),
              });
              console.log(`[cron] ingest → HTTP ${res.status}`);
            } catch (err) {
              console.error(`[cron] ingest failed: ${err.message}`);
            }
          })()
        );
        break;

      default:
        // 0 3 * * * (daily 3 AM): trigger cleanup + prune via HTTP
        ctx.waitUntil(
          (async () => {
            try {
              const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({ job: "cleanup" }),
              });
              console.log(`[cron] cleanup → HTTP ${res.status}`);
            } catch (err) {
              console.error(`[cron] cleanup failed: ${err.message}`);
            }
          })()
        );
    }
  },
};
