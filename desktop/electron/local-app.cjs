/**
 * Star-AI frozen web build — serves the web app bundled INSIDE this Electron
 * release instead of the live GitHub Pages site.
 *
 * How: the window still opens https://star-ai-2026.github.io/star-ai-pmstudio/,
 * but every request under that path is answered from the local `web/` folder
 * shipped with the app. The address stays identical, so Google sign-in,
 * email/password sign-in, reCAPTCHA (domain-bound) and saved sessions keep
 * working unchanged. Only `version.json` (the update policy) is fetched live.
 * Everything else (Lovable Cloud, AI API, Google) goes to the network normally.
 *
 *   const { registerLocalApp, APP_URL } = require("./local-app.cjs");
 *   app.whenReady().then(() => { registerLocalApp(); ...; win.loadURL(APP_URL); });
 *
 * Requires Electron 25+ (protocol.handle / net.fetch).
 */
const { app, net, protocol } = require("electron");
const fs = require("fs");
const path = require("path");

const HOST = "star-ai-2026.github.io";
const PREFIX = "/star-ai-pmstudio/";
const APP_URL = `https://${HOST}${PREFIX}`;
// Always live — this is the update policy, never frozen.
const LIVE_PATHS = new Set([`${PREFIX}version.json`]);

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
  ".txt": "text/plain", ".map": "application/json", ".wasm": "application/wasm",
};

function webRoot() {
  // Packaged: resources/web (extraResource). Dev: <project>/web.
  const packaged = path.join(process.resourcesPath || "", "web");
  if (app.isPackaged && fs.existsSync(packaged)) return packaged;
  return path.join(app.getAppPath(), "web");
}

function fileResponse(file) {
  const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
  return new Response(fs.readFileSync(file), {
    status: 200,
    headers: { "content-type": type, "cache-control": "no-store" },
  });
}

function registerLocalApp(ses) {
  const root = webRoot();
  const index = path.join(root, "index.html");
  if (!fs.existsSync(index)) {
    throw new Error(`Bundled Star-AI web build missing: ${index}. Run the release build.`);
  }
  const target = ses ? ses.protocol : protocol;

  target.handle("https", async (request) => {
    const url = new URL(request.url);
    const local = url.hostname === HOST && url.pathname.startsWith(PREFIX) && !LIVE_PATHS.has(url.pathname);
    if (!local || request.method !== "GET") {
      return net.fetch(request, { bypassCustomProtocolHandlers: true });
    }
    const rel = decodeURIComponent(url.pathname.slice(PREFIX.length));
    const file = path.normalize(path.join(root, rel));
    // Block path traversal outside the bundled folder.
    if (!file.startsWith(root)) return new Response("Forbidden", { status: 403 });
    if (rel && fs.existsSync(file) && fs.statSync(file).isFile()) return fileResponse(file);
    // Missing file with an extension = real 404; otherwise a client route → app shell.
    if (path.extname(rel)) return new Response("Not found", { status: 404 });
    return fileResponse(index);
  });
}

module.exports = { registerLocalApp, APP_URL };
