// Builds the Star-AI web app for a desktop release and copies it into the
// Electron project's `web/` folder (frozen inside that release).
//
//   node scripts/build-desktop-web.mjs <path-to-electron-project> [version]
//
// Uses the exact same static build as GitHub Pages (base /star-ai-pmstudio/,
// API on the Lovable deployment), so behaviour matches the website.
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [, , outArg, version = ""] = process.argv;
if (!outArg) {
  console.error("Usage: node scripts/build-desktop-web.mjs <electron-project-dir> [version]");
  process.exit(1);
}
const electronDir = resolve(outArg);
const webDir = join(electronDir, "web");

execSync("npm run build", {
  stdio: "inherit",
  env: {
    ...process.env,
    STAR_AI_BASE: "/star-ai-pmstudio/",
    VITE_STAR_AI_API_BASE: process.env.VITE_STAR_AI_API_BASE || "https://star-ai-pmstudio.lovable.app",
  },
});

// Verified output of the static (STAR_AI_BASE) build in vite.config.ts.
const src = join(process.cwd(), "dist", "client");
const indexFile = join(src, "index.html");
if (!existsSync(indexFile)) throw new Error("dist/client/index.html missing after build");
const html = readFileSync(indexFile, "utf8");
if (!html.includes('"/star-ai-pmstudio/assets/')) {
  throw new Error("index.html does not reference /star-ai-pmstudio/assets/ — wrong base path");
}

rmSync(webDir, { recursive: true, force: true });
mkdirSync(webDir, { recursive: true });
cpSync(src, webDir, { recursive: true });
// version.json stays live online — never freeze a copy inside the app.
rmSync(join(webDir, "version.json"), { force: true });
writeFileSync(
  join(webDir, "web-build.json"),
  JSON.stringify({ desktopVersion: version, builtAt: new Date().toISOString() }, null, 2),
);
console.log(`[desktop] web build copied to ${webDir}`);
