import {
  BookOpen,
  ChartNoAxesColumn,
  ChevronDown,
  Code2,
  PenLine,
  Search,
  Sigma,
  Sparkle,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AI_MODES, MODE_MAP } from "@/lib/ai/modes";
import { useStar } from "@/lib/star/store";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  sparkle: Sparkle,
  code: Code2,
  pen: PenLine,
  search: Search,
  sigma: Sigma,
  chart: ChartNoAxesColumn,
  wand: Wand2,
  book: BookOpen,
};

export function ModeSelector() {
  const { mode, setMode } = useStar();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = MODE_MAP[mode];
  const Icon = ICONS[current.icon] ?? Sparkle;

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-secondary"
      >
        <Icon className="h-3.5 w-3.5 text-accent" />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="listbox"
          className="glass absolute bottom-full left-0 z-30 mb-2 w-56 overflow-hidden rounded-2xl p-1 shadow-glow"
        >
          {AI_MODES.map((m) => {
            const MIcon = ICONS[m.icon] ?? Sparkle;
            return (
              <button
                key={m.id}
                role="option"
                aria-selected={m.id === mode}
                onClick={() => {
                  setMode(m.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-secondary",
                  m.id === mode && "bg-secondary",
                )}
              >
                <MIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="min-w-0">
                  <span className="block text-xs font-medium">{m.label}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">{m.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
