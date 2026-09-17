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

/** Captcha-protected sign-up endpoint (verification happens server-side). */
export const SIGNUP_ENDPOINT = `${apiBase}/api/public/signup`;

/**
 * Origin of the Lovable-hosted deployment ("" when the app is served from it).
 * Google sign-in must start there: the OAuth broker only accepts the project's
 * own domains, so a static host (GitHub Pages) cannot talk to it directly.
 */
export const HOSTED_ORIGIN = apiBase;

/** True when this build is served from a host other than the Lovable deployment. */
export function isExternallyHosted(): boolean {
  if (!apiBase) return false;
  try {
    return new URL(apiBase).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/** Absolute URL inside the app, honouring the deployment base path. */
export function appUrl(path = ""): string {
  const base = import.meta.env.BASE_URL || "/";
  const joined = `${base}/${path}`.replace(/\/{2,}/g, "/");
  return (
    new URL(joined, window.location.origin).toString().replace(/\/$/, "") || window.location.origin
  );
}
