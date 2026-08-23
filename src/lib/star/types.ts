import type { ResponseStyle, StarVersion } from "@/lib/ai/versions";

export type Attachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl?: string;
  text?: string;
  unsupported?: boolean;
};

export type ChatRole = "user" | "assistant";

export type Message = {
  id: string;
  role: ChatRole;
  content: string;
  reasoning?: string;
  createdAt: number;
  version: StarVersion;
  attachments?: Attachment[];
  error?: string;
};

export type Conversation = {
  id: string;
  title: string;
  version: StarVersion;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};

export type Memory = { id: string; text: string; createdAt: number };

export type Settings = {
  version: StarVersion;
  defaultVersion: StarVersion;
  style: ResponseStyle;
  colorMode: "dark" | "light" | "system";
  animations: boolean;
  particles: boolean;
  backgroundIntensity: number;
  streaming: boolean;
  memoryEnabled: boolean;
  notifications: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  version: "3.0",
  defaultVersion: "3.0",
  style: "balanced",
  colorMode: "dark",
  animations: true,
  particles: true,
  backgroundIntensity: 70,
  streaming: true,
  memoryEnabled: true,
  notifications: false,
};
