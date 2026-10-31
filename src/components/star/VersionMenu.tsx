import { Check, ChevronDown, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  VERSION_CATALOG,
  isRuntimeVersion,
  type VersionCatalogEntry,
} from "@/lib/ai/versions";
import { useStar } from "@/lib/star/store";
import { useI18n } from "@/lib/star/i18n";
import { cn } from "@/lib/utils";
import { LockedVersionDialog } from "./LockedVersionDialog";

export function VersionMenu() {
  const { version, setVersion } = useStar();
  const { t, dir } = useI18n();
  const [open, setOpen] = useState(false);
  const [locked, setLocked] = useState<VersionCatalogEntry | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = VERSION_CATALOG.find((item) => item.id === version) ?? VERSION_CATALOG[0];

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} dir={dir} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex max-w-[170px] items-center gap-1.5 rounded-full border border-border/80 bg-background/35 px-2.5 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-accent/50 hover:bg-secondary/80 active:scale-[0.96]"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/20"
          style={{ background: `linear-gradient(135deg, ${current.swatch[0]}, ${current.swatch[1]})` }}
        />
        <span className="truncate">{t(current.name)}</span>
        <ChevronDown className={cn("h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("Star-AI version")}
          className="glass absolute right-0 top-full z-50 mt-2 max-h-[min(65vh,390px)] w-[min(270px,calc(100vw-32px))] overflow-y-auto rounded-[1.35rem] border border-white/15 p-1.5 shadow-glow animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
        >
          <p className="px-2.5 pb-1 pt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("Available")}</p>
          {VERSION_CATALOG.filter((item) => item.enabled).map((item) => {
            const selected = item.id === version;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  if (isRuntimeVersion(item.id)) setVersion(item.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-start transition-all duration-200 hover:bg-secondary/80 active:scale-[0.99]",
                  selected && "bg-brand-gradient text-primary-foreground shadow-glow",
                )}
              >
                <span className="shrink-0">{item.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">{t(item.name)}</span>
                  <span className="block truncate text-[10px] opacity-70">{t(item.subtitle)}</span>
                </span>
                {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
          <p className="px-2.5 pb-1 pt-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("Coming soon")}</p>
          {VERSION_CATALOG.filter((item) => !item.enabled).map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => {
                setOpen(false);
                setLocked(item);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-start text-muted-foreground/85 transition-all duration-200 hover:bg-secondary/70 hover:text-foreground active:scale-[0.99]"
            >
              <span className="shrink-0">{item.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">{t(item.name)}</span>
                <span className="block truncate text-[10px] opacity-70">{t(item.subtitle)}</span>
              </span>
              <Lock className="h-3.5 w-3.5 shrink-0" />
            </button>
          ))}
        </div>
      )}
      <LockedVersionDialog version={locked} onClose={() => setLocked(null)} />
    </div>
  );
}
