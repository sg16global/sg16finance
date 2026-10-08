// Minimal typing for the Workers runtime module. We avoid loading all of
// @cloudflare/workers-types globally because it changes Response.json() to `unknown`.
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}
