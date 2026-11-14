import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deployment identity. `__SG16_COMMIT__` is replaced at build time by vite.config.ts
 * (Workers/vinext build). Comparing this value with `git rev-parse --short HEAD` is how
 * we detect that Cloudflare is serving a build that no longer matches the git branch —
 * the exact failure that caused the November 2026 incident.
 */
export async function GET() {
  const commit =
    typeof __SG16_COMMIT__ === "string" && __SG16_COMMIT__ ? __SG16_COMMIT__ : "dev";
  return NextResponse.json(
    { commit, app: "sg16finance" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
