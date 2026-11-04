
import {
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getDesktopBridge,
  versionJsonUrl,
  type DownloadProgress,
} from "@/lib/desktop/bridge";

import {
  detectChannel,
  evaluatePolicy,
  isAssetAvailable,
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
      setState({
        s: "ready",
        version: null,
        policy: null,
        decision: null,
      });
      return;
    }

    setState({ s: "checking" });

    try {
      const [version, response] = await Promise.all([
        bridge.getVersion(),
        fetch(versionJsonUrl(), { cache: "no-store" }),
      ]);

      if (!response.ok) {
        throw new Error(`Version check failed: ${response.status}`);
      }

      const channel = detectChannel(version);

      if (!channel) {
        throw new Error(`Invalid installed version: ${version}`);
      }

      const policy = normalizePolicy(await response.json());

      const decision = evaluatePolicy(
        version,
        channel,
        policy
      );

      setState({
        s: "ready",
        version,
        policy,
        decision,
      });
    } catch (error) {
      console.error("Star-AI update check failed:", error);
      setState({ s: "error" });
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const startUpdate = async (decision: UpdateDecision) => {
    const bridge = getDesktopBridge();

    if (!bridge || downloading || decision.kind === "none") {
      return;
    }

    // Prefer Delta. If Delta is unavailable, use the full Setup.
    // The Delta installer handles verification and Setup fallback itself.

    const asset = isAssetAvailable(decision.delta)
      ? decision.delta
      : decision.setup;

    if (!isAssetAvailable(asset)) {
      setDlError(true);
      return;
    }

    setDlError(false);
    setDownloading(true);

    setProgress({
      received: 0,
      total: 0,
      percent: 0,
    });

    const off = bridge.onDownloadProgress(setProgress);

    try {
      const result = await bridge.downloadAndInstall({
        url: asset.downloadUrl,
        fileName: asset.fileName,
        version: decision.target,
        sha256: asset.sha256,
      });

      if (!result.ok) {
        setDownloading(false);
        setDlError(true);
      }
    } catch (error) {
      console.error("Star-AI update installation failed:", error);
      setDownloading(false);
      setDlError(true);
    } finally {
      off();
    }
  };

  if (state.s === "checking") {
    return (
      <div
        dir="ltr"
        className="flex h-dvh items-center justify-center"
      >
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
    featureAllowed: (feature) =>
      isFeatureAllowed(feature, version, policy),
  };

  const updateDecision =
    decision && decision.kind !== "none"
      ? decision
      : null;

  const mandatory =
    updateDecision?.kind === "mandatory";

  const showDialog =
    Boolean(policy && updateDecision) &&
    (mandatory || !dismissed);

  return (
    <VersionCtx.Provider value={ctx}>
      {showDialog ? null : children}

      {showDialog && policy && updateDecision && (
        <Modal>
          {downloading ? (
            <>
              <Download className="mx-auto h-8 w-8 animate-pulse text-primary" />

              <h2 className="mt-3 font-display text-lg font-semibold">
                Downloading Update...
              </h2>

              <p
                className="mt-1 text-sm text-muted-foreground"
                dir="ltr"
              >
                Star-AI {updateDecision.target}
              </p>

              <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-brand-gradient transition-all"
                  style={{
                    width: `${progress?.percent ?? 0}%`,
                  }}
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
                Update Failed
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Please check your internet connection and try again.
              </p>

              <div className="mt-6 flex gap-2">
                <Primary
                  onClick={() => void startUpdate(updateDecision)}
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Primary>

                <Secondary
                  onClick={() => {
                    if (mandatory) {
                      setDlError(false);
                    } else {
                      setDismissed(true);
                    }
                  }}
                >
                  {mandatory ? "Close" : "Later"}
                </Secondary>
              </div>
            </>
          ) : (
            <>
              <Sparkles className="mx-auto h-8 w-8 text-primary" />

              <h2 className="mt-3 font-display text-lg font-semibold">
                {mandatory
                  ? "Mandatory Update"
                  : updateDecision.targetChannel === "beta"
                    ? "New Beta Update"
                    : "Update Available"}
              </h2>

              {mandatory && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Please update Star-AI to continue using the application.
                </p>
              )}

              <div className="mt-4 space-y-2 rounded-2xl border border-border p-3 text-left text-sm">
                <p>
                  Current Version:{" "}
                  <span dir="ltr" className="font-semibold">
                    {updateDecision.current}
                  </span>
                </p>

                <p>
                  New Version:{" "}
                  <span dir="ltr" className="font-semibold">
                    {updateDecision.target}
                  </span>
                </p>

                <p>
                  Release Channel:{" "}
                  <span className="font-semibold">
                    {updateDecision.targetChannel === "beta"
                      ? "Beta"
                      : "Stable"}
                  </span>
                </p>
              </div>

              {updateDecision.notes.length > 0 && (
                <div className="mt-3 text-left text-sm">
                  <p className="font-medium">
                    What's New:
                  </p>

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
                    {updateDecision.notes.map((note, index) => (
                      <li
                        key={index}
                        dir="ltr"
                        lang="en"
                        className="text-left"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <Primary
                  disabled={downloading}
                  onClick={() => void startUpdate(updateDecision)}
                >
                  <Download className="h-4 w-4" />
                  Download & Install
                </Primary>

                {!mandatory && (
                  <Secondary
                    onClick={() => setDismissed(true)}
                  >
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
