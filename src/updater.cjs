/**
 * Star-AI desktop updater (main process).
 * Reads https://star-ai-2026.github.io/star-ai-pmstudio/version.json,
 * downloads setupDownloadUrl, verifies it, opens the normal Setup and quits.
 */
const { app, ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawn } = require("child_process");

const POLICY_URL = "https://star-ai-2026.github.io/star-ai-pmstudio/version.json";
const ALLOWED_START_HOSTS = new Set(["github.com"]);
const isAllowedHost = (h) =>
  h === "github.com" || h === "objects.githubusercontent.com" || h.endsWith(".githubusercontent.com");

function httpsGet(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    if (u.protocol !== "https:" || !isAllowedHost(u.hostname)) {
      return reject(new Error("Blocked host: " + u.hostname));
    }
    https
      .get(u, { headers: { "User-Agent": "Star-AI-Updater" } }, (res) => {
        const code = res.statusCode || 0;
        if (code >= 300 && code < 400 && res.headers.location) {
          res.resume();
          if (redirects >= 5) return reject(new Error("Too many redirects"));
          return resolve(httpsGet(new URL(res.headers.location, u).toString(), redirects + 1));
        }
        if (code !== 200) {
          res.resume();
          return reject(new Error("HTTP " + code));
        }
        resolve(res);
      })
      .on("error", reject);
  });
}

async function fetchPolicy() {
  const res = await fetch(`${POLICY_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("version.json HTTP " + res.status);
  return res.json();
}

function registerUpdater() {
  // Real app version from package.json "version" — never user input.
  ipcMain.handle("star:get-version", () => app.getVersion());

  ipcMain.handle("star:open-external", (_e, url) => {
    if (typeof url === "string" && url.startsWith("https://github.com/Star-AI-2026/")) {
      return shell.openExternal(url);
    }
  });

  ipcMain.handle("star:download-and-install", async (event, req) => {
    let partial = null;
    try {
      const policy = await fetchPolicy();
      const url = req && req.url;
      const fileName = req && req.fileName;

      // Accept only the exact URL / file name currently published in version.json.
      if (!url || url !== policy.setupDownloadUrl) throw new Error("URL does not match version.json");
      if (!fileName || fileName !== policy.setupFileName) throw new Error("File name does not match version.json");
      if (!/^[\w.\- ]+\.exe$/i.test(fileName)) throw new Error("Not an .exe file");
      const u = new URL(url);
      if (u.protocol !== "https:" || !ALLOWED_START_HOSTS.has(u.hostname)) throw new Error("Host not allowed");

      const dir = path.join(app.getPath("temp"), "star-ai-update");
      fs.mkdirSync(dir, { recursive: true });
      const target = path.join(dir, fileName);
      partial = target + ".part";

      const res = await httpsGet(url);
      const total = Number(res.headers["content-length"] || 0);
      let received = 0;

      await new Promise((resolve, reject) => {
        const out = fs.createWriteStream(partial);
        res.on("data", (chunk) => {
          received += chunk.length;
          if (!event.sender.isDestroyed()) {
            event.sender.send("star:download-progress", {
              received,
              total,
              percent: total ? Math.round((received / total) * 100) : 0,
            });
          }
        });
        res.on("error", reject);
        out.on("error", reject);
        out.on("finish", resolve);
        res.pipe(out);
      });

      if (received === 0 || (total && received !== total)) throw new Error("Incomplete download");
      if (fs.existsSync(target)) fs.unlinkSync(target);
      fs.renameSync(partial, target);
      partial = null;

      // Open the normal Setup window (not silent), then close the old app.
      spawn(target, [], { detached: true, stdio: "ignore" }).unref();
      setTimeout(() => app.quit(), 500);
      return { ok: true };
    } catch (err) {
      if (partial && fs.existsSync(partial)) {
        try { fs.unlinkSync(partial); } catch {}
      }
      return { ok: false, error: String((err && err.message) || err) };
    }
  });
}

module.exports = { registerUpdater };
