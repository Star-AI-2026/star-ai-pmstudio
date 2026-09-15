// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

// GitHub Project Pages serve the app from /star-ai-pmstudio/. Set
// STAR_AI_BASE (or pass --base=) to change it; Lovable hosting uses "/".
const base = process.env["STAR_AI_BASE"] ?? "/";

/**
 * GitHub Pages has no SPA rewrite rule and runs Jekyll by default.
 * Copy the static entry page to 404.html so client-side routing works on
 * deep links, and drop a .nojekyll file so /_ prefixed assets are served.
 */
function githubPagesStaticPlugin(): Plugin {
  return {
    name: "star-ai-github-pages",
    apply: "build",
    closeBundle() {
      for (const dir of ["dist/client", ".output/public"]) {
        const index = join(process.cwd(), dir, "index.html");
        if (!existsSync(index)) continue;
        copyFileSync(index, join(process.cwd(), dir, "404.html"));
        writeFileSync(join(process.cwd(), dir, ".nojekyll"), "");
      }
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Static/SPA output: every route is served from one prerendered index.html
    // shell and rendered on the client.
    spa: { enabled: true },
    prerender: { enabled: true, outputPath: "/index.html" },
    pages: [{ path: "/", prerender: { enabled: true, outputPath: "/index.html" } }],
  },
  vite: {
    base,
    plugins: [githubPagesStaticPlugin()],
  },
});
