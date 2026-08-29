/**
 * Client-safe metadata for the two Star-AI generations.
 * No secrets, no model ids — the backend alone decides which model runs.
 */

export type StarVersion = "2.0" | "3.0";

export type ResponseStyle =
  | "balanced"
  | "creative"
  | "precise"
  | "friendly"
  | "professional"
  | "short"
  | "detailed";

export const RESPONSE_STYLES: { id: ResponseStyle; label: string; hint: string }[] = [
  { id: "balanced", label: "Balanced", hint: "Clear, neutral, well-rounded" },
  { id: "creative", label: "Creative", hint: "Imaginative and expressive" },
  { id: "precise", label: "Precise", hint: "Exact, minimal speculation" },
  { id: "friendly", label: "Friendly", hint: "Warm and conversational" },
  { id: "professional", label: "Professional", hint: "Formal business tone" },
  { id: "short", label: "Short", hint: "Tight, to the point" },
  { id: "detailed", label: "Detailed", hint: "Thorough and structured" },
];

export type CapabilityCard = {
  title: string;
  description: string;
  icon: string;
  prompt: string;
};

export type VersionMeta = {
  id: StarVersion;
  name: string;
  badge: string;
  subtitle: string;
  tagline: string;
  advanced: boolean;
  capabilities: string[];
  cards: CapabilityCard[];
  examples: string[];
  supportsImages: boolean;
  supportsFiles: boolean;
};

export const VERSIONS: Record<StarVersion, VersionMeta> = {
  "2.0": {
    id: "2.0",
    name: "Star-AI 2.0",
    badge: "Star-AI 2.0",
    subtitle: "Smart AI for everyday tasks",
    tagline: "Fast, simple and reliable",
    advanced: false,
    capabilities: [
      "General conversation",
      "Question answering",
      "Text generation",
      "Summarization",
      "Translation",
      "Coding assistance",
      "Mathematics",
      "Creative writing",
      "Basic reasoning",
    ],
    cards: [
      {
        title: "Ask anything",
        description: "Quick answers to everyday questions",
        icon: "sparkle",
        prompt: "Explain how solar panels work in simple terms.",
      },
      {
        title: "Write",
        description: "Emails, posts and creative text",
        icon: "pen",
        prompt: "Write a short, friendly email asking my team for project updates.",
      },
      {
        title: "Translate",
        description: "Natural translation between languages",
        icon: "languages",
        prompt: "Translate this to Persian: 'The meeting has been moved to Monday at 9am.'",
      },
      {
        title: "Code",
        description: "Snippets, fixes and explanations",
        icon: "code",
        prompt: "Write a JavaScript function that debounces another function.",
      },
    ],
    examples: [
      "Summarize the theory of relativity in 5 bullet points",
      "Give me a 20-minute healthy dinner recipe",
      "Fix this SQL query and explain the bug",
    ],
    supportsImages: true,
    supportsFiles: true,
  },
  "3.0": {
    id: "3.0",
    name: "Star-AI 3.0",
    badge: "Star-AI 3.0",
    subtitle: "Advanced intelligence for complex tasks",
    tagline: "Advanced Mode",
    advanced: true,
    capabilities: [
      "Advanced reasoning",
      "Complex problem solving",
      "Coding",
      "Debugging",
      "Mathematics",
      "Translation",
      "Long-form writing",
      "Summarization",
      "Creative generation",
      "Data analysis",
      "Multi-step reasoning",
      "File understanding",
      "Image understanding",
      "Conversation memory",
      "Context-aware responses",
    ],
    cards: [
      {
        title: "Advanced Reasoning",
        description: "Multi-step thinking on hard problems",
        icon: "brain",
        prompt: "Design a fair scheduling algorithm for 3 teams across 4 timezones and justify it.",
      },
      {
        title: "Code & Debug",
        description: "Architecture, refactors, root-cause fixes",
        icon: "bug",
        prompt: "Here is a React component that re-renders too often. Diagnose and refactor it.",
      },
      {
        title: "Analyze",
        description: "Data, trends and structured insight",
        icon: "chart",
        prompt: "Analyze this CSV of monthly sales and tell me what is driving the decline.",
      },
      {
        title: "Create",
        description: "Long-form and original generation",
        icon: "wand",
        prompt: "Write the opening chapter of a hard sci-fi novel set on a dying star.",
      },
      {
        title: "Understand Files",
        description: "PDF, DOCX, CSV, JSON and images",
        icon: "file",
        prompt: "Summarize the attached document and extract every action item.",
      },
      {
        title: "Complex Problems",
        description: "Research-grade, multi-constraint tasks",
        icon: "orbit",
        prompt: "Plan a migration from a monolith to services with zero downtime and a rollback path.",
      },
    ],
    examples: [
      "Prove that the square root of 2 is irrational, step by step",
      "Compare three caching strategies for a read-heavy API",
      "Turn this messy spec into a prioritized engineering plan",
    ],
    supportsImages: true,
    supportsFiles: true,
  },
};

export const VERSION_LIST: VersionMeta[] = [VERSIONS["2.0"], VERSIONS["3.0"]];

/* ------------------------------------------------------------------ *
 * Version catalog — the SINGLE source of truth for which Star-AI
 * versions exist and which ones are unlocked.
 *
 * To unlock a version in a future phase: flip `enabled` to true here
 * (and add its runtime config on the server). The whole UI follows.
 * ------------------------------------------------------------------ */

export type StarVersionId =
  | "2.0"
  | "3.0"
  | "4.0"
  | "5.0"
  | "programming"
  | "5.5"
  | "5.6";

export type VersionCatalogEntry = {
  id: StarVersionId;
  /** Always displayed in full. */
  name: string;
  emoji: string;
  subtitle: string;
  /** Visual identity key -> [data-star-version-theme] tokens in styles.css */
  theme: string;
  /** Accent pair used for the selector swatch. */
  swatch: [string, string];
  enabled: boolean;
};

export const VERSION_CATALOG: VersionCatalogEntry[] = [
  {
    id: "2.0",
    name: "Star-AI 2.0",
    emoji: "⭐",
    subtitle: "Modern blue technology",
    theme: "tech-blue",
    swatch: ["oklch(0.68 0.18 275)", "oklch(0.72 0.16 225)"],
    enabled: true,
  },
  {
    id: "3.0",
    name: "Star-AI 3.0",
    emoji: "⭐",
    subtitle: "Advanced blue / purple cosmic",
    theme: "cosmic-violet",
    swatch: ["oklch(0.79 0.15 330)", "oklch(0.82 0.14 195)"],
    enabled: true,
  },
  {
    id: "4.0",
    name: "Star-AI 4.0",
    emoji: "🚀",
    subtitle: "Futuristic cyan / blue",
    theme: "futuristic-cyan",
    swatch: ["oklch(0.82 0.14 200)", "oklch(0.7 0.16 245)"],
    enabled: false,
  },
  {
    id: "5.0",
    name: "Star-AI 5.0",
    emoji: "🔥",
    subtitle: "Powerful cosmic energy",
    theme: "cosmic-energy",
    swatch: ["oklch(0.75 0.2 35)", "oklch(0.7 0.19 320)"],
    enabled: false,
  },
  {
    id: "programming",
    name: "Star-AI Programming",
    emoji: "💻",
    subtitle: "Futuristic developer / code",
    theme: "developer",
    swatch: ["oklch(0.8 0.19 150)", "oklch(0.72 0.13 205)"],
    enabled: false,
  },
  {
    id: "5.5",
    name: "Star-AI 5.5",
    emoji: "⚡",
    subtitle: "Premium cosmic",
    theme: "premium-cosmic",
    swatch: ["oklch(0.85 0.15 95)", "oklch(0.72 0.17 300)"],
    enabled: false,
  },
  {
    id: "5.6",
    name: "Star-AI 5.6",
    emoji: "🌌",
    subtitle: "Flagship deep space",
    theme: "deep-space",
    swatch: ["oklch(0.62 0.2 285)", "oklch(0.84 0.12 210)"],
    enabled: false,
  },
];

export const UNLOCKED_VERSIONS = VERSION_CATALOG.filter((v) => v.enabled);
export const LOCKED_VERSIONS = VERSION_CATALOG.filter((v) => !v.enabled);

export function isVersionUnlocked(id: StarVersionId): boolean {
  return VERSION_CATALOG.some((v) => v.id === id && v.enabled);
}

/** Only unlocked ids that the chat runtime actually supports today. */
export function isRuntimeVersion(id: StarVersionId): id is StarVersion {
  return (id === "2.0" || id === "3.0") && isVersionUnlocked(id);
}

/** Display label for a version id, e.g. "Star-AI 5.6". */
export function versionName(id: StarVersionId): string {
  return VERSION_CATALOG.find((v) => v.id === id)?.name ?? `Star-AI ${id}`;
}
