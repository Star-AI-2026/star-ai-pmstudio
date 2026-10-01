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

/** Use in any component: `const { featureAllowed } = useDesktopVersion()`. */
export const useDesktopVersion = () => useContext(VersionCtx);

type State =
  | { s: "checking" }
  | { s: "error" }
  | { s: "ready"; version: string | null; policy: VersionPolicy | null; decision: UpdateDecision | null };

const mb = (n: number) => (n / 1048576).toFixed(1);

/**
 * Only runs checks inside the Star-AI desktop app (window.starDesktop).
 * In a normal browser the website is always current, so it renders children directly.
 */
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
      setState({ s: "ready", version, policy, decision: evaluatePolicy(version, policy) });
    } catch {
      setState({ s: "error" });
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const startUpdate = async (policy: VersionPolicy, target: string) => {
    const bridge = getDesktopBridge();
    if (!bridge) return;
    if (!policy.setupDownloadUrl || !policy.setupFileName) {
      setDlError(true);
      return;
    }
    setDlError(false);
    setDownloading(true);
    setProgress({ received: 0, total: 0, percent: 0 });
    const off = bridge.onDownloadProgress(setProgress);
    const r = await bridge.downloadAndInstall({
      url: policy.setupDownloadUrl,
      fileName: policy.setupFileName,
      version: target,
    });
    off();
    if (!r.ok) {
      setDownloading(false);
      setDlError(true);
    }
  };

  if (state.s === "checking") {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (state.s === "error") {
    return (
      <Modal>
        <TriangleAlert className="mx-auto h-8 w-8 text-destructive" />
        <h2 className="mt-3 font-display text-lg font-semibold">بررسی نسخه Star-AI انجام نشد.</h2>
        <p className="mt-2 text-sm text-muted-foreground">لطفاً اتصال اینترنت خود را بررسی کنید.</p>
        <div className="mt-6 flex gap-2">
          <Primary onClick={() => void check()}>
            <RefreshCw className="h-4 w-4" /> تلاش مجدد
          </Primary>
          <Secondary onClick={() => window.close()}>خروج</Secondary>
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
  const showDialog = policy && decision && decision.kind !== "none" && (mandatory || !dismissed);

  return (
    <VersionCtx.Provider value={ctx}>
      {mandatory ? null : children}
      {showDialog && policy && decision.kind !== "none" && (
        <Modal>
          {downloading ? (
            <>
              <Download className="mx-auto h-8 w-8 animate-pulse text-primary" />
              <h2 className="mt-3 font-display text-lg font-semibold">در حال دانلود بروزرسانی...</h2>
              <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                Star-AI {decision.target}
              </p>
              <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-secondary" dir="ltr">
                <div
                  className="h-full bg-brand-gradient transition-all"
                  style={{ width: `${progress?.percent ?? 0}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground" dir="ltr">
                {progress?.percent ?? 0}%
                {progress && progress.total > 0
                  ? ` · ${mb(progress.received)} MB / ${mb(progress.total)} MB`
                  : ""}
              </p>
            </>
          ) : dlError ? (
            <>
              <TriangleAlert className="mx-auto h-8 w-8 text-destructive" />
              <h2 className="mt-3 font-display text-lg font-semibold">دانلود بروزرسانی انجام نشد.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.
              </p>
              <div className="mt-6 flex gap-2">
                <Primary onClick={() => void startUpdate(policy, decision.target)}>تلاش مجدد</Primary>
                <Secondary onClick={() => (mandatory ? setDlError(false) : setDismissed(true))}>
                  بستن
                </Secondary>
              </div>
            </>
          ) : (
            <>
              <Sparkles className="mx-auto h-8 w-8 text-primary" />
              <h2 className="mt-3 font-display text-lg font-semibold">
                {decision.kind === "mandatory"
                  ? "بروزرسانی Star-AI لازم است"
                  : decision.kind === "optional"
                    ? "نسخه جدید Star-AI منتشر شده است."
                    : "نسخه آزمایشی جدید Star-AI منتشر شده است."}
              </h2>
              {mandatory && (
                <p className="mt-2 text-sm text-muted-foreground">
                  برای استفاده از امکانات جدید Star-AI باید برنامه را به نسخه جدید بروزرسانی کنید.
                </p>
              )}
              <div className="mt-4 space-y-1 rounded-2xl border border-border p-3 text-right text-sm">
                <p>
                  نسخه فعلی: <span dir="ltr">{decision.current}</span>
                </p>
                <p>
                  {decision.kind === "beta" ? "نسخه" : "نسخه جدید"}:{" "}
                  <span dir="ltr" className="font-semibold">
                    {decision.target}
                  </span>
                </p>
              </div>
              {decision.notes.length > 0 && (
                <div className="mt-3 text-right text-sm">
                  <p className="font-medium">تغییرات:</p>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {decision.notes.map((n, i) => (
                      <li key={i}>• {n}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-6 flex gap-2">
                {decision.kind === "beta" ? (
                  <Primary
                    onClick={() => {
                      const b = getDesktopBridge();
                      if (b?.openExternal) void b.openExternal(policy.downloadUrl);
                      else window.open(policy.downloadUrl, "_blank", "noopener");
                    }}
                  >
                    مشاهده بروزرسانی
                  </Primary>
                ) : (
                  <Primary onClick={() => void startUpdate(policy, decision.target)}>
                    {mandatory ? "آپدیت Star-AI" : "آپدیت"}
                  </Primary>
                )}
                {!mandatory && <Secondary onClick={() => setDismissed(true)}>بعداً</Secondary>}
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
      dir="rtl"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
    >
      <div className="glass w-full max-w-sm rounded-3xl p-7 text-center shadow-glow">{children}</div>
    </div>
  );
}
function Primary(p: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={p.onClick}
      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-gradient py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
    >
      {p.children}
    </button>
  );
}
function Secondary(p: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={p.onClick}
      className="flex-1 rounded-2xl border border-border py-2.5 text-sm text-muted-foreground hover:bg-secondary"
    >
      {p.children}
    </button>
  );
}
