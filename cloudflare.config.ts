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
      // Required production secrets (set on the Worker with `wrangler secret put`).
      // Optional AI keys (MISTRAL_API_KEY, SG16_BRAIN_*) must NOT be declared here:
      // declared secrets are required at deploy time and the copilot falls back to Workers AI.
      // AUTH_DEV_LOG_CODE is local-dev only (.dev.vars) and must never exist in production.
      SESSION_SECRET: bindings.secret(),
      TURNSTILE_SITE_KEY: bindings.secret(),
      TURNSTILE_SECRET: bindings.secret(),
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
