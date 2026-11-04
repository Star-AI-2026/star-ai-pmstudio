/**
 * Star-AI desktop updater.
 * Downloads only the exact assets advertised by the live version.json policy.
 * The universal Update installer contains both architecture patches and
 * automatically falls back to the full Setup if applying a patch fails.
 */
const { app, ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawn } = require("child_process");
const crypto = require("crypto");

const POLICY_URL = "https://star-ai-2026.github.io/star-ai-pmstudio/version.json";
const ALLOWED_START_HOSTS = new Set(["github.com"]);
const isAllowedHost = (h) =>
  h === "github.com" ||
  h === "objects.githubusercontent.com" ||
  h.endsWith(".githubusercontent.com");

function httpsGet(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    if (u.protocol !== "https:" || !isAllowedHost(u.hostname)) {
      return reject(new Error("Blocked download host: " + u.hostname));
    }
    https.get(u, { headers: { "User-Agent": "Star-AI-Updater" } }, (res) => {
      const code = res.statusCode || 0;
      if (code >= 300 && code < 400 && res.headers.location) {
        res.resume();
        if (redirects >= 6) return reject(new Error("Too many redirects"));
        return resolve(httpsGet(new URL(res.headers.location, u).toString(), redirects + 1));
      }
      if (code !== 200) {
        res.resume();
        return reject(new Error("Download HTTP " + code));
      }
      resolve(res);
    }).on("error", reject);
  });
}

async function fetchPolicy() {
  const res = await fetch(`${POLICY_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("version.json HTTP " + res.status);
  return res.json();
}

function sha256File(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(file);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function validAsset(fileName, url, expectedUrl, expectedName) {
  if (!fileName || fileName !== expectedName || url !== expectedUrl) return false;
  if (!/^[A-Za-z0-9._ -]+\.exe$/i.test(fileName)) return false;
  const u = new URL(url);
  return u.protocol === "https:" && ALLOWED_START_HOSTS.has(u.hostname) &&
    u.pathname.startsWith("/Star-AI-2026/star-ai-pmstudio/releases/download/");
}

async function downloadAsset(event, url, fileName, expectedHash) {
  if (!/^[a-f0-9]{64}$/i.test(String(expectedHash || ""))) {
    throw new Error("A valid SHA-256 value is missing from version.json");
  }

  const dir = path.join(app.getPath("temp"), "star-ai-update");
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, fileName);
  const partial = target + ".part";
  try { if (fs.existsSync(partial)) fs.unlinkSync(partial); } catch {}

  const res = await httpsGet(url);
  const total = Number(res.headers["content-length"] || 0);
  let received = 0;

  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(partial);
    res.on("data", (chunk) => {
      received += chunk.length;
      if (!event.sender.isDestroyed()) {
        event.sender.send("star:download-progress", {
          received, total,
          percent: total ? Math.min(100, Math.round((received / total) * 100)) : 0,
        });
      }
    });
    res.on("error", reject);
    out.on("error", reject);
    out.on("finish", resolve);
    res.pipe(out);
  });

  if (!received || (total && received !== total)) throw new Error("Incomplete download");
  const actualHash = await sha256File(partial);
  if (actualHash.toLowerCase() !== expectedHash.toLowerCase()) {
    throw new Error("Downloaded file failed SHA-256 verification");
  }
  try { if (fs.existsSync(target)) fs.unlinkSync(target); } catch {}
  fs.renameSync(partial, target);
  return target;
}

function registerUpdater() {
  ipcMain.handle("star:get-version", () => app.getVersion());

  ipcMain.handle("star:open-external", (_e, url) => {
    if (typeof url === "string" && url.startsWith("https://github.com/Star-AI-2026/")) {
      return shell.openExternal(url);
    }
  });

  ipcMain.handle("star:download-and-install", async (event, req) => {
    try {
      const policy = await fetchPolicy();
      const url = req && req.url;
      const fileName = req && req.fileName;
      const version = req && req.version;
      const sha256 = req && req.sha256;

      if (typeof version !== "string" || !/^\d+\.\d+\.\d+/.test(version)) {
        throw new Error("Invalid target version");
      }

      const approvedAssets = [
        [policy.updateDownloadUrl, policy.updateFileName, policy.updateSha256],
        [policy.setupDownloadUrl, policy.setupFileName, policy.setupSha256],
        [policy.betaUpdateDownloadUrl, policy.betaUpdateFileName, policy.betaUpdateSha256],
        [policy.betaSetupDownloadUrl, policy.betaSetupFileName, policy.betaSetupSha256],
      ];
      const match = approvedAssets.find(([approvedUrl, approvedName]) =>
        approvedUrl && approvedName && url === approvedUrl && fileName === approvedName
      );
      if (!match || !validAsset(fileName, url, match[0], match[1])) {
        throw new Error("Asset is not an approved Star-AI release asset");
      }
      if (!sha256 || sha256 !== match[2]) {
        throw new Error("Asset SHA-256 does not match version.json");
      }

      const target = await downloadAsset(event, url, fileName, sha256);
      spawn(target, [], { detached: true, stdio: "ignore" }).unref();
      setTimeout(() => app.quit(), 500);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });
}

module.exports = { registerUpdater };
