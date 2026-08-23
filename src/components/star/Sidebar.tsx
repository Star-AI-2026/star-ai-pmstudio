import {
  CircleHelp,
  MessageSquarePlus,
  Pencil,
  Pin,
  PinOff,
  Search,
  Settings,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { StarLogo } from "./StarLogo";
import { VersionSwitcher } from "./VersionSwitcher";
import { useStar } from "@/lib/star/store";
import { cn } from "@/lib/utils";

function relative(ts: number) {
  const d = Date.now() - ts;
  if (d < 60_000) return "just now";
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export function Sidebar({
  onOpenSettings,
  onOpenHelp,
  onClose,
}: {
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onClose?: () => void;
}) {
  const {
    conversations,
    activeId,
    setActiveId,
    newConversation,
    renameConversation,
    deleteConversation,
    togglePin,
  } = useStar();
  const [query, setQuery] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations
      .filter(
        (c) =>
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.content.toLowerCase().includes(q)),
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [conversations, query]);

  return (
    <aside className="glass flex h-full w-72 flex-col rounded-none border-y-0 border-l-0 bg-sidebar text-sidebar-foreground md:rounded-r-3xl">
      <div className="flex items-center gap-2 px-4 pt-4">
        <StarLogo className="h-8 w-8 text-primary" />
        <div className="leading-tight">
          <p className="font-display text-base font-semibold">Star-AI</p>
          <p className="text-[11px] text-muted-foreground">AI platform</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1 text-muted-foreground md:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-3 pt-4">
        <VersionSwitcher />
      </div>

      <div className="px-3 pt-3">
        <button
          onClick={() => {
            newConversation();
            onClose?.();
          }}
          className="flex w-full items-center gap-2 rounded-2xl bg-brand-gradient px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
        >
          <MessageSquarePlus className="h-4 w-4" /> New chat
        </button>
      </div>

      <div className="px-3 pt-3">
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="scrollbar-thin mt-3 flex-1 overflow-y-auto px-2 pb-2">
        {list.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No conversations yet.
          </p>
        ) : (
          list.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group mb-1 rounded-xl px-2.5 py-2 transition-colors",
                activeId === c.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60",
              )}
            >
              {renaming === c.id ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => {
                    renameConversation(c.id, draft);
                    setRenaming(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      renameConversation(c.id, draft);
                      setRenaming(null);
                    }
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  className="w-full rounded-md bg-background/60 px-2 py-1 text-xs outline-none"
                />
              ) : (
                <button
                  onClick={() => {
                    setActiveId(c.id);
                    onClose?.();
                  }}
                  className="block w-full text-left"
                >
                  <span className="flex items-center gap-1.5">
                    {c.pinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
                    <span className="truncate text-xs font-medium">{c.title}</span>
                  </span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">
                    Star-AI {c.version} · {relative(c.updatedAt)}
                  </span>
                </button>
              )}

              <div className="mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => togglePin(c.id)}
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={c.pinned ? "Unpin" : "Pin"}
                >
                  {c.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </button>
                <button
                  onClick={() => {
                    setRenaming(c.id);
                    setDraft(c.title);
                  }}
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Rename"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => deleteConversation(c.id)}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <Settings className="h-3.5 w-3.5" /> Settings
        </button>
        <button
          onClick={onOpenHelp}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <CircleHelp className="h-3.5 w-3.5" /> Help
        </button>
        <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-[11px] font-semibold text-primary-foreground">
            <User className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-medium">Guest</p>
            <p className="text-[10px] text-muted-foreground">Local workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
