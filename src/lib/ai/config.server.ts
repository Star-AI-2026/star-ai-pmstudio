/**
 * Server-only AI configuration.
 *
 * Model names are NEVER hardcoded across the app and are NEVER accepted from
 * the client. They live here and can be overridden with environment variables:
 *
 *   STAR_AI_2_MODEL   -> model used by Star-AI 2.0
 *   STAR_AI_3_MODEL   -> model used by Star-AI 3.0
 *   LOVABLE_API_KEY   -> credential for the AI provider (server-side only)
 */

import type { ResponseStyle, StarVersion } from "./versions";

export type VersionRuntimeConfig = {
  model: string;
  reasoningEffort: "low" | "medium" | "high" | null;
  reasoningSummary: "auto" | "concise" | "detailed" | null;
  systemPrompt: string;
};

const DEFAULT_MODEL = "openai/gpt-5.6-sol";

const STYLE_INSTRUCTIONS: Record<ResponseStyle, string> = {
  balanced: "Keep a clear, neutral, well-rounded tone.",
  creative: "Be imaginative, vivid and original in phrasing.",
  precise: "Be exact and literal. Avoid speculation; state uncertainty explicitly.",
  friendly: "Be warm, encouraging and conversational.",
  professional: "Use a formal, businesslike register.",
  short: "Answer as briefly as possible. Prefer a few sentences or tight bullets.",
  detailed: "Be thorough and well-structured, with headings and examples where useful.",
};

function baseIdentity(version: StarVersion) {
  return [
    `You are Star-AI ${version}, an AI assistant on the Star-AI platform.`,
    `Refer to yourself as "Star-AI ${version}".`,
    "Format answers in Markdown. Use fenced code blocks with a language tag for code.",
  ];
}

export function getVersionConfig(version: StarVersion): VersionRuntimeConfig {
  if (version === "3.0") {
    return {
      model: process.env["STAR_AI_3_MODEL"] || DEFAULT_MODEL,
      reasoningEffort: "medium",
      reasoningSummary: "auto",
      systemPrompt: [
        ...baseIdentity("3.0"),
        "You are the advanced generation: reason carefully through multi-step problems, verify your logic, and surface trade-offs.",
        "You can analyze documents, structured data and images the user attaches.",
        "Prefer depth, correctness and structure over speed. Show intermediate reasoning results when they help.",
      ].join(" "),
    };
  }

  return {
    model: process.env["STAR_AI_2_MODEL"] || DEFAULT_MODEL,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    systemPrompt: [
      ...baseIdentity("2.0"),
      "You are the everyday generation: fast, direct and reliable for general questions, writing, translation, math and coding help.",
      "Favor concise, practical answers. Do not over-explain unless asked.",
    ].join(" "),
  };
}

export function buildSystemPrompt(opts: {
  version: StarVersion;
  style: ResponseStyle;
  memories?: string[] | undefined;
}): string {
  const cfg = getVersionConfig(opts.version);
  const parts = [cfg.systemPrompt, STYLE_INSTRUCTIONS[opts.style] ?? STYLE_INSTRUCTIONS.balanced];

  if (opts.memories?.length) {
    parts.push(
      "Long-term memory about this user (use only when relevant):\n" +
        opts.memories.map((m) => `- ${m}`).join("\n"),
    );
  }

  return parts.join("\n\n");
}
