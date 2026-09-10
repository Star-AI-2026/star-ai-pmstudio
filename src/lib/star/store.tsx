import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { AIMode } from "@/lib/ai/modes";
import { useAuth } from "@/lib/auth/AuthProvider";
import { VERSION_CATALOG, type StarVersion } from "@/lib/ai/versions";
import {
  DEFAULT_SETTINGS,
  type Attachment,
  type Conversation,
  type Folder,
  type Memory,
  type Message,
  type Settings,
  type Source,
} from "./types";

const KEY = "star-ai:state:v1";

type Persisted = {
  settings: Settings;
  conversations: Conversation[];
  memories: Memory[];
  folders: Folder[];
};

/** Local auto-title: first meaningful sentence of the opening question. */
export function autoTitle(text: string, fallback = "New chat") {
  const clean = text.replace(/\s+/g, " ").replace(/^[^\w]+/, "").trim();
  if (!clean) return fallback;
  const sentence = clean.split(/(?<=[.!?])\s/)[0] ?? clean;
  const words = sentence.split(" ").slice(0, 8).join(" ");
  const title = words.length > 52 ? `${words.slice(0, 52)}…` : words;
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function load(): Persisted {
  if (typeof window === "undefined")
    return { settings: DEFAULT_SETTINGS, conversations: [], memories: [], folders: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      conversations: parsed.conversations ?? [],
      memories: parsed.memories ?? [],
      folders: parsed.folders ?? [],
    };
  } catch {
    return { settings: DEFAULT_SETTINGS, conversations: [], memories: [], folders: [] };
  }
}

type StreamState = {
  conversationId: string | null;
  busy: boolean;
  status?: string | undefined;
};

type StarContextValue = {
  hydrated: boolean;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  version: StarVersion;
  setVersion: (v: StarVersion) => void;
  switching: boolean;

  conversations: Conversation[];
  activeId: string | null;
  active: Conversation | null;
  setActiveId: (id: string | null) => void;
  newConversation: () => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  togglePin: (id: string) => void;
  clearConversation: (id: string) => void;
  moveConversation: (id: string, folderId: string | null) => void;

  folders: Folder[];
  createFolder: (name: string) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;

  mode: AIMode;
  setMode: (m: AIMode) => void;
  webSearch: boolean;
  setWebSearch: (v: boolean) => void;

  memories: Memory[];
  addMemory: (text: string) => void;
  deleteMemory: (id: string) => void;
  clearMemories: () => void;

  stream: StreamState;
  sendMessage: (text: string, attachments?: Attachment[]) => Promise<void>;
  regenerate: () => Promise<void>;
  editMessage: (messageId: string, text: string) => Promise<void>;
  stopGenerating: () => void;
};

const StarContext = createContext<StarContextValue | null>(null);

export function useStar() {
  const ctx = useContext(StarContext);
  if (!ctx) throw new Error("useStar must be used inside <StarProvider>");
  return ctx;
}

export function StarProvider({ children }: { children: ReactNode }) {
  const { displayName } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const [stream, setStream] = useState<StreamState>({ conversationId: null, busy: false });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const data = load();
    setSettings({ ...data.settings, version: data.settings.defaultVersion ?? data.settings.version });
    setConversations(data.conversations);
    setMemories(data.memories);
    setFolders(data.folders);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ settings, conversations, memories, folders }));
    } catch {
      /* storage full or unavailable */
    }
  }, [hydrated, settings, conversations, memories, folders]);

  // Theme attributes drive the version-specific design tokens in styles.css
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.dataset["starVersion"] = settings.version === "3.0" ? "3" : "2";
    root.dataset["starVersionTheme"] =
      VERSION_CATALOG.find((v) => v.id === settings.version)?.theme ?? "tech-blue";
    root.dataset["starAnim"] = settings.animations ? "on" : "off";
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = settings.colorMode === "dark" || (settings.colorMode === "system" && prefersDark);
    root.classList.toggle("dark", dark);
    root.style.setProperty("--bg-intensity", String(settings.backgroundIntensity / 100));
  }, [settings.version, settings.colorMode, settings.animations, settings.backgroundIntensity]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const setVersion = useCallback(
    (v: StarVersion) => {
      setSettings((s) => (s.version === v ? s : { ...s, version: v }));
      setSwitching(true);
      window.setTimeout(() => setSwitching(false), 900);
    },
    [],
  );

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const newConversation = useCallback(() => setActiveId(null), []);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((cs) =>
      cs.map((c) => (c.id === id ? { ...c, title: title.trim() || c.title, updatedAt: Date.now() } : c)),
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((cs) => cs.filter((c) => c.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  const togglePin = useCallback((id: string) => {
    setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  }, []);

  const clearConversation = useCallback((id: string) => {
    setConversations((cs) =>
      cs.map((c) => (c.id === id ? { ...c, messages: [], updatedAt: Date.now() } : c)),
    );
  }, []);

  const moveConversation = useCallback((id: string, folderId: string | null) => {
    setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, folderId } : c)));
  }, []);

  const createFolder = useCallback((name: string) => {
    const n = name.trim();
    if (!n) return;
    setFolders((f) => [...f, { id: uid(), name: n, createdAt: Date.now() }]);
  }, []);
  const renameFolder = useCallback((id: string, name: string) => {
    setFolders((f) => f.map((x) => (x.id === id ? { ...x, name: name.trim() || x.name } : x)));
  }, []);
  const deleteFolder = useCallback((id: string) => {
    setFolders((f) => f.filter((x) => x.id !== id));
    setConversations((cs) => cs.map((c) => (c.folderId === id ? { ...c, folderId: null } : c)));
  }, []);

  const setMode = useCallback((m: AIMode) => setSettings((s) => ({ ...s, mode: m })), []);
  const setWebSearch = useCallback((v: boolean) => setSettings((s) => ({ ...s, webSearch: v })), []);

  const addMemory = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setMemories((m) => [{ id: uid(), text: t, createdAt: Date.now() }, ...m]);
  }, []);
  const deleteMemory = useCallback((id: string) => {
    setMemories((m) => m.filter((x) => x.id !== id));
  }, []);
  const clearMemories = useCallback(() => setMemories([]), []);

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStream({ conversationId: null, busy: false });
  }, []);

  /** Core generation loop: posts history to the secure backend and streams back. */
  const run = useCallback(
    async (conversationId: string, history: Message[], version: StarVersion) => {
      const assistantId = uid();
      const controller = new AbortController();
      abortRef.current = controller;
      setStream({ conversationId, busy: true });

      setConversations((cs) =>
        cs.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: [
                  ...c.messages,
                  {
                    id: assistantId,
                    role: "assistant" as const,
                    content: "",
                    createdAt: Date.now(),
                    version,
                  },
                ],
              }
            : c,
        ),
      );

      const patch = (fn: (m: Message) => Message) =>
        setConversations((cs) =>
          cs.map((c) =>
            c.id === conversationId
              ? { ...c, messages: c.messages.map((m) => (m.id === assistantId ? fn(m) : m)) }
              : c,
          ),
        );

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            version,
            style: settings.style,
            mode: settings.mode,
            webSearch: settings.webSearch,
            ...(settings.assistantName ? { assistantName: settings.assistantName } : {}),
            ...(displayName ? { userName: displayName } : {}),
            ...(settings.language && settings.language !== "auto"
              ? { language: settings.language }
              : {}),
            memories: settings.memoryEnabled ? memories.map((m) => m.text) : [],
            messages: history.map((m) => ({
              role: m.role,
              content: m.content,
              attachments: (m.attachments ?? [])
                .filter((a) => !a.unsupported)
                .map((a) => ({
                  name: a.name,
                  mimeType: a.mimeType,
                  ...(a.dataUrl ? { dataUrl: a.dataUrl } : {}),
                  ...(a.text ? { text: a.text } : {}),
                })),
            })),
          }),
        });

        if (!res.ok || !res.body) {
          let msg = "Star-AI is temporarily unavailable. Please try again.";
          try {
            const j = (await res.json()) as { error?: string };
            if (j.error) msg = j.error;
          } catch {
            /* ignore */
          }
          patch((m) => ({ ...m, error: msg }));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const l of lines) {
            if (!l.trim()) continue;
            let evt: { type: string; value?: string; sources?: Source[] };
            try {
              evt = JSON.parse(l);
            } catch {
              continue;
            }
            if (evt.type === "text") patch((m) => ({ ...m, content: m.content + (evt.value ?? "") }));
            else if (evt.type === "reasoning")
              patch((m) => ({ ...m, reasoning: (m.reasoning ?? "") + (evt.value ?? "") }));
            else if (evt.type === "sources")
              patch((m) => ({ ...m, sources: evt.sources ?? [] }));
            else if (evt.type === "notice") patch((m) => ({ ...m, notice: evt.value ?? "" }));
            else if (evt.type === "status")
              setStream((s) => ({ ...s, status: evt.value ?? "" }));
            else if (evt.type === "error") patch((m) => ({ ...m, error: evt.value ?? "Something went wrong. Please try again." }));
          }
        }
        patch((m) =>
          m.content.trim() || m.error
            ? m
            : { ...m, error: "Star-AI didn't return a response. Please try again." },
        );
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          patch((m) => ({ ...m, error: "Something went wrong. Please try again." }));
        }
      } finally {
        abortRef.current = null;
        setStream({ conversationId: null, busy: false });
      }
    },
    [
      displayName,
      memories,
      settings.memoryEnabled,
      settings.style,
      settings.mode,
      settings.webSearch,
      settings.assistantName,
      settings.language,
    ],
  );

  const sendMessage = useCallback(
    async (text: string, attachments?: Attachment[]) => {
      const trimmed = text.trim();
      if (!trimmed && !attachments?.length) return;
      const version = settings.version;
      const userMessage: Message = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
        version,
        ...(attachments?.length ? { attachments } : {}),
      };

      let conversationId = activeId;
      let history: Message[] = [];

      if (!conversationId) {
        conversationId = uid();
        const convo: Conversation = {
          id: conversationId,
          title: autoTitle(trimmed, attachments?.[0]?.name ?? "New chat"),
          version,
          mode: settings.version === "3.0" ? settings.mode : settings.mode,
          folderId: null,
          autoTitled: true,
          pinned: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [userMessage],
        };
        history = [userMessage];
        setConversations((cs) => [convo, ...cs]);
        setActiveId(conversationId);
      } else {
        const current = conversations.find((c) => c.id === conversationId);
        history = [...(current?.messages ?? []), userMessage];
        setConversations((cs) =>
          cs.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [...c.messages, userMessage], updatedAt: Date.now() }
              : c,
          ),
        );
      }

      await run(conversationId, history, version);
    },
    [activeId, conversations, run, settings.version, settings.mode],
  );

  const regenerate = useCallback(async () => {
    if (!activeId) return;
    const convo = conversations.find((c) => c.id === activeId);
    if (!convo) return;
    const msgs = [...convo.messages];
    while (msgs.length && msgs[msgs.length - 1]!.role === "assistant") msgs.pop();
    if (!msgs.length) return;
    setConversations((cs) => cs.map((c) => (c.id === activeId ? { ...c, messages: msgs } : c)));
    await run(activeId, msgs, settings.version);
  }, [activeId, conversations, run, settings.version]);

  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      if (!activeId) return;
      const convo = conversations.find((c) => c.id === activeId);
      if (!convo) return;
      const idx = convo.messages.findIndex((m) => m.id === messageId);
      if (idx === -1) return;
      const msgs = convo.messages.slice(0, idx + 1);
      msgs[idx] = { ...msgs[idx]!, content: text };
      setConversations((cs) => cs.map((c) => (c.id === activeId ? { ...c, messages: msgs } : c)));
      await run(activeId, msgs, settings.version);
    },
    [activeId, conversations, run, settings.version],
  );

  const value: StarContextValue = {
    hydrated,
    settings,
    updateSettings,
    version: settings.version,
    setVersion,
    switching,
    conversations,
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveConversation,
    mode: settings.mode,
    setMode,
    webSearch: settings.webSearch,
    setWebSearch,
    activeId,
    active,
    setActiveId,
    newConversation,
    renameConversation,
    deleteConversation,
    togglePin,
    clearConversation,
    memories,
    addMemory,
    deleteMemory,
    clearMemories,
    stream,
    sendMessage,
    regenerate,
    editMessage,
    stopGenerating,
  };

  return <StarContext.Provider value={value}>{children}</StarContext.Provider>;
}
