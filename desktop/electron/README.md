# Star-AI desktop updater

1. Copy `updater.cjs` and `updater-preload.cjs` next to your Electron `main.js` / `preload.js`.
2. In `main.js` after `app.whenReady()`: `require("./updater.cjs").registerUpdater();`
3. In `preload.js`: `require("./updater-preload.cjs");`
4. The version comes from `app.getVersion()` (your package.json `version`) — bump it for each build.
5. Inno Setup: make sure the `.iss` keeps the same `AppId`, and add so the new app starts after install:

```
[Run]
Filename: "{app}\Star-AI.exe"; Flags: nowait postinstall skipifsilent
```

The website (`public/version.json`) controls everything else.
