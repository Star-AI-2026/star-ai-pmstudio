import { Lock } from "lucide-react";

import type { VersionCatalogEntry } from "@/lib/ai/versions";
import { useI18n } from "@/lib/star/i18n";

/**
 * Locked-version screen. Purely presentational — it never activates a
 * version and never triggers an AI request.
 */
export function LockedVersionDialog({
  version,
  onClose,
}: {
  version: VersionCatalogEntry | null;
  onClose: () => void;
}) {
  const { t, dir } = useI18n();
  if (!version) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir={dir}
      aria-label={`${t(version.name)} ${t("locked")} `}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-sm rounded-3xl p-7 text-center shadow-glow"
      >
        <span
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border"
          style={{
            background: `radial-gradient(circle, color-mix(in oklab, ${version.swatch[0]} 35%, transparent), transparent 70%)`,
          }}
        >
          <Lock className="h-7 w-7 text-primary" />
        </span>

        <p className="mt-4 text-2xl" aria-hidden>
          🔒
        </p>

        <h2 dir="rtl" className="mt-2 font-display text-lg font-semibold">
          {t("This version is locked")}
        </h2>

        <p dir="rtl" className="mt-3 text-sm leading-7 text-muted-foreground">
          {t(version.name)} {t("is currently locked and will become available in future Star-AI updates.")}
        </p>

        <button
          onClick={onClose}
          autoFocus
          className="mt-6 w-full rounded-2xl bg-brand-gradient py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          {t("Close")}
        </button>
      </div>
    </div>
  );
}
