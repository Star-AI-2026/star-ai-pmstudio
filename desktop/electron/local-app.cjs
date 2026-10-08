/**
 * Star-AI frozen web build — serves the web app bundled INSIDE this Electron
 * release instead of the live GitHub Pages site.
 *
 * The window opens https://star-ai-2026.github.io/star-ai-pmstudio/ and every
 * GET/HEAD under that path is answered from the local `web/` folder. Every
 * other request (Lovable Cloud, AI API, Google, reCAPTCHA, version.json) is
 * passed to the network unchanged via net.fetch(..., bypassCustomProtocolHandlers).
 *
 *   const { registerLocalApp, APP_URL } = require("./local-app.cjs");
 *   app.whenReady().then(() => { registerLocalApp(); ...; win.loadURL(APP_URL); });
 *
 * Requires Electron >= 25 (protocol.handle, net.fetch with
 * bypassCustomProtocolHandlers). Intercepting the built-in "https" scheme with
 * protocol.handle is documented by Electron; it applies to ONE session — pass
 * the session you load the window in if it isn't session.defaultSession.
 */
const fs = require("fs");
const path = require("path");

const HOST = "star-ai-2026.github.io";
const PREFIX = "/star-ai-pmstudio/";
const APP_URL = `https://${HOST}${PREFIX}`;
// Always live from GitHub Pages — the update policy is never frozen.
const LIVE_PATHS = new Set([`${PREFIX}version.json`]);

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
  ".txt": "text/plain", ".map": "application/json", ".wasm": "application/wasm",
};

/**
 * Pure routing decision (no Electron) — unit-tested.
 * Returns {action:"network"} | {action:"redirect", location} |
 *         {action:"file", file} | {action:"status", status}
 */
function resolveRequest(rawUrl, method, root) {
  let url;
  try { url = new URL(rawUrl); } catch { return { action: "network" }; }
  if (url.protocol !== "https:" || url.hostname !== HOST) return { action: "network" };
  if (url.pathname === PREFIX.slice(0, -1)) {
    return { action: "redirect", location: APP_URL + url.search + url.hash };
  }
  if (!url.pathname.startsWith(PREFIX) || LIVE_PATHS.has(url.pathname)) return { action: "network" };
  if (method !== "GET" && method !== "HEAD") return { action: "status", status: 405 };

  // url.pathname never contains ?query or #hash.
  let rel;
  try { rel = decodeURIComponent(url.pathname.slice(PREFIX.length)); } catch { return { action: "status", status: 400 }; }
  if (rel.includes("\0")) return { action: "status", status: 400 };
  // Decoded version.json (e.g. version%2Ejson) must also stay live.
  if (LIVE_PATHS.has(PREFIX + rel)) return { action: "network" };

  const base = path.resolve(root);
  const file = path.resolve(base, rel);
  const relToRoot = path.relative(base, file);
  if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) return { action: "status", status: 403 };

  const index = path.join(base, "index.html");
  if (relToRoot === "") return { action: "file", file: index };
  let stat = null;
  try { stat = fs.statSync(file); } catch { /* missing */ }
  if (stat && stat.isFile()) return { action: "file", file };
  // Missing asset (has an extension) → real 404; otherwise SPA route → shell.
  if (path.extname(rel)) return { action: "status", status: 404 };
  return { action: "file", file: index };
}

function webRoot(app) {
  // Packaged: <resources>/web (extraResource). Dev: <project>/web.
  const packaged = path.join(process.resourcesPath || "", "web");
  if (app.isPackaged && fs.existsSync(packaged)) return packaged;
  return path.join(app.getAppPath(), "web");
}

function registerLocalApp(ses) {
  const { app, net, protocol } = require("electron");
  const root = webRoot(app);
  const index = path.join(root, "index.html");
  if (!fs.existsSync(index)) {
    throw new Error(`Bundled Star-AI web build missing: ${index}. Run "node release.cjs".`);
  }
  const target = ses ? ses.protocol : protocol;

  target.handle("https", async (request) => {
    const r = resolveRequest(request.url, request.method, root);
    if (r.action === "network") return net.fetch(request, { bypassCustomProtocolHandlers: true });
    if (r.action === "redirect") return new Response(null, { status: 301, headers: { location: r.location } });
    if (r.action === "status") return new Response(String(r.status), { status: r.status });
    const type = TYPES[path.extname(r.file).toLowerCase()] || "application/octet-stream";
    const body = request.method === "HEAD" ? null : fs.readFileSync(r.file);
    return new Response(body, { status: 200, headers: { "content-type": type, "cache-control": "no-store" } });
  });
}

module.exports = { registerLocalApp, resolveRequest, APP_URL, HOST, PREFIX };
