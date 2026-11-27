import { useEffect, useState } from "react";

import { VERSION_LIST } from "@/lib/ai/versions";
import { useI18n } from "@/lib/star/i18n";

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, dir } = useI18n();
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;
    const timer = window.setTimeout(() => setMounted(false), 220);
    return () => window.clearTimeout(timer);
  }, [open, mounted]);

  // Lock background scrolling while the dialog is open and close with Escape.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return (
    <div
      dir={dir}
      aria-hidden={!open}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm ${
        open ? "animate-in fade-in duration-200" : "pointer-events-none animate-out fade-out duration-200"
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="star-help-title"
        className={`glass flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl shadow-glow ${
          open ? "animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200" : "animate-out fade-out zoom-out-95 slide-out-to-bottom-2 duration-200"
        }`}
      >
        <div className="shrink-0 border-b border-border/60 px-6 pb-4 pt-5">
          <h2 id="star-help-title" className="font-display text-lg font-semibold">{t("Help")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("Star-AI includes multiple generations, including experimental Beta models. Switch anytime from the sidebar — the theme, animations and AI configuration all change with it.")}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 scrollbar-thin">
          <div className="space-y-4">
            {VERSION_LIST.map((v) => (
              <div key={v.id} className="rounded-2xl border border-border p-4">
                <p className="text-sm font-semibold text-brand-gradient">{v.name}</p>
                <p className="text-xs text-muted-foreground">{t(v.subtitle)}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {v.capabilities.map((c) => (
                    <span key={c} className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px]">
                      {t(c)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{t("Attachments")}</p>
            <p className="mt-1">
              {t("Images, PDFs and text-based files (TXT, MD, CSV, JSON) can be attached for analysis. Image generation is available from Star-AI 3.0, and downloadable DOCX, PPTX, PDF, XLSX, CSV and TXT creation is available from Star-AI 4.0 onward.")}
            </p>
          </div>
        </div>

        <div className="shrink-0 border-t border-border/60 bg-background/70 px-5 py-3 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-brand-gradient py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
