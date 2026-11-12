
/**
 * Star-AI Desktop Update Policy
 *
 * Versioning:
 * - Stable: third version number is always 0
 * - Beta: third version number is greater than 0
 *
 * Examples:
 * 3.6.0  = Stable
 * 3.6.1  = Beta
 * 3.6.2  = Beta
 * 3.6.10 = Beta
 * 3.7.0  = Stable
 */

export type ReleaseChannel = "stable" | "beta";

export type UpdateMode = "mandatory" | "optional" | "disabled";

export type ReleaseAsset = {
  fileName: string;
  downloadUrl: string;
  sha256: string;
};

export type ChannelRelease = {
  version: string;
  minimumVersion: string;
  releaseNotes: string[];
  setup: ReleaseAsset;
  delta: ReleaseAsset;
};

export type VersionHistoryEntry = {
  version: string;
  releaseNotes: string[];
};

export type VersionPolicy = {
  stable: ChannelRelease;
  beta: ChannelRelease;
  history?: Partial<Record<ReleaseChannel, Record<string, VersionHistoryEntry>>>;

  policies: {
    stableToStable: UpdateMode;
    stableToBeta: UpdateMode;
    betaToBeta: UpdateMode;
    betaToStable: UpdateMode;
  };

  featureRequirements: Record<string, string>;
};

export type UpdateDecision =
  | {
      kind: "mandatory" | "optional";
      current: string;
      currentChannel: ReleaseChannel;
      target: string;
      targetChannel: ReleaseChannel;
      notes: string[];
      setup: ReleaseAsset;
      delta: ReleaseAsset;
    }
  | {
      kind: "none";
      current: string;
      currentChannel: ReleaseChannel;
    };

const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)$/i;

export function parseVersion(
  input: string
): [number, number, number] | null {
  const match = String(input ?? "").trim().match(VERSION_PATTERN);

  if (!match) return null;

  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ];
}

/**
 * Detect channel from the third version number.
 */
export function detectChannel(version: string): ReleaseChannel | null {
  const parsed = parseVersion(version);

  if (!parsed) return null;

  return parsed[2] === 0 ? "stable" : "beta";
}

/**
 * Validates that a version belongs to the specified channel.
 */
export function isVersionForChannel(
  version: string,
  channel: ReleaseChannel
): boolean {
  return detectChannel(version) === channel;
}

export function compareVersions(a: string, b: string): number {
  const first = parseVersion(a);
  const second = parseVersion(b);

  if (!first || !second) {
    throw new Error(
      `Invalid version: "${!first ? a : b}"`
    );
  }

  for (let i = 0; i < 3; i++) {
    if (first[i]! > second[i]!) return 1;
    if (first[i]! < second[i]!) return -1;
  }

  return 0;
}

function isValidHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}

function normalizeAsset(raw: unknown): ReleaseAsset {
  const value =
    raw && typeof raw === "object"
      ? raw as Record<string, unknown>
      : {};

  return {
    fileName:
      typeof value.fileName === "string"
        ? value.fileName.trim()
        : "",

    downloadUrl:
      typeof value.downloadUrl === "string"
        ? value.downloadUrl.trim()
        : "",

    sha256:
      typeof value.sha256 === "string"
        ? value.sha256.trim().toLowerCase()
        : "",
  };
}

function normalizeRelease(
  raw: unknown,
  channel: ReleaseChannel
): ChannelRelease {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid ${channel} release configuration`);
  }

  const value = raw as Record<string, unknown>;

  const version =
    typeof value.version === "string"
      ? value.version.trim()
      : "";

  const minimumVersion =
    typeof value.minimumVersion === "string"
      ? value.minimumVersion.trim()
      : "";

  if (!parseVersion(version)) {
    throw new Error(`Invalid ${channel} version`);
  }

  if (!parseVersion(minimumVersion)) {
    throw new Error(`Invalid ${channel} minimumVersion`);
  }

  if (!isVersionForChannel(version, channel)) {
    throw new Error(
      `${channel} version ${version} violates Star-AI versioning rules`
    );
  }

  const notes = Array.isArray(value.releaseNotes)
    ? value.releaseNotes.filter(
        (item): item is string => typeof item === "string"
      )
    : [];

  return {
    version,
    minimumVersion,
    releaseNotes: notes,
    setup: normalizeAsset(value.setup),
    delta: normalizeAsset(value.delta),
  };
}

function normalizeMode(value: unknown): UpdateMode {
  if (
    value === "mandatory" ||
    value === "optional" ||
    value === "disabled"
  ) {
    return value;
  }

  return "disabled";
}

export function normalizePolicy(raw: unknown): VersionPolicy {
  if (!raw || typeof raw !== "object") {
    throw new Error("version.json is not an object");
  }

  const value = raw as Record<string, unknown>;

  const policies =
    value.policies && typeof value.policies === "object"
      ? value.policies as Record<string, unknown>
      : {};

  const featureRequirements: Record<string, string> = {};

  if (
    value.featureRequirements &&
    typeof value.featureRequirements === "object"
  ) {
    for (
      const [key, requirement] of Object.entries(
        value.featureRequirements as Record<string, unknown>
      )
    ) {
      if (
        typeof requirement === "string" &&
        parseVersion(requirement)
      ) {
        featureRequirements[key] = requirement;
      }
    }
  }

  const history: Partial<Record<ReleaseChannel, Record<string, VersionHistoryEntry>>> = {};
  if (value.history && typeof value.history === "object") {
    const rawHistory = value.history as Record<string, unknown>;
    for (const channel of ["stable", "beta"] as const) {
      const channelHistory = rawHistory[channel];
      if (!channelHistory || typeof channelHistory !== "object") continue;
      const normalized: Record<string, VersionHistoryEntry> = {};
      for (const [version, entryValue] of Object.entries(channelHistory as Record<string, unknown>)) {
        if (!parseVersion(version) || !entryValue || typeof entryValue !== "object") continue;
        const entry = entryValue as Record<string, unknown>;
        const entryVersion = typeof entry.version === "string" && parseVersion(entry.version) ? entry.version : version;
        const releaseNotes = Array.isArray(entry.releaseNotes)
          ? entry.releaseNotes.filter((note): note is string => typeof note === "string")
          : [];
        normalized[version] = { version: entryVersion, releaseNotes };
      }
      history[channel] = normalized;
    }
  }

  return {
    stable: normalizeRelease(value.stable, "stable"),
    beta: normalizeRelease(value.beta, "beta"),
    ...(Object.keys(history).length ? { history } : {}),

    policies: {
      stableToStable: normalizeMode(policies.stableToStable),
      stableToBeta: normalizeMode(policies.stableToBeta),
      betaToBeta: normalizeMode(policies.betaToBeta),
      betaToStable: normalizeMode(policies.betaToStable),
    },

    featureRequirements,
  };
}

function getPolicyKey(
  current: ReleaseChannel,
  target: ReleaseChannel
): keyof VersionPolicy["policies"] {
  if (current === "stable" && target === "stable") {
    return "stableToStable";
  }

  if (current === "stable" && target === "beta") {
    return "stableToBeta";
  }

  if (current === "beta" && target === "beta") {
    return "betaToBeta";
  }

  return "betaToStable";
}

export function evaluatePolicy(
  current: string,
  currentChannel: ReleaseChannel,
  policy: VersionPolicy
): UpdateDecision {
  const currentVersion = parseVersion(current);

  if (!currentVersion) {
    throw new Error(`Invalid installed version: ${current}`);
  }

  if (!isVersionForChannel(current, currentChannel)) {
    throw new Error(
      `Installed version ${current} does not match ${currentChannel} channel`
    );
  }

  // Prefer the installed channel first.
  // Then check the other channel if its policy allows it.
  const candidates: ReleaseChannel[] =
    currentChannel === "stable"
      ? ["stable", "beta"]
      : ["beta", "stable"];

  for (const targetChannel of candidates) {
    const release = policy[targetChannel];

    const mode =
      policy.policies[getPolicyKey(currentChannel, targetChannel)];

    if (mode === "disabled") continue;

    if (!isVersionForChannel(release.version, targetChannel)) {
      continue;
    }

    // Never downgrade or reinstall the same version.
    if (compareVersions(release.version, current) <= 0) {
      continue;
    }

    const belowMinimum =
      compareVersions(current, release.minimumVersion) < 0;

    const kind =
      mode === "mandatory" || belowMinimum
        ? "mandatory"
        : "optional";

    return {
      kind,
      current,
      currentChannel,
      target: release.version,
      targetChannel,
      notes: release.releaseNotes,
      setup: release.setup,
      delta: release.delta,
    };
  }

  return {
    kind: "none",
    current,
    currentChannel,
  };
}

export function isFeatureAllowed(
  feature: string,
  current: string | null,
  policy: VersionPolicy | null
): boolean {
  if (current === null) return true;
  if (!policy) return false;

  const requirement = policy.featureRequirements[feature];

  if (!requirement) return true;

  return compareVersions(current, requirement) >= 0;
}

export function isAssetAvailable(asset: ReleaseAsset): boolean {
  return Boolean(
    asset.fileName &&
    asset.downloadUrl &&
    isValidHash(asset.sha256)
  );
}
