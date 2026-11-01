const { app, BrowserWindow, session } = require("electron");
const path = require("path");
const { registerUpdater } = require("./updater.cjs");
const { registerLocalApp, APP_URL, HOST, PREFIX } = require("./local-app.cjs");

let mainWindow = null;
let authWindow = null;

function isSiteUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && url.hostname === HOST &&
      (url.pathname === PREFIX.slice(0, -1) || url.pathname.startsWith(PREFIX));
  } catch {
    return false;
  }
}

function finishOAuthReturn(returnUrl) {
  // Preserve the full callback URL, including query/hash tokens required by auth.
  const targetUrl = isSiteUrl(returnUrl) ? returnUrl : APP_URL;
  setTimeout(() => {
    if (authWindow && !authWindow.isDestroyed()) {
      authWindow.close();
      authWindow = null;
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(targetUrl);
    }
  }, 350);
}

function createAuthWindow(url) {
  if (authWindow && !authWindow.isDestroyed()) {
    authWindow.focus();
    authWindow.loadURL(url);
    return;
  }

  authWindow = new BrowserWindow({
    width: 500,
    height: 750,
    parent: mainWindow || undefined,
    modal: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  authWindow.webContents.setWindowOpenHandler(({ url: nextUrl }) => {
    try {
      if (new URL(nextUrl).protocol === "https:") {
        authWindow.loadURL(nextUrl);
      }
    } catch {}
    return { action: "deny" };
  });

  authWindow.webContents.on("will-navigate", (event, nextUrl) => {
    if (isSiteUrl(nextUrl)) {
      event.preventDefault();
      finishOAuthReturn(nextUrl);
    }
  });

  authWindow.webContents.on("will-redirect", (event, nextUrl) => {
    if (isSiteUrl(nextUrl)) {
      event.preventDefault();
      finishOAuthReturn(nextUrl);
    }
  });

  authWindow.on("closed", () => {
    authWindow = null;
  });

  authWindow.loadURL(url);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 650,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "updater-preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:" && parsed.hostname !== HOST) {
        createAuthWindow(url);
        return { action: "deny" };
      }
    } catch {}
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:" && parsed.hostname !== HOST) {
        event.preventDefault();
        createAuthWindow(url);
      } else if (parsed.protocol !== "https:") {
        event.preventDefault();
      }
    } catch {
      event.preventDefault();
    }
  });

  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(["notifications", "media"].includes(permission));
  });

  mainWindow.loadURL(APP_URL);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerUpdater();
  // Register before either the main window or OAuth window navigates to the site.
  registerLocalApp();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
