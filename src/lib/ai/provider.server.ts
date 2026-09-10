/**
 * AI provider abstraction.
 *
 * The rest of the app talks to `AIProvider` only, so a different vendor can be
 * dropped in by implementing this interface. The Lovable AI Gateway
 * implementation below is the default.
 */

import { buildSystemPrompt, getVersionConfig } from "./config.server";
import type { AIMode } from "./modes";
import type { ResponseStyle, StarVersion } from "./versions";

export type Attachment = {
  name: string;
  mimeType: string;
  /** data: URL for binary files, plain text for text-like files */
  dataUrl?: string | undefined;
  text?: string | undefined;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[] | undefined;
};

export type GenerateOptions = {
  version: StarVersion;
  style: ResponseStyle;
  mode?: AIMode | undefined;
  assistantName?: string | undefined;
  userName?: string | undefined;
  language?: string | undefined;
  memories?: string[] | undefined;
  searchContext?: string | undefined;
  messages: ChatMessage[];
  signal?: AbortSignal | undefined;
};

export type StreamEvent =
  | { type: "reasoning"; value: string }
  | { type: "text"; value: string }
  | { type: "done" }
  | { type: "error"; value: string; status?: number };

export interface AIProvider {
  readonly id: string;
  sendMessage(opts: GenerateOptions): Promise<string>;
  streamMessage(opts: GenerateOptions): AsyncGenerator<StreamEvent>;
  analyzeImage(opts: GenerateOptions & { image: Attachment }): AsyncGenerator<StreamEvent>;
  analyzeFile(opts: GenerateOptions & { file: Attachment }): AsyncGenerator<StreamEvent>;
}

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";

const TEXT_LIKE = /^(text\/|application\/json|application\/csv|application\/xml)/;

export class UnsupportedAttachmentError extends Error {}

type ContentPart =
  | { type: "input_text"; text: string }
  | { type: "output_text"; text: string }
  | { type: "input_image"; image_url: string }
  | { type: "input_file"; filename: string; file_data: string };

function attachmentToParts(a: Attachment): ContentPart[] {
  if (a.mimeType.startsWith("image/") && a.dataUrl) {
    return [{ type: "input_image", image_url: a.dataUrl }];
  }
  if (a.mimeType === "application/pdf" && a.dataUrl) {
    return [{ type: "input_file", filename: a.name, file_data: a.dataUrl }];
  }
  if (typeof a.text === "string" && a.text.length > 0) {
    return [
      {
        type: "input_text",
        text: `Attached file "${a.name}" (${a.mimeType}):\n\n\`\`\`\n${a.text.slice(0, 200_000)}\n\`\`\``,
      },
    ];
  }
  if (TEXT_LIKE.test(a.mimeType)) {
    return [{ type: "input_text", text: `Attached file "${a.name}" could not be read as text.` }];
  }
  return [
    {
      type: "input_text",
      text: `The user attached "${a.name}" (${a.mimeType}), which this Star-AI version cannot read directly. Ask them to paste the relevant content or upload a PDF, image, or text-based file.`,
    },
  ];
}

function buildInput(messages: ChatMessage[]) {
  return messages.map((m) => {
    if (m.role === "assistant") {
      return { role: "assistant", content: [{ type: "output_text", text: m.content }] };
    }
    const parts: ContentPart[] = [];
    if (m.content.trim()) parts.push({ type: "input_text", text: m.content });
    for (const a of m.attachments ?? []) parts.push(...attachmentToParts(a));
    if (parts.length === 0) parts.push({ type: "input_text", text: "(empty message)" });
    return { role: "user", content: parts };
  });
}

function friendlyError(status: number, message?: string): string {
  if (status === 402) {
    return (
      message ||
      "Star-AI has run out of AI credits. The workspace owner needs to add credits to continue."
    );
  }
  if (status === 429) return "Star-AI is handling a lot of requests right now. Please try again in a moment.";
  if (status === 401 || status === 403)
    return "Star-AI is not configured correctly. Please contact the administrator.";
  if (status >= 500) return "Star-AI is temporarily unavailable. Please try again.";
  return message || "Something went wrong. Please try again.";
}

export class LovableGatewayProvider implements AIProvider {
  readonly id = "lovable-gateway";
  #apiKey: string;

  constructor(apiKey: string) {
    this.#apiKey = apiKey;
  }

  async *streamMessage(opts: GenerateOptions): AsyncGenerator<StreamEvent> {
    const cfg = getVersionConfig(opts.version);
    const body: Record<string, unknown> = {
      model: cfg.model,
      stream: true,
      store: false,
      instructions: buildSystemPrompt({
        version: opts.version,
        style: opts.style,
        mode: opts.mode,
        assistantName: opts.assistantName,
        userName: opts.userName,
        language: opts.language,
        memories: opts.memories,
        searchContext: opts.searchContext,
      }),
      input: buildInput(opts.messages),
    };
    if (cfg.reasoningEffort) {
      body["reasoning"] = { effort: cfg.reasoningEffort, summary: cfg.reasoningSummary ?? "auto" };
      body["include"] = ["reasoning.encrypted_content"];
    }

    let res: Response;
    try {
      res = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": this.#apiKey,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify(body),
        signal: opts.signal ?? null,
      });
    } catch {
      yield { type: "error", value: "Star-AI is temporarily unavailable. Please try again." };
      return;
    }

    if (!res.ok || !res.body) {
      let message: string | undefined;
      try {
        const j = (await res.json()) as { error?: { message?: string }; message?: string };
        message = j?.error?.message ?? j?.message;
      } catch {
        /* ignore */
      }
      yield { type: "error", value: friendlyError(res.status, message), status: res.status };
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";

      for (const chunk of chunks) {
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;
          let evt: { type?: string; delta?: string; response?: { error?: { message?: string } } };
          try {
            evt = JSON.parse(raw);
          } catch {
            continue;
          }
          if (evt.type === "response.output_text.delta" && evt.delta) {
            yield { type: "text", value: evt.delta };
          } else if (evt.type === "response.reasoning_summary_text.delta" && evt.delta) {
            yield { type: "reasoning", value: evt.delta };
          } else if (evt.type === "response.failed" || evt.type === "error") {
            yield {
              type: "error",
              value: friendlyError(500, evt.response?.error?.message),
            };
            return;
          }
        }
      }
    }

    yield { type: "done" };
  }

  async sendMessage(opts: GenerateOptions): Promise<string> {
    let out = "";
    for await (const e of this.streamMessage(opts)) {
      if (e.type === "text") out += e.value;
      if (e.type === "error") throw new Error(e.value);
    }
    return out;
  }

  analyzeImage(opts: GenerateOptions & { image: Attachment }) {
    return this.streamMessage(withAttachment(opts, opts.image));
  }

  analyzeFile(opts: GenerateOptions & { file: Attachment }) {
    return this.streamMessage(withAttachment(opts, opts.file));
  }
}

function withAttachment(opts: GenerateOptions, attachment: Attachment): GenerateOptions {
  const messages = [...opts.messages];
  const last = messages[messages.length - 1];
  if (last && last.role === "user") {
    messages[messages.length - 1] = {
      ...last,
      attachments: [...(last.attachments ?? []), attachment],
    };
  } else {
    messages.push({ role: "user", content: "", attachments: [attachment] });
  }
  return { ...opts, messages };
}

/** Factory — swap this to change the platform's AI vendor. */
export function getAIProvider(): AIProvider {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) {
    // Add your provider credential as an environment variable named
    // LOVABLE_API_KEY (or implement AIProvider for your own vendor).
    throw new Error("MISSING_AI_CREDENTIALS");
  }
  return new LovableGatewayProvider(key);
}
