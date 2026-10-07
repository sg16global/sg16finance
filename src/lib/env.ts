/** Read a secret/var from Cloudflare Workers env, falling back to process.env (local dev). */
export async function getEnv(name: string): Promise<string | undefined> {
  try {
    const { env } = await import("cloudflare:workers");
    const value = (env as Record<string, unknown>)[name];
    if (typeof value === "string" && value) return value;
  } catch {
    // Not running on Workers
  }
  return process.env[name];
}
