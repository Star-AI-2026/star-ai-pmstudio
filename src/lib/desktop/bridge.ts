
/**
 * Star-AI Desktop Bridge
 *
 * Contract between the React application and Electron preload.
 * The installed version is always provided by Electron.
 */

export type DownloadProgress = {
  received: number;
  total: number;
  percent: number;
};

export type DownloadRequest = {
  url: string;
  fileName: string;
  version: string;
  sha256: string;
};

export type DownloadResult =
  | { ok: true }
  | { ok: false; error: string }
  | { success: true };

export type StarDesktopBridge = {
  isDesktop: true;

  getVersion: () => Promise<string>;

  downloadAndInstall: (
    req: DownloadRequest
  ) => Promise<DownloadResult>;

  onDownloadProgress: (
    cb: (progress: DownloadProgress) => void
  ) => () => void;

  openExternal?: (url: string) => Promise<void>;
};

declare global {
  interface Window {
    starDesktop?: StarDesktopBridge;
  }
}

/**
 * Returns the Electron bridge when running inside Star-AI Desktop.
 */
export function getDesktopBridge(): StarDesktopBridge | null {
  if (typeof window === "undefined") {
    return null;
  }

  const bridge = window.starDesktop;

  if (
    !bridge ||
    bridge.isDesktop !== true ||
    typeof bridge.getVersion !== "function" ||
    typeof bridge.downloadAndInstall !== "function" ||
    typeof bridge.onDownloadProgress !== "function"
  ) {
    return null;
  }

  return bridge;
}

/**
 * Public version.json URL.
 *
 * Always use the canonical GitHub Pages URL.
 * This prevents incorrect BASE_URL values from causing 404 errors.
 */
export function versionJsonUrl(): string {
  return `https://star-ai-2026.github.io/star-ai-pmstudio/version.json?t=${Date.now()}`;
}
