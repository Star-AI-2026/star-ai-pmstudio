/**
 * Star-AI desktop updater — drop into your existing Electron main process.
 *
 *   const { registerUpdater } = require("./updater.cjs");
 *   registerUpdater();               // after app.whenReady()
 *
 * And in preload.js:  require("./updater-preload.cjs");
 *
 * Security: only https URLs on github.com / objects.githubusercontent.com that
 * match the URL in the live version.json, ending in the configured .exe name,
 * are downloaded; the file only runs after a complete, size-verified download.
 */
const { app, ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawn } = require("child_process");

const POLICY_URL = "https://star-ai-2026.github.io/star-ai-pmstudio/version.json";
const ALLOWED_HOSTS = new Set(["github.com", "objects.githubusercontent.com", "release-assets.githubusercontent.com"]);

function get(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    if (u.protocol !== "https:" || !(ALLOWED_HOSTS.has(u.hostname) || u.hostname.endsWith(".githubusercontent.com"))) {
      return reject(new Error("Blocked host " + u.hostname));
    }
    https.get(u, { headers: { "User-Agent": "Star-AI-Updater" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 5) {
        res.resume();
        return resolve(get(new URL(res.headers.location, u).toString(), redirects + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error("HTTP " + res.statusCode)); }
      resolve(res);
    }).on("error", reject);
  });
}

async function fetchPolicy() {
  const res = await fetch(`${POLICY_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("policy HTTP " + res.status);
  return res.json();
}

function registerUpdater() {
  ipcMain.handle("star:get-version", () => app.getVersion());
  ipcMain.handle("star:open-external", (_e, url) => {
    if (typeof url === "string" && url.startsWith("https://github.com/Star-AI-2026/")) return shell.openExternal(url);
  });

  ipcMain.handle("star:download-and-install", async (event, req) => {
    try {
      const policy = await fetchPolicy();
      const { url, fileName } = req || {};
      // Only the exact URL/file currently published in version.json is accepted.
      if (!url || url !== policy.setupDownloadUrl) throw new Error("URL not in version.json");
      if (!fileName || fileName !== policy.setupFileName || !/^[\w.\- ]+\.exe$/i.test(fileName)) throw new Error("Bad file name");
      const u = new URL(url);
      if (u.protocol !== "https:" || !ALLOWED_HOSTS.has(u.hostname)) throw new Error("Host not allowed");

      const dir = path.join(app.getPath("temp"), "star-ai-update");
      fs.mkdirSync(dir, { recursive: true });
      const target = path.join(dir, fileName);
      const partial = target + ".part";

      const res = await get(url);
      const total = Number(res.headers["content-length"] || 0);
      let received = 0;
      await new Promise((resolve, reject) => {
        const out = fs.createWriteStream(partial);
        res.on("data", (chunk) => {
          received += chunk.length;
          event.sender.send("star:download-progress", {
            received, total, percent: total ? Math.round((received / total) * 100) : 0,
          });
        });
        res.on("error", reject);
        out.on("error", reject);
        out.on("finish", resolve);
        res.pipe(out);
      });
      if (received === 0 || (total && received !== total)) throw new Error("Incomplete download");
      fs.renameSync(partial, target);

      // Open the normal Setup UI (not silent). Inno Setup relaunches Star-AI
      // through its [Run] postinstall entry — see desktop/electron/README.md.
      spawn(target, [], { detached: true, stdio: "ignore" }).unref();
      setTimeout(() => app.quit(), 300);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err && err.message || err) };
    }
  });
}

module.exports = { registerUpdater };
