import {
  Bug,
  ChartNoAxesColumn,
  Code2,
  FileText,
  Languages,
  Orbit,
  PenLine,
  Sparkle,
  Brain,
  Wand2,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StarLogo } from "./StarLogo";
import { VERSIONS } from "@/lib/ai/versions";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useStar } from "@/lib/star/store";

const ICONS: Record<string, LucideIcon> = {
  sparkle: Sparkle,
  pen: PenLine,
  languages: Languages,
  code: Code2,
  brain: Brain,
  bug: Bug,
  chart: ChartNoAxesColumn,
  wand: Wand2,
  file: FileText,
  orbit: Orbit,
};

export function WelcomeScreen() {
  const { version, sendMessage } = useStar();
  const { displayName } = useAuth();
  const meta = VERSIONS[version];

  return (
    <div key={version} className="version-morph mx-auto w-full max-w-4xl px-4 py-10 sm:py-16">
      <div className="flex flex-col items-center text-center">
        <StarLogo className="h-14 w-14 text-primary drop-shadow-[0_0_18px_var(--glow)]" />
        {displayName ? (
          <div dir="rtl" className="mt-5">
            <p className="text-lg font-semibold sm:text-xl">سلام {displayName} 👋</p>
            <p className="mt-1 text-sm text-muted-foreground">امروز چطور می‌تونم کمکت کنم؟</p>
          </div>
        ) : (
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Welcome to Star-AI
          </p>
        )}
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
          <span className="text-brand-gradient">{meta.name}</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">{meta.subtitle}</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="glass rounded-full px-3 py-1 font-medium">{meta.badge}</span>
          {meta.advanced && (
            <span className="flex items-center gap-1 rounded-full bg-brand-gradient px-3 py-1 font-semibold text-primary-foreground shadow-glow">
              <Zap className="h-3 w-3" /> Advanced Mode
            </span>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {meta.cards.map((card) => {
          const Icon = ICONS[card.icon] ?? Sparkle;
          return (
            <button
              key={card.title}
              onClick={() => void sendMessage(card.prompt)}
              className="glass group rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{card.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {meta.examples.map((ex) => (
            <button
              key={ex}
              onClick={() => void sendMessage(ex)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-1.5">
        {meta.capabilities.map((c) => (
          <span
            key={c}
            className="rounded-full bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
