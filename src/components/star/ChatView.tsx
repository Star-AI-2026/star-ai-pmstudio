import { Eraser, Menu, Zap } from "lucide-react";
import { useEffect, useRef } from "react";

import { Composer } from "./Composer";
import { MessageItem } from "./MessageItem";
import { StarLogo } from "./StarLogo";
import { WelcomeScreen } from "./WelcomeScreen";
import { VERSIONS } from "@/lib/ai/versions";
import { useStar } from "@/lib/star/store";

export function ChatView({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { active, version, stream, regenerate, editMessage, clearConversation } = useStar();
  const meta = VERSIONS[version];
  const bottomRef = useRef<HTMLDivElement>(null);

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
          <p className="truncate text-[11px] text-muted-foreground">{meta.subtitle}</p>
        </div>
        {meta.advanced && (
          <span className="ml-2 hidden items-center gap-1 rounded-full bg-brand-gradient px-2.5 py-1 text-[11px] font-semibold text-primary-foreground sm:flex">
            <Zap className="h-3 w-3" /> Advanced Mode
          </span>
        )}
        {active && active.messages.length > 0 && (
          <button
            onClick={() => clearConversation(active.id)}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Eraser className="h-3 w-3" /> Clear
          </button>
        )}
      </header>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {!active || active.messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
            {active.messages.map((m, i) => (
              <MessageItem
                key={m.id}
                message={m}
                streaming={stream.busy && i === active.messages.length - 1}
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
