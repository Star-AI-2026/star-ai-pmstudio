/**
 * When Star-AI is served from a static host (e.g. GitHub Pages) there is no
 * server runtime. Chat and image generation are routed to the Cloudflare Worker.
 * They have separate build-time origins for backwards compatibility, but the
 * default deployment uses the same Worker for both endpoints. No API key is
 * included here; Gemini credentials stay in Cloudflare Worker Secrets.
 */
declare const __STAR_AI_API_BASE__: string;
declare const __STAR_AI_IMAGE_API_BASE__: string;

const trimOrigin = (value: string) => value.replace(/\/+$/, "");
const apiBase = trimOrigin(typeof __STAR_AI_API_BASE__ === "string" ? __STAR_AI_API_BASE__ : "");
const imageApiBase = trimOrigin(
  typeof __STAR_AI_IMAGE_API_BASE__ === "string" ? __STAR_AI_IMAGE_API_BASE__ : "",
);

export const CHAT_ENDPOINT = `${apiBase}/api/public/chat`;
export const IMAGE_GENERATION_ENDPOINT = `${imageApiBase}/api/public/generate-image`;

/** Captcha-protected sign-up endpoint (verification happens server-side). */
export const SIGNUP_ENDPOINT = `https://star-ai-pmstudio.lovable.app/api/public/signup`;

/**
 * Origin of the hosted app API. The Cloudflare Worker is used for AI requests;
 * the app's OAuth bridge may still use its configured hosted origin.
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
