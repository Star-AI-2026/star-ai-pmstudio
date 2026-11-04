/**
 * Contract with the Electron preload script (see desktop/electron/).
 * The website never trusts a user-entered version: it only reads what the
 * Electron main process reports from app.getVersion().
 */

export type DownloadProgress = { received: number; total: number; percent: number };

export type StarDesktopBridge = {
  isDesktop: true;
  getVersion: () => Promise<string>;
  /** Downloads the approved Update installer (or full Setup), verifies SHA-256, then opens it. */
  downloadAndInstall: (req: {
    url: string;
    fileName: string;
    version: string;
    sha256: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  onDownloadProgress: (cb: (p: DownloadProgress) => void) => () => void;
  openExternal?: (url: string) => Promise<void>;
};

declare global {
  interface Window {
    starDesktop?: StarDesktopBridge;
  }
}

export function getDesktopBridge(): StarDesktopBridge | null {
  if (typeof window === "undefined") return null;
  const b = window.starDesktop;
  return b && b.isDesktop === true && typeof b.getVersion === "function" ? b : null;
}

export function versionJsonUrl(): string {
  return `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`;
}
