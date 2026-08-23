import { Check, Zap } from "lucide-react";

import { VERSION_LIST } from "@/lib/ai/versions";
import { useStar } from "@/lib/star/store";
import { cn } from "@/lib/utils";

export function VersionSwitcher({ compact = false }: { compact?: boolean }) {
  const { version, setVersion } = useStar();

  return (
    <div
      className={cn(
        "glass relative flex gap-1 rounded-2xl p-1",
        compact ? "text-xs" : "text-sm",
      )}
      role="radiogroup"
      aria-label="Star-AI version"
    >
      {VERSION_LIST.map((v) => {
        const activeVersion = v.id === version;
        return (
          <button
            key={v.id}
            role="radio"
            aria-checked={activeVersion}
            onClick={() => setVersion(v.id)}
            className={cn(
              "relative flex-1 rounded-xl px-3 py-2 text-left transition-all duration-500",
              activeVersion
                ? "bg-brand-gradient text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-1.5 font-semibold">
              {v.advanced ? <Zap className="h-3.5 w-3.5" /> : null}
              {v.name}
              {activeVersion && <Check className="ml-auto h-3.5 w-3.5" />}
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
          </button>
        );
      })}
    </div>
  );
}
