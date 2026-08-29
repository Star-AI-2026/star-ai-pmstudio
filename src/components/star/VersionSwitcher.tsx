import { Check, Lock, Zap } from "lucide-react";
import { useState } from "react";

import {
  LOCKED_VERSIONS,
  UNLOCKED_VERSIONS,
  isRuntimeVersion,
  type VersionCatalogEntry,
} from "@/lib/ai/versions";
import { useStar } from "@/lib/star/store";
import { cn } from "@/lib/utils";

import { LockedVersionDialog } from "./LockedVersionDialog";

function Swatch({ colors }: { colors: [string, string] }) {
  return (
    <span
      className="h-3 w-3 shrink-0 rounded-full border border-white/20"
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
      aria-hidden
    />
  );
}

export function VersionSwitcher({ compact = false }: { compact?: boolean }) {
  const { version, setVersion } = useStar();
  const [locked, setLocked] = useState<VersionCatalogEntry | null>(null);

  return (
    <div className={cn("glass rounded-2xl p-2", compact ? "text-xs" : "text-sm")}>
      <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Available
      </p>
      <div role="radiogroup" aria-label="Star-AI version" className="flex flex-col gap-1">
        {UNLOCKED_VERSIONS.map((v) => {
          const activeVersion = v.id === version;
          return (
            <button
              key={v.id}
              role="radio"
              aria-checked={activeVersion}
              onClick={() => {
                if (isRuntimeVersion(v.id)) setVersion(v.id);
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-all duration-500",
                activeVersion
                  ? "bg-brand-gradient text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <span aria-hidden>{v.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 font-semibold">
                  {v.id === "3.0" ? <Zap className="h-3.5 w-3.5" /> : null}
                  {v.name}
                </span>
                {!compact && (
                  <span
                    className={cn(
                      "mt-0.5 block text-[11px] leading-tight",
                      activeVersion ? "opacity-80" : "opacity-70",
                    )}
                  >
                    {v.subtitle}
                  </span>
                )}
              </span>
              {activeVersion && <Check className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      {LOCKED_VERSIONS.length > 0 && (
        <>
          <p className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Coming soon
          </p>
          <div className="flex flex-col gap-1">
            {LOCKED_VERSIONS.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-disabled
                aria-label={`${v.name} — locked`}
                onClick={() => setLocked(v)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-muted-foreground/80 transition-colors hover:bg-secondary/70 hover:text-foreground"
              >
                <Swatch colors={v.swatch} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {v.emoji} {v.name}
                  </span>
                  {!compact && (
                    <span className="block truncate text-[11px] leading-tight opacity-70">
                      {v.subtitle}
                    </span>
                  )}
                </span>
                <Lock className="h-3.5 w-3.5 shrink-0" />
              </button>
            ))}
          </div>
        </>
      )}

      <LockedVersionDialog version={locked} onClose={() => setLocked(null)} />
    </div>
  );
}
