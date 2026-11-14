import {
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getDesktopBridge, versionJsonUrl, type DownloadProgress } from "@/lib/desktop/bridge";
import {
  detectChannel,
  evaluatePolicy,
  isAssetAvailable,
  normalizePolicy,
  type ReleaseChannel,
  type UpdateDecision,
  type VersionPolicy,
} from "@/lib/desktop/policy";

const mb = (value: number) => (value / 1048576).toFixed(1);

type InitialInfo =
  | { status: "loading" }
  | { status: "unavailable"; message: string }
  | {
      status: "ready";
      version: string;
      channel: ReleaseChannel;
      notes: string[];
      policy: VersionPolicy;
    }
  | { status: "error"; message: string };

type Phase = "idle" | "checking" | "up-to-date" | "found" | "downloading" | "error";

type Props = { open: boolean; onClose: () => void };

export function UpdateCheckerDialog({ open, onClose }: Props) {
  const [initial, setInitial] = useState<InitialInfo>({ status: "loading" });
  const [phase, setPhase] = useState<Phase>("idle");
  const [decision, setDecision] = useState<UpdateDecision | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      timer = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, 260);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setInitial({ status: "loading" });
    setPhase("idle");
    setDecision(null);
    setError("");
    setProgress(null);

    const loadInstalledInfo = async () => {
      const bridge = getDesktopBridge();
      if (!bridge) {
        if (active) {
          setInitial({
            status: "unavailable",
            message: "Version checking is available in the installed Star-AI Desktop application.",
          });
        }
        return;
      }

      try {
        const [version, response] = await Promise.all([
          bridge.getVersion(),
          fetch(versionJsonUrl(), { cache: "no-store" }),
        ]);
        if (!response.ok) throw new Error(`version.json returned HTTP ${response.status}`);
        const raw = await response.json();
        const policy = normalizePolicy(raw);
        const channel = detectChannel(version);
        if (!channel) throw new Error(`Invalid installed version: ${version}`);

        const archivedNotes = policy.history?.[channel]?.[version]?.releaseNotes;
        const currentRelease = policy[channel];
        const notes = archivedNotes ?? (currentRelease.version === version ? currentRelease.releaseNotes : []);
        if (active) setInitial({ status: "ready", version, channel, notes, policy });
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Could not load installed version details.";
        if (active) setInitial({ status: "error", message });
      }
    };

    void loadInstalledInfo();
    return () => {
      active = false;
    };
  }, [open]);

  if (!mounted) return null;

  const check = async () => {
    const bridge = getDesktopBridge();
    if (!bridge) {
      setPhase("error");
      setError("The desktop update service is unavailable in this browser.");
      return;
    }
    setPhase("checking");
    setDecision(null);
    setError("");
    try {
      const [version, response] = await Promise.all([
        bridge.getVersion(),
        fetch(versionJsonUrl(), { cache: "no-store" }),
      ]);
      if (!response.ok) throw new Error(`Update check failed: HTTP ${response.status}`);
      const policy = normalizePolicy(await response.json());
      const channel = detectChannel(version);
      if (!channel) throw new Error(`Invalid installed version: ${version}`);
      const result = evaluatePolicy(version, channel, policy);
      setInitial((previous) => {
        if (previous.status !== "ready") return previous;
        const archivedNotes = policy.history?.[channel]?.[version]?.releaseNotes;
        return {
          ...previous,
          policy,
          notes: archivedNotes ?? (policy[channel].version === version ? policy[channel].releaseNotes : []),
        };
      });
      setDecision(result);
      setPhase(result.kind === "none" ? "up-to-date" : "found");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not check for updates.");
      setPhase("error");
    }
  };

  const install = async () => {
    const bridge = getDesktopBridge();
    if (!bridge || !decision || decision.kind === "none" || phase === "downloading") return;
    const asset = isAssetAvailable(decision.delta) ? decision.delta : decision.setup;
    if (!isAssetAvailable(asset)) {
      setError("A valid update installer is not available for this release.");
      setPhase("error");
      return;
    }

    setPhase("downloading");
    setProgress({ received: 0, total: 0, percent: 0 });
    const off = bridge.onDownloadProgress(setProgress);
    try {
      const result = await bridge.downloadAndInstall({
        url: asset.downloadUrl,
        fileName: asset.fileName,
        version: decision.target,
        sha256: asset.sha256,
      });
      const accepted = ("ok" in result && result.ok === true) || ("success" in result && result.success === true);
      if (!accepted) {
        throw new Error("error" in result ? result.error : "The installer could not be started.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Update installation failed.");
      setPhase("error");
    } finally {
      off();
    }
  };

  const currentVersion = initial.status === "ready" ? initial.version : null;
  const currentNotes = initial.status === "ready" ? initial.notes : [];
  const mandatory = decision && decision.kind !== "none" && decision.kind === "mandatory";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-checker-title"
      dir="ltr"
      lang="en"
      data-update-checker-closing={closing ? "true" : "false"}
      className={`update-checker-backdrop fixed inset-0 z-[75] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm${closing ? " update-checker-backdrop-exit" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !mandatory && phase !== "downloading" && !closing) onClose();
      }}
    >
      <div className={`glass update-checker-panel w-full max-w-lg rounded-3xl border border-white/15 p-5 shadow-glow sm:p-6${closing ? " update-checker-panel-exit" : ""}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <RefreshCw className="h-5 w-5" />
            </span>
            <div>
              <h2 id="update-checker-title" className="font-display text-lg font-semibold">Check for Updates</h2>
              <p className="text-xs text-muted-foreground">Star-AI Desktop Update Center</p>
            </div>
          </div>
          {!mandatory && phase !== "downloading" && (
            <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-border/80 bg-background/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Installed Version</p>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {initial.status === "ready" ? initial.channel : "Desktop"}
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums" dir="ltr">
            {initial.status === "ready" ? initial.version : initial.status === "loading" ? "Loading…" : "—"}
          </p>
          <div className="mt-4 border-t border-border/70 pt-3">
            <p className="text-xs font-semibold">What's New in Your Installed Version</p>
            {initial.status === "loading" ? (
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading release notes…</p>
            ) : initial.status === "ready" && currentNotes.length ? (
              <ul className="mt-2 max-h-36 space-y-1.5 overflow-y-auto text-left text-xs text-muted-foreground">
                {currentNotes.map((note, index) => <li key={`${index}-${note}`} className="whitespace-pre-wrap">{note}</li>)}
              </ul>
            ) : initial.status === "ready" ? (
              <p className="mt-2 text-xs text-muted-foreground">Release notes for this installed version are not available in version history.</p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">{initial.message}</p>
            )}
          </div>
        </div>

        {phase === "checking" && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-border p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Checking
          </div>
        )}

        {phase === "up-to-date" && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> You're up to date. Star-AI {currentVersion} is the latest permitted version for your channel.
          </div>
        )}

        {phase === "found" && decision && decision.kind !== "none" && (
          <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" /> {decision.kind === "mandatory" ? "Mandatory Update" : decision.targetChannel === "beta" ? "New Beta Update" : "Update Available"}</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-muted-foreground">Current</p><p className="mt-1 font-semibold" dir="ltr">{decision.current}</p></div>
              <div><p className="text-muted-foreground">New version</p><p className="mt-1 font-semibold" dir="ltr">{decision.target}</p></div>
              <div><p className="text-muted-foreground">Channel</p><p className="mt-1 font-semibold">{decision.targetChannel}</p></div>
              <div><p className="text-muted-foreground">Update type</p><p className="mt-1 font-semibold">{decision.kind}</p></div>
            </div>
            {!!decision.notes.length && (
              <div className="mt-4 border-t border-border/70 pt-3">
                <p className="text-xs font-semibold">What's New in {decision.target}</p>
                <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-left text-xs text-muted-foreground">
                  {decision.notes.map((note, index) => <li key={`${index}-${note}`} className="whitespace-pre-wrap">{note}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {phase === "downloading" && (
          <div className="mt-5 rounded-2xl border border-border p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><Download className="h-4 w-4 animate-pulse text-primary" /> Downloading Update…</p>
            <p className="mt-1 text-xs text-muted-foreground" dir="ltr">Star-AI {decision && decision.kind !== "none" ? decision.target : ""}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-brand-gradient transition-all" style={{ width: `${progress?.percent ?? 0}%` }} /></div>
            <p className="mt-2 text-xs text-muted-foreground">{progress?.total ? `${progress.percent}% · ${mb(progress.received)} MB / ${mb(progress.total)} MB` : "Downloading…"}</p>
          </div>
        )}

        {phase === "error" && (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error || (initial.status === "error" ? initial.message : "Unable to check for updates.")}</span>
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {phase === "found" && decision && decision.kind !== "none" ? (
            <>
              <button onClick={() => void install()} className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-xs font-semibold text-primary-foreground"><Download className="h-4 w-4" /> Download & Install</button>
              {!mandatory && <button onClick={onClose} className="rounded-xl border border-border px-4 py-2.5 text-xs font-medium hover:bg-secondary">Later</button>}
            </>
          ) : phase === "downloading" ? null : (
            <>
              {!mandatory && <button onClick={onClose} className="rounded-xl border border-border px-4 py-2.5 text-xs font-medium hover:bg-secondary">Close</button>}
              <button onClick={() => void check()} disabled={phase === "checking" || initial.status === "loading" || initial.status === "unavailable"} className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                {phase === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {phase === "checking" ? "Checking" : phase === "up-to-date" || phase === "error" ? "Check Again" : "Check"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
