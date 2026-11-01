// Add to your existing preload script (contextIsolation: true).
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("starDesktop", {
  isDesktop: true,
  getVersion: () => ipcRenderer.invoke("star:get-version"),
  downloadAndInstall: (req) => ipcRenderer.invoke("star:download-and-install", req),
  openExternal: (url) => ipcRenderer.invoke("star:open-external", url),
  onDownloadProgress: (cb) => {
    const h = (_e, p) => cb(p);
    ipcRenderer.on("star:download-progress", h);
    return () => ipcRenderer.removeListener("star:download-progress", h);
  },
});
