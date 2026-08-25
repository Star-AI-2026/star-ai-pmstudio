import type { AIMode } from "@/lib/ai/modes";
import type { ResponseStyle, StarVersion } from "@/lib/ai/versions";

export type Attachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl?: string;
  text?: string;
  unsupported?: boolean;
  /** Short human summary shown in the UI, e.g. "12 columns · 480 rows". */
  summary?: string;
  kind?: "image" | "pdf" | "document" | "data" | "text" | "other";
};

export type Source = {
  title: string;
  url: string;
  domain: string;
  snippet: string;
};

export type ChatRole = "user" | "assistant";

export type Message = {
  id: string;
  role: ChatRole;
  content: string;
  reasoning?: string;
  createdAt: number;
  version: StarVersion;
  mode?: AIMode;
  attachments?: Attachment[];
  sources?: Source[];
  notice?: string;
  error?: string;
};

export type Folder = { id: string; name: string; createdAt: number };

export type Conversation = {
  id: string;
  title: string;
  version: StarVersion;
  mode?: AIMode;
  folderId?: string | null;
  pinned: boolean;
  autoTitled?: boolean;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};

export type Memory = { id: string; text: string; createdAt: number };

export type SortMode = "recent" | "oldest" | "alpha";

export type Settings = {
  version: StarVersion;
  defaultVersion: StarVersion;
  style: ResponseStyle;
  mode: AIMode;
  assistantName: string;
  language: string;
  webSearch: boolean;
  colorMode: "dark" | "light" | "system";
  animations: boolean;
  particles: boolean;
  backgroundIntensity: number;
  streaming: boolean;
  memoryEnabled: boolean;
  notifications: boolean;
  autoSpeak: boolean;
  sort: SortMode;
};

export const DEFAULT_SETTINGS: Settings = {
  version: "3.0",
  defaultVersion: "3.0",
  style: "balanced",
  mode: "general",
  assistantName: "",
  language: "auto",
  webSearch: false,
  colorMode: "dark",
  animations: true,
  particles: true,
  backgroundIntensity: 70,
  streaming: true,
  memoryEnabled: true,
  notifications: false,
  autoSpeak: false,
  sort: "recent",
};
