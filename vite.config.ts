import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

/** Stamp every Workers build with the git commit it came from (see /api/version). */
function commitSha(): string {
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

export default defineConfig({
  define: { __SG16_COMMIT__: JSON.stringify(commitSha()) },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
