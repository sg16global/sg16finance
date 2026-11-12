/**
 * sg16finance-cron: scheduled housekeeping for the shared D1 database.
 * Runs daily (see wrangler.jsonc). It has no public routes.
 */

import { ingestMinute, pruneHistory, type Env } from "./ingest";

const DAY_MS = 86_400_000;

// Keep expired passes for a short grace period (support / refund questions), then delete.
const EXPIRED_PASS_GRACE_DAYS = 7;
const USAGE_RETENTION_DAYS = 60;
const WEBHOOK_LOG_RETENTION_DAYS = 90;

async function cleanup(env: Env, now = Date.now()) {
  const cutoff = (days: number) => now - days * DAY_MS;
  const usageCutoffDay = new Date(cutoff(USAGE_RETENTION_DAYS)).toISOString().slice(0, 10);

  const jobs: Array<[string, D1PreparedStatement]> = [
    ["access_passes", env.DB.prepare("DELETE FROM access_passes WHERE expires_at < ?").bind(cutoff(EXPIRED_PASS_GRACE_DAYS))],
    ["login_codes", env.DB.prepare("DELETE FROM login_codes WHERE expires_at < ?").bind(now)],
    ["pass_usage", env.DB.prepare("DELETE FROM pass_usage WHERE day < ?").bind(usageCutoffDay)],
    ["dodo_events", env.DB.prepare("DELETE FROM dodo_events WHERE created_at < ?").bind(cutoff(WEBHOOK_LOG_RETENTION_DAYS))],
  ];

  // Run independently: a table that has not been created yet (they are created lazily) must not block the rest.
  for (const [table, stmt] of jobs) {
    try {
      const res = await stmt.run();
      console.log(`[cron] ${table}: removed ${res.meta.changes ?? 0} row(s)`);
    } catch (error) {
      console.warn(`[cron] ${table}: skipped (${error instanceof Error ? error.message : String(error)})`);
    }
  }
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    switch (controller.cron) {
      case "* * * * *": // real market data, every minute
        ctx.waitUntil(ingestMinute(env));
        break;
      default: // "0 3 * * *": daily cleanup
        ctx.waitUntil(Promise.all([cleanup(env), pruneHistory(env)]));
    }
  },
} satisfies ExportedHandler<Env>;
