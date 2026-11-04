
import { Download, Loader2, RefreshCw, Sparkles, TriangleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { getDesktopBridge, versionJsonUrl, type DownloadProgress } from "@/lib/desktop/bridge";
import {
  evaluatePolicy,
  isFeatureAllowed,
  normalizePolicy,
  type UpdateDecision,
  type VersionPolicy,
} from "@/lib/desktop/policy";

type Ctx = {
  desktopVersion: string | null;
  policy: VersionPolicy | null;
  featureAllowed: (feature: string) => boolean;
};

const VersionCtx = createContext<Ctx>({
  desktopVersion: null,
  policy: null,
  featureAllowed: () => true,
});

export const useDesktopVersion = () => useContext(VersionCtx);

type State =
  | { s: "checking" }
  | { s: "error" }
  | {
      s: "ready";
      version: string | null;
      policy: VersionPolicy | null;
      decision: UpdateDecision | null;
    };

const mb = (n: number) => (n / 1048576).toFixed(1);

export function UpdateGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ s: "checking" });
  const [dismissed, setDismissed] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState(false);

  const check = useCallback(async () => {
    const bridge = getDesktopBridge();

    if (!bridge) {
      setState({ s: "ready", version: null, policy: null, decision: null });
      return;
    }

    setState({ s: "checking" });

    try {
      const [version, res] = await Promise.all([
        bridge.getVersion(),
        fetch(versionJsonUrl(), { cache: "no-store" }),
      ]);

      if (!res.ok) throw new Error(String(res.status));

      const policy = normalizePolicy(await res.json());

      setState({
        s: "ready",
        version,
        policy,
        decision: evaluatePolicy(version, policy),
      });
    } catch {
      setState({ s: "error" });
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const startUpdate = async (policy: VersionPolicy, target: string) => {
    const bridge = getDesktopBridge();

    if (!bridge || downloading) return;

    // Prefer the compact universal delta installer. If this release does not
    // publish one, use the full Setup. The Update installer itself falls back
    // to Setup when the installed base hash or patch verification fails.
    const isBeta = Boolean(policy.betaVersion && target === policy.betaVersion);
    const updateUrl = isBeta ? policy.betaUpdateDownloadUrl : policy.updateDownloadUrl;
    const updateName = isBeta ? policy.betaUpdateFileName : policy.updateFileName;
    const updateHash = isBeta ? policy.betaUpdateSha256 : policy.updateSha256;
    const setupUrl = isBeta ? policy.betaSetupDownloadUrl : policy.setupDownloadUrl;
    const setupName = isBeta ? policy.betaSetupFileName : policy.setupFileName;
    const setupHash = isBeta ? policy.betaSetupSha256 : policy.setupSha256;

    const useDelta = Boolean(updateUrl && updateName && updateHash);
    const asset = useDelta
      ? { url: updateUrl, fileName: updateName, sha256: updateHash }
      : { url: setupUrl, fileName: setupName, sha256: setupHash };

    if (!asset.url || !asset.fileName || !asset.sha256) {
      setDlError(true);
      return;
    }

    setDlError(false);
    setDownloading(true);
    setProgress({ received: 0, total: 0, percent: 0 });

    const off = bridge.onDownloadProgress(setProgress);

    try {
      const r = await bridge.downloadAndInstall({
        url: asset.url,
        fileName: asset.fileName,
        version: target,
        sha256: asset.sha256,
      });

      if (!r.ok) {
        setDownloading(false);
        setDlError(true);
      }
    } catch {
      setDownloading(false);
      setDlError(true);
    } finally {
      off();
    }
  };

  if (state.s === "checking") {
    return (
      <div dir="ltr" className="flex h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (state.s === "error") {
    return (
      <Modal>
        <TriangleAlert className="mx-auto h-8 w-8 text-destructive" />

        <h2 className="mt-3 font-display text-lg font-semibold">
          Unable to check Star-AI version.
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Please check your internet connection.
        </p>

        <div className="mt-6 flex gap-2">
          <Primary onClick={() => void check()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Primary>

          <Secondary onClick={() => window.close()}>
            Exit
          </Secondary>
        </div>
      </Modal>
    );
  }

  const { version, policy, decision } = state;

  const ctx: Ctx = {
    desktopVersion: version,
    policy,
    featureAllowed: (f) => isFeatureAllowed(f, version, policy),
  };

  const mandatory = decision?.kind === "mandatory";

  const showDialog =
    policy &&
    decision &&
    decision.kind !== "none" &&
    (mandatory || !dismissed);

  return (
    <VersionCtx.Provider value={ctx}>
      {showDialog ? null : children}

      {showDialog && policy && (
        <Modal>
          {downloading ? (
            <>
              <Download className="mx-auto h-8 w-8 animate-pulse text-primary" />

              <h2 className="mt-3 font-display text-lg font-semibold">
                Downloading update...
              </h2>

              <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                Star-AI {decision.target}
              </p>

              <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-brand-gradient transition-all"
                  style={{ width: `${progress?.percent ?? 0}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {progress && progress.total > 0
                  ? `Downloading: ${progress.percent}%`
                  : "Downloading..."}
                {progress && progress.total > 0
                  ? ` · ${mb(progress.received)} MB / ${mb(progress.total)} MB`
                  : ""}
              </p>
            </>
          ) : dlError ? (
            <>
              <TriangleAlert className="mx-auto h-8 w-8 text-destructive" />

              <h2 className="mt-3 font-display text-lg font-semibold">
                Update download failed.
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Please check your internet connection and try again.
              </p>

              <div className="mt-6 flex gap-2">
                <Primary onClick={() => void startUpdate(policy, decision.target)}>
                  Retry
                </Primary>

                <Secondary
                  onClick={() =>
                    mandatory ? setDlError(false) : setDismissed(true)
                  }
                >
                  Close
                </Secondary>
              </div>
            </>
          ) : (
            <>
              <Sparkles className="mx-auto h-8 w-8 text-primary" />

              <h2 className="mt-3 font-display text-lg font-semibold">
                {decision.kind === "mandatory"
                  ? "Star-AI update required"
                  : decision.kind === "optional"
                    ? "A new Star-AI version is available."
                    : "A new Star-AI beta version is available."}
              </h2>

              {mandatory && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Please update Star-AI to the latest version to access new features.
                </p>
              )}

              <div className="mt-4 space-y-1 rounded-2xl border border-border p-3 text-left text-sm">
                <p>
                  Current version:{" "}
                  <span dir="ltr">{decision.current}</span>
                </p>

                <p>
                  {decision.kind === "beta" ? "Beta version" : "New version"}:{" "}
                  <span dir="ltr" className="font-semibold">
                    {decision.target}
                  </span>
                </p>
              </div>

              {decision.notes.length > 0 && (
                <div className="mt-3 text-sm text-left">
                  <p className="font-medium">What's New:</p>

                  <ul
                    dir="ltr"
                    lang="en"
                    className="mt-1 space-y-1 text-left text-muted-foreground font-sans"
                    style={{
                      direction: "ltr",
                      textAlign: "left",
                      unicodeBidi: "isolate",
                    }}
                  >
                    {decision.notes.map((n, i) => (
                      <li key={i} dir="ltr" lang="en" className="text-left">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <Primary
                  disabled={downloading}
                  onClick={() => void startUpdate(policy, decision.target)}
                >
                  {mandatory
                    ? "Update Star-AI"
                    : decision.kind === "beta"
                      ? "Update"
                      : "Update"}
                </Primary>

                {!mandatory && (
                  <Secondary onClick={() => setDismissed(true)}>
                    Later
                  </Secondary>
                )}
              </div>
            </>
          )}
        </Modal>
      )}
    </VersionCtx.Provider>
  );
}

function Modal({ children }: { children: ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      dir="ltr"
      lang="en"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
    >
      <div className="glass w-full max-w-sm rounded-3xl p-7 text-center shadow-glow">
        {children}
      </div>
    </div>
  );
}

function Primary(p: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={p.onClick}
      disabled={p.disabled}
      dir="ltr"
      className="disabled:opacity-60 flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-gradient py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
    >
      {p.children}
    </button>
  );
}

function Secondary(p: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={p.onClick}
      dir="ltr"
      className="flex-1 rounded-2xl border border-border py-2.5 text-sm text-muted-foreground hover:bg-secondary"
    >
      {p.children}
    </button>
  );
}
