// Star-AI updater bridge. Can be the preload itself, or pasted into an existing preload.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("starDesktop", {
  isDesktop: true,
  getVersion: () => ipcRenderer.invoke("star:get-version"),
  downloadAndInstall: (req) => ipcRenderer.invoke("star:download-and-install", req),
  openExternal: (url) => ipcRenderer.invoke("star:open-external", url),
  onDownloadProgress: (cb) => {
    const handler = (_e, p) => cb(p);
    ipcRenderer.on("star:download-progress", handler);
    return () => ipcRenderer.removeListener("star:download-progress", handler);
  },
});
