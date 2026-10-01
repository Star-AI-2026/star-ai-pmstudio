/**
 * Reusable server-side version validation layer (not wired to any AI API yet).
 * Future flow: auth → validateDesktopRequest → isFeatureAllowed → AI API.
 * Desktop clients should send header `X-Star-AI-Desktop-Version`.
 */
import { compareVersions, isFeatureAllowed, normalizePolicy, type VersionPolicy } from "./policy";

const POLICY_URL = "https://star-ai-2026.github.io/star-ai-pmstudio/version.json";

export async function loadPolicy(url = POLICY_URL): Promise<VersionPolicy> {
  const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`version.json HTTP ${res.status}`);
  return normalizePolicy(await res.json());
}

export type GuardResult = { ok: true } | { ok: false; status: 426 | 503; error: string };

export async function validateDesktopRequest(
  request: Request,
  feature?: string,
  policy?: VersionPolicy,
): Promise<GuardResult> {
  const version = request.headers.get("x-star-ai-desktop-version");
  if (!version) return { ok: true }; // web browser client
  let p: VersionPolicy;
  try {
    p = policy ?? (await loadPolicy());
  } catch {
    return { ok: false, status: 503, error: "بررسی نسخه Star-AI انجام نشد." };
  }
  try {
    if (compareVersions(version, p.minimumVersion) < 0) {
      return { ok: false, status: 426, error: "بروزرسانی Star-AI لازم است" };
    }
    if (feature && !isFeatureAllowed(feature, version, p)) {
      return { ok: false, status: 426, error: "این قابلیت به نسخه جدیدتر Star-AI نیاز دارد." };
    }
  } catch {
    return { ok: false, status: 426, error: "نسخه Star-AI نامعتبر است." };
  }
  return { ok: true };
}
