import { Lock } from "lucide-react";

import type { VersionCatalogEntry } from "@/lib/ai/versions";

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
  if (!version) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${version.name} locked`}
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
          این نسخه قفل است
        </h2>

        <p dir="rtl" className="mt-3 text-sm leading-7 text-muted-foreground">
          {version.name} در حال حاضر قفل است و در آپدیت‌های جدید Star-AI در دسترس قرار خواهد گرفت.
        </p>

        <button
          onClick={onClose}
          autoFocus
          className="mt-6 w-full rounded-2xl bg-brand-gradient py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          خروج
        </button>
      </div>
    </div>
  );
}
