import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { getAIProvider } from "@/lib/ai/provider.server";
import { clientKey, rateLimit } from "@/lib/ai/rate-limit.server";
import { buildSearchContext, getWebSearchProvider } from "@/lib/ai/search.server";

/** Server-side upload policy. Client validation is never trusted. */
const MAX_ATTACHMENT_BYTES = Number(process.env["MAX_UPLOAD_BYTES"] ?? 12 * 1024 * 1024);
const MAX_ATTACHMENTS = Number(process.env["MAX_UPLOAD_COUNT"] ?? 6);

const ALLOWED_MIME = [
  /^image\/(png|jpe?g|webp|gif|svg\+xml)$/,
  /^application\/pdf$/,
  /^application\/json$/,
  /^text\//,
  /^application\/vnd\.openxmlformats-officedocument\./,
  /^application\/vnd\.ms-excel$/,
  /^application\/octet-stream$/,
];

const AttachmentSchema = z.object({
  name: z.string().max(300),
  mimeType: z.string().max(200),
  dataUrl: z.string().max(24_000_000).optional(),
  text: z.string().max(400_000).optional(),
});

const BodySchema = z.object({
  // The client picks a VERSION, never a model name. The server maps it.
  version: z.enum(["2.0", "3.0"]),
  style: z
    .enum(["balanced", "creative", "precise", "friendly", "professional", "short", "detailed"])
    .default("balanced"),
  mode: z
    .enum(["general", "coding", "writing", "research", "math", "data", "creative", "study"])
    .default("general"),
  assistantName: z.string().max(40).optional(),
  userName: z.string().max(80).optional(),
  language: z.string().max(40).optional(),
  webSearch: z.boolean().default(false),
  memories: z.array(z.string().max(1000)).max(50).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(60_000),
        attachments: z.array(AttachmentSchema).max(20).optional(),
      }),
    )
    .min(1)
    .max(200),
});

function line(obj: unknown) {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

function approxBytes(a: { dataUrl?: string | undefined; text?: string | undefined }) {
  if (a.dataUrl) return Math.floor((a.dataUrl.length - (a.dataUrl.indexOf(",") + 1)) * 0.75);
  return a.text ? a.text.length : 0;
}

function validateAttachments(messages: z.infer<typeof BodySchema>["messages"]): string | null {
  for (const m of messages) {
    const list = m.attachments ?? [];
    if (list.length > MAX_ATTACHMENTS) return `You can attach at most ${MAX_ATTACHMENTS} files per message.`;
    for (const a of list) {
      if (!ALLOWED_MIME.some((re) => re.test(a.mimeType))) {
        return `"${a.name}" is not a supported file type.`;
      }
      if (approxBytes(a) > MAX_ATTACHMENT_BYTES) {
        return `"${a.name}" is larger than the ${Math.round(MAX_ATTACHMENT_BYTES / 1024 / 1024)} MB upload limit.`;
      }
    }
  }
  return null;
}

/** Static hosts (GitHub Pages) call this endpoint cross-origin. */
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const limit = rateLimit(`chat:${clientKey(request)}`, 30, 60_000);
        if (!limit.allowed) {
          return new Response(
            JSON.stringify({ error: "You're sending messages very quickly. Please slow down." }),
            { status: 429, headers: { ...CORS, "Retry-After": String(limit.retryAfter) } },
          );
        }

        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return new Response(JSON.stringify({ error: "Your message could not be processed." }), {
            status: 400,
            headers: CORS,
          });
        }

        const attachmentError = validateAttachments(parsed.messages);
        if (attachmentError) {
          return new Response(JSON.stringify({ error: attachmentError }), { status: 413, headers: CORS });
        }

        let provider;
        try {
          provider = getAIProvider();
        } catch {
          return new Response(
            JSON.stringify({
              error: "Star-AI is not connected to an AI provider yet. Add the API key on the server.",
            }),
            { status: 503, headers: CORS },
          );
        }

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            let searchContext: string | undefined;

            try {
              if (parsed.webSearch) {
                const search = getWebSearchProvider();
                const query = [...parsed.messages].reverse().find((m) => m.role === "user")?.content ?? "";
                if (!search) {
                  controller.enqueue(line({ type: "notice", value: "Web Search is not configured yet." }));
                } else if (query.trim()) {
                  controller.enqueue(line({ type: "status", value: "Searching the web…" }));
                  try {
                    const results = await search.search(query, request.signal);
                    if (results.length) {
                      controller.enqueue(line({ type: "sources", sources: results }));
                      searchContext = buildSearchContext(query, results);
                    } else {
                      controller.enqueue(line({ type: "notice", value: "No web results were found for this question." }));
                    }
                  } catch {
                    controller.enqueue(line({ type: "notice", value: "Web search failed, answering without it." }));
                  }
                }
              }

              for await (const event of provider.streamMessage({
                version: parsed.version,
                style: parsed.style,
                mode: parsed.mode,
                assistantName: parsed.assistantName,
                userName: parsed.userName,
                language: parsed.language,
                memories: parsed.memories,
                searchContext,
                messages: parsed.messages,
                signal: request.signal,
              })) {
                controller.enqueue(line(event));
              }
            } catch (err) {
              if ((err as Error)?.name !== "AbortError") {
                controller.enqueue(
                  line({ type: "error", value: "Something went wrong. Please try again." }),
                );
              }
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            ...CORS,
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});
