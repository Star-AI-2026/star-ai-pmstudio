import {
  ArrowDownWideNarrow,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FolderPlus,
  FolderClosed,
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
import type { Conversation, SortMode } from "@/lib/star/types";
import { cn } from "@/lib/utils";

function relative(ts: number) {
  const d = Date.now() - ts;
  if (d < 60_000) return "just now";
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

const SORTS: { id: SortMode; label: string }[] = [
  { id: "recent", label: "Most recent" },
  { id: "oldest", label: "Oldest first" },
  { id: "alpha", label: "A → Z" },
];

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
    folders,
    createFolder,
    deleteFolder,
    moveConversation,
    settings,
    updateSettings,
  } = useStar();
  const [query, setQuery] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = conversations
      .filter(
        (c) =>
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.content.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
        if (settings.sort === "alpha") return a.title.localeCompare(b.title);
        if (settings.sort === "oldest") return a.updatedAt - b.updatedAt;
        return b.updatedAt - a.updatedAt;
      });
    return sorted;
  }, [conversations, query, settings.sort]);

  const groups = useMemo(() => {
    const byFolder = new Map<string, Conversation[]>();
    for (const c of list) {
      const key = c.folderId ?? "__none";
      const arr = byFolder.get(key) ?? [];
      arr.push(c);
      byFolder.set(key, arr);
    }
    return byFolder;
  }, [list]);

  const row = (c: Conversation) => (
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
          aria-label="Rename conversation"
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
            Star-AI {c.version} · {c.messages.length} msg · {relative(c.updatedAt)}
          </span>
        </button>
      )}

      <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
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
        {folders.length > 0 && (
          <select
            value={c.folderId ?? ""}
            onChange={(e) => moveConversation(c.id, e.target.value || null)}
            aria-label="Move to folder"
            className="ml-auto max-w-24 truncate rounded bg-transparent text-[10px] text-muted-foreground outline-none"
          >
            <option value="">No folder</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );

  return (
    <aside className="glass flex h-full w-72 flex-col rounded-none border-y-0 border-l-0 bg-sidebar text-sidebar-foreground md:rounded-r-3xl">
      <div className="flex items-center gap-2 px-4 pt-4">
        <StarLogo className="h-8 w-8 text-primary" />
        <div className="leading-tight">
          <p className="font-display text-base font-semibold">Star-AI</p>
          <p className="text-[11px] text-muted-foreground">AI platform</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1 text-muted-foreground md:hidden" aria-label="Close menu">
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
            aria-label="Search conversations"
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 pt-2">
        <ArrowDownWideNarrow className="h-3 w-3 text-muted-foreground" />
        <select
          value={settings.sort}
          onChange={(e) => updateSettings({ sort: e.target.value as SortMode })}
          aria-label="Sort conversations"
          className="flex-1 bg-transparent text-[11px] text-muted-foreground outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            const name = window.prompt("Folder name");
            if (name) createFolder(name);
          }}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="New folder"
        >
          <FolderPlus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="scrollbar-thin mt-2 flex-1 overflow-y-auto px-2 pb-2">
        {list.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            {query ? "No conversations match your search." : "No conversations yet."}
          </p>
        ) : (
          <>
            {folders.map((f) => {
              const items = groups.get(f.id) ?? [];
              const isCollapsed = collapsed[f.id];
              return (
                <div key={f.id} className="mb-1">
                  <div className="flex items-center gap-1 px-1.5 py-1">
                    <button
                      onClick={() => setCollapsed((c) => ({ ...c, [f.id]: !c[f.id] }))}
                      className="flex flex-1 items-center gap-1.5 text-left text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                      aria-expanded={!isCollapsed}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      <FolderClosed className="h-3 w-3" />
                      <span className="truncate">{f.name}</span>
                      <span className="text-[10px] opacity-70">{items.length}</span>
                    </button>
                    <button
                      onClick={() => deleteFolder(f.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      aria-label={`Delete folder ${f.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {!isCollapsed &&
                    (items.length ? (
                      items.map(row)
                    ) : (
                      <p className="px-3 py-1 text-[10px] text-muted-foreground">Empty folder</p>
                    ))}
                </div>
              );
            })}

            {(groups.get("__none") ?? []).map(row)}
          </>
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
