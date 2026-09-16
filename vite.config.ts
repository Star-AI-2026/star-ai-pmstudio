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

// Static hosting (GitHub Project Pages) build:
//   STAR_AI_BASE=/star-ai-pmstudio/ npm run build
// Without STAR_AI_BASE the build is the normal Lovable server build.
const staticBase = process.env["STAR_AI_BASE"];
const isStaticBuild = Boolean(staticBase);

/**
 * GitHub Pages has no SPA rewrite rule and runs Jekyll by default.
 * Copy the static entry page to 404.html so deep links keep working with
 * client-side routing, and add .nojekyll so `_`-prefixed assets are served.
 */
function githubPagesStaticPlugin(): Plugin {
  return {
    name: "star-ai-github-pages",
    apply: "build",
    closeBundle() {
      if (!isStaticBuild) return;
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
  // No server runtime on a static host, so skip the nitro/worker bundle there.
  ...(isStaticBuild ? { nitro: false as const } : {}),
  tanstackStart: isStaticBuild
    ? // Static/SPA output: one prerendered index.html shell, routing on the client.
      { spa: { enabled: true, prerender: { outputPath: "/index.html" } } }
    : {
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        // nitro/vite builds from this
        server: { entry: "server" },
      },
  vite: {
    ...(staticBase ? { base: staticBase } : {}),
    define: {
      // Origin of the Star-AI API for statically hosted builds ("" = same origin).
      __STAR_AI_API_BASE__: JSON.stringify(process.env["VITE_STAR_AI_API_BASE"] ?? ""),
    },
    plugins: [githubPagesStaticPlugin()],
  },
});
