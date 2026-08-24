/**
 * Client-safe AI mode catalog.
 *
 * A mode only changes *task framing*. Security and identity instructions are
 * built server-side and can never be overridden by the client.
 */

export type AIMode =
  | "general"
  | "coding"
  | "writing"
  | "research"
  | "math"
  | "data"
  | "creative"
  | "study";

export type ModeMeta = {
  id: AIMode;
  label: string;
  icon: string;
  hint: string;
};

export const AI_MODES: ModeMeta[] = [
  { id: "general", label: "General", icon: "sparkle", hint: "Everyday assistance" },
  { id: "coding", label: "Coding", icon: "code", hint: "Write, debug and refactor code" },
  { id: "writing", label: "Writing", icon: "pen", hint: "Drafting and editing" },
  { id: "research", label: "Research", icon: "search", hint: "Structured, sourced answers" },
  { id: "math", label: "Math", icon: "sigma", hint: "Step-by-step problem solving" },
  { id: "data", label: "Data Analysis", icon: "chart", hint: "Datasets, stats and insight" },
  { id: "creative", label: "Creative", icon: "wand", hint: "Ideas and original writing" },
  { id: "study", label: "Study", icon: "book", hint: "Explain and quiz me" },
];

export const MODE_MAP: Record<AIMode, ModeMeta> = Object.fromEntries(
  AI_MODES.map((m) => [m.id, m]),
) as Record<AIMode, ModeMeta>;

export const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "java",
  "c",
  "cpp",
  "csharp",
  "php",
  "sql",
  "json",
  "bash",
] as const;
