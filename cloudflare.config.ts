import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "sg16finance",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-02",
    compatibilityFlags: ["nodejs_compat"],
    workersDev: true,
    previewUrls: true,
    domains: ["sg16finance.com", "www.sg16finance.com"],
    assets: { notFoundHandling: "none" },
    env: {
      ASSETS: bindings.assets(),
      // Local-dev secret declarations (values come from .dev.vars; production uses `wrangler secret put`)
      SESSION_SECRET: bindings.secret(),
      TURNSTILE_SITE_KEY: bindings.secret(),
      TURNSTILE_SECRET: bindings.secret(),
      AUTH_DEV_LOG_CODE: bindings.secret(),
      ANTHROPIC_API_KEY: bindings.secret(),
      ANTHROPIC_BASE_URL: bindings.secret(),
      // Abuse shield: per-IP limits (see src/lib/security.ts)
      RL_ACCESS: bindings.rateLimit({ namespace: "1001", simple: { limit: 60, period: 60 } }),
      RL_CHECKOUT: bindings.rateLimit({ namespace: "1002", simple: { limit: 5, period: 60 } }),
      RL_AUTH: bindings.rateLimit({ namespace: "1003", simple: { limit: 8, period: 60 } }),
      // Workers AI (copilot fallback engine, support first replies)
      AI: bindings.ai(),
      DB: bindings.d1({ id: "8671a510-3431-41ad-be92-cdcb3faa3f72", name: "sg16finance-db" }),
    },
  }),
});
