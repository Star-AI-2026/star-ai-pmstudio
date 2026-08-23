import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { getAIProvider } from "@/lib/ai/provider.server";
import { clientKey, rateLimit } from "@/lib/ai/rate-limit.server";

const AttachmentSchema = z.object({
  name: z.string().max(300),
  mimeType: z.string().max(200),
  dataUrl: z.string().max(20_000_000).optional(),
  text: z.string().max(400_000).optional(),
});

const BodySchema = z.object({
  // The client picks a VERSION, never a model name. The server maps it.
  version: z.enum(["2.0", "3.0"]),
  style: z
    .enum(["balanced", "creative", "precise", "friendly", "professional", "short", "detailed"])
    .default("balanced"),
  memories: z.array(z.string().max(1000)).max(50).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(60_000),
        attachments: z.array(AttachmentSchema).max(6).optional(),
      }),
    )
    .min(1)
    .max(200),
});

function line(obj: unknown) {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limit = rateLimit(`chat:${clientKey(request)}`, 30, 60_000);
        if (!limit.allowed) {
          return new Response(
            JSON.stringify({ error: "You're sending messages very quickly. Please slow down." }),
            { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
          );
        }

        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return new Response(JSON.stringify({ error: "Your message could not be processed." }), {
            status: 400,
          });
        }

        let provider;
        try {
          provider = getAIProvider();
        } catch {
          return new Response(
            JSON.stringify({
              error: "Star-AI is not connected to an AI provider yet. Add the API key on the server.",
            }),
            { status: 503 },
          );
        }

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              for await (const event of provider.streamMessage({
                version: parsed.version,
                style: parsed.style,
                memories: parsed.memories,
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
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});
