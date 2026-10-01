/**
 * Star-AI desktop version policy. Pure, client- and server-safe.
 * The policy itself lives in /public/version.json — never hardcode it here.
 */

export type VersionPolicy = {
  latestVersion: string;
  minimumVersion: string;
  channel: "stable" | "beta" | string;
  betaVersion: string;
  betaReleaseNotes: string[];
  releaseNotes: string[];
  downloadUrl: string;
  setupFileName: string;
  setupDownloadUrl: string;
  featureRequirements: Record<string, string>;
};

/** Parse "1.0.2", "v1.0.2", "1.0.2 Beta", "1.0.2-beta.1" into [major, minor, patch]. */
export function parseVersion(input: string): [number, number, number] | null {
  const m = String(input ?? "")
    .trim()
    .match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0)];
}

/** Numeric semantic comparison (never string comparison). Returns -1, 0 or 1. */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) throw new Error(`Invalid version: "${!pa ? a : b}"`);
  for (let i = 0; i < 3; i++) {
    if (pa[i]! > pb[i]!) return 1;
    if (pa[i]! < pb[i]!) return -1;
  }
  return 0;
}

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v.trim() : fallback);
const list = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/** Validate raw JSON. Throws when the required fields are missing/invalid. */
export function normalizePolicy(raw: unknown): VersionPolicy {
  if (!raw || typeof raw !== "object") throw new Error("version.json is not an object");
  const r = raw as Record<string, unknown>;
  const latestVersion = str(r.latestVersion);
  const minimumVersion = str(r.minimumVersion);
  if (!parseVersion(latestVersion) || !parseVersion(minimumVersion)) {
    throw new Error("version.json: latestVersion/minimumVersion invalid");
  }
  const reqs: Record<string, string> = {};
  if (r.featureRequirements && typeof r.featureRequirements === "object") {
    for (const [k, v] of Object.entries(r.featureRequirements as Record<string, unknown>)) {
      if (typeof v === "string" && parseVersion(v)) reqs[k] = v;
    }
  }
  return {
    latestVersion,
    minimumVersion,
    channel: str(r.channel, "stable") || "stable",
    betaVersion: str(r.betaVersion),
    betaReleaseNotes: list(r.betaReleaseNotes),
    releaseNotes: list(r.releaseNotes),
    downloadUrl: str(r.downloadUrl),
    setupFileName: str(r.setupFileName),
    setupDownloadUrl: str(r.setupDownloadUrl),
    featureRequirements: reqs,
  };
}

export type UpdateDecision =
  | { kind: "mandatory"; current: string; target: string; notes: string[] }
  | { kind: "optional"; current: string; target: string; notes: string[] }
  | { kind: "beta"; current: string; target: string; notes: string[] }
  | { kind: "none"; current: string };

/** Decide what to show. Beta never produces "mandatory". */
export function evaluatePolicy(current: string, p: VersionPolicy): UpdateDecision {
  if (compareVersions(current, p.minimumVersion) < 0) {
    return { kind: "mandatory", current, target: p.latestVersion, notes: p.releaseNotes };
  }
  if (compareVersions(current, p.latestVersion) < 0) {
    return { kind: "optional", current, target: p.latestVersion, notes: p.releaseNotes };
  }
  if (p.betaVersion && parseVersion(p.betaVersion) && compareVersions(current, p.betaVersion) < 0) {
    return { kind: "beta", current, target: p.betaVersion, notes: p.betaReleaseNotes };
  }
  return { kind: "none", current };
}

/**
 * Feature gate. `current === null` means plain web browser (always latest code) → allowed.
 * Unknown features are allowed; listed features need current >= required.
 */
export function isFeatureAllowed(
  feature: string,
  current: string | null,
  p: VersionPolicy | null,
): boolean {
  if (current === null) return true;
  if (!p) return false; // desktop without a loaded policy: fail closed
  const req = p.featureRequirements[feature];
  if (!req) return true;
  return compareVersions(current, req) >= 0;
}
