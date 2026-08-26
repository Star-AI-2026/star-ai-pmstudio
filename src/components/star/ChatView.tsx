import { Download, Eraser, Menu, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Composer } from "./Composer";
import { MessageItem } from "./MessageItem";
import { StarLogo } from "./StarLogo";
import { WelcomeScreen } from "./WelcomeScreen";
import { MODE_MAP } from "@/lib/ai/modes";
import { VERSIONS } from "@/lib/ai/versions";
import { exportConversation } from "@/lib/star/export";
import { useStar } from "@/lib/star/store";

export function ChatView({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { active, version, stream, settings, regenerate, editMessage, clearConversation } =
    useStar();
  const meta = VERSIONS[version];
  const bottomRef = useRef<HTMLDivElement>(null);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active?.messages.length, active?.messages[active.messages.length - 1]?.content]);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-2 px-3 py-3 sm:px-5">
        <button
          onClick={onOpenSidebar}
          className="glass rounded-xl p-2 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <StarLogo className="hidden h-6 w-6 text-primary md:block" animated={false} />
        <div className="min-w-0">
          <h1 className="truncate font-display text-sm font-semibold">
            {active?.title ?? meta.name}
          </h1>
          <p className="truncate text-[11px] text-muted-foreground">
            {stream.busy && stream.status ? stream.status : meta.subtitle}
            {" · "}
            {MODE_MAP[settings.mode].label} mode
          </p>
        </div>
        {meta.advanced && (
          <span className="ml-2 hidden items-center gap-1 rounded-full bg-brand-gradient px-2.5 py-1 text-[11px] font-semibold text-primary-foreground sm:flex">
            <Zap className="h-3 w-3" /> Advanced Mode
          </span>
        )}

        {active && active.messages.length > 0 && (
          <div className="relative ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setExportOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={exportOpen}
              className="flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Download className="h-3 w-3" /> Export
            </button>
            {exportOpen && (
              <div
                role="menu"
                className="glass absolute right-0 top-full z-30 mt-2 w-40 rounded-2xl p-1 text-xs shadow-glow"
                onMouseLeave={() => setExportOpen(false)}
              >
                {(["md", "txt", "json", "pdf"] as const).map((f) => (
                  <button
                    key={f}
                    role="menuitem"
                    onClick={() => {
                      exportConversation(active, f);
                      setExportOpen(false);
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left hover:bg-secondary"
                  >
                    {f === "md"
                      ? "Markdown (.md)"
                      : f === "txt"
                        ? "Plain text (.txt)"
                        : f === "json"
                          ? "JSON (.json)"
                          : "PDF / print"}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => clearConversation(active.id)}
              className="flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Eraser className="h-3 w-3" /> Clear
            </button>
          </div>
        )}
      </header>

      <div className="scrollbar-thin flex-1 overflow-y-auto" role="log" aria-live="polite">
        {!active || active.messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
            {active.messages.map((m, i) => (
              <MessageItem
                key={m.id}
                message={m}
                streaming={stream.busy && i === active.messages.length - 1}
                autoSpeak={settings.autoSpeak}
                onRegenerate={() => void regenerate()}
                onEdit={(text) => void editMessage(m.id, text)}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <Composer />
    </div>
  );
}
