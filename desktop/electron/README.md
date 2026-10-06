# Star-AI desktop: updater + frozen web build

Each desktop release ships its own copy of the web app in `web/`. Changes on
GitHub Pages never reach installed apps; only `version.json` is read live.

## Files (copy into the Electron project)

```
Star-AI-Desktop/
├── src/main.js
├── src/updater.cjs           (unchanged)
├── src/updater-preload.cjs   (unchanged)
├── src/local-app.cjs         (new — serves web/ locally)
├── release.cjs               (new — one-command release)
├── web/                      (generated — the frozen web build)
└── package.json
```

## src/main.js

```js
const { registerUpdater } = require("./updater.cjs");
const { registerLocalApp, APP_URL } = require("./local-app.cjs");

app.whenReady().then(() => {
  registerUpdater();
  registerLocalApp();          // before any window loads
  // ... create BrowserWindow exactly as before (preload, icon, protocol) ...
  win.loadURL(APP_URL);        // same URL as before, now served from web/
});
```

Keep your Google login handling, icon and custom protocol code as they are.

## package.json

- `"version"`: bump for each release (e.g. `1.0.3`).
- Add `"release": "node release.cjs"` to `scripts`.
- Ship `web/` with the app:
  - electron-packager: `--extra-resource=web`
  - electron-builder: `"extraResources": [{ "from": "web", "to": "web" }]`
- Electron 25 or newer is required.

## Release 1.0.3

1. Set `"version": "1.0.3"` in the Electron package.json.
2. `npm run release` → builds latest web, copies to `web/`, builds the EXE.
3. Build the installer with Inno Setup (same `AppId`, keep `[Run]` postinstall).
4. Upload `Star-AI-Setup-1.0.3.exe` to GitHub Releases.
5. In the website's `public/version.json`: `latestVersion` → `1.0.3`,
   `setupFileName` → `Star-AI-Setup-1.0.3.exe`, `setupDownloadUrl` → its link.
