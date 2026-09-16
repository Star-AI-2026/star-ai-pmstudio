/**
 * When Star-AI is served from a static host (e.g. GitHub Pages) there is no
 * server runtime, so the AI endpoint lives on the Lovable-hosted deployment.
 * VITE_STAR_AI_API_BASE holds that origin at build time (inlined below).
 * Empty = same-origin (default).
 * No secrets here: the endpoint is public, all keys stay server-side.
 */
declare const __STAR_AI_API_BASE__: string;

const apiBase = (typeof __STAR_AI_API_BASE__ === "string" ? __STAR_AI_API_BASE__ : "").replace(
  /\/+$/,
  "",
);

export const CHAT_ENDPOINT = `${apiBase}/api/public/chat`;

/** Absolute URL inside the app, honouring the deployment base path. */
export function appUrl(path = ""): string {
  const base = import.meta.env.BASE_URL || "/";
  const joined = `${base}/${path}`.replace(/\/{2,}/g, "/");
  return (
    new URL(joined, window.location.origin).toString().replace(/\/$/, "") || window.location.origin
  );
}
