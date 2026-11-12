import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { betaExperimentFailure } from "@/lib/ai/beta-experiment.server";
import { clientKey, rateLimit } from "@/lib/ai/rate-limit.server";

const BodySchema = z.object({
  version: z.enum(["3.0", "4.0", "5.0"]),
  prompt: z.string().trim().min(3).max(8000),
  uiLanguage: z.enum(["fa", "en"]).optional(),
});

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export const Route = createFileRoute("/api/public/generate-image")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const limit = rateLimit(`image:${clientKey(request)}`, 5, 60_000);
        if (!limit.allowed) {
          return new Response(
            JSON.stringify({ error: "Image generation is being requested too quickly. Please try again shortly." }),
            { status: 429, headers: { ...CORS, "Retry-After": String(limit.retryAfter) } },
          );
        }

        let parsed: z.infer<typeof BodySchema>;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return new Response(JSON.stringify({ error: "The image request is invalid." }), {
            status: 400,
            headers: CORS,
          });
        }

        const betaError = betaExperimentFailure(parsed.version, parsed.uiLanguage);
        if (betaError) {
          return new Response(JSON.stringify({ error: betaError }), { status: 503, headers: CORS });
        }

        const apiKey = process.env["OPENAI_API_KEY"];
        if (!apiKey) {
          return new Response(
            JSON.stringify({
              error: parsed.uiLanguage === "fa"
                ? "سرویس ساخت تصویر هنوز به سرور متصل نشده است. مدیر برنامه باید OPENAI_API_KEY را در متغیرهای محرمانه سرور تنظیم کند."
                : "Image generation is not configured. The administrator must add OPENAI_API_KEY to the server environment.",
            }),
            { status: 503, headers: CORS },
          );
        }

        try {
          const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: process.env["STAR_AI_IMAGE_MODEL"] || "gpt-image-2.6-flare",
              prompt: parsed.prompt,
              n: 1,
              size: "1024x1024",
              quality: "medium",
              output_format: "webp",
            }),
            signal: request.signal,
          });

          const payload = await response.json() as {
            data?: { b64_json?: string; revised_prompt?: string }[];
            error?: { message?: string };
          };

          if (!response.ok) {
            const message = payload.error?.message || `Image service returned HTTP ${response.status}.`;
            return new Response(JSON.stringify({ error: message }), { status: 502, headers: CORS });
          }

          const imageBase64 = payload.data?.[0]?.b64_json;
          if (!imageBase64 || !/^[A-Za-z0-9+/=]+$/.test(imageBase64)) {
            return new Response(JSON.stringify({ error: "The image service did not return a valid image." }), {
              status: 502,
              headers: CORS,
            });
          }

          return new Response(
            JSON.stringify({
              image: {
                dataUrl: `data:image/webp;base64,${imageBase64}`,
                fileName: `star-ai-image-${Date.now()}.webp`,
                mimeType: "image/webp",
                revisedPrompt: payload.data?.[0]?.revised_prompt || parsed.prompt,
              },
            }),
            { status: 200, headers: { ...CORS, "Content-Type": "application/json" } },
          );
        } catch (error) {
          if ((error as Error)?.name === "AbortError") {
            return new Response(JSON.stringify({ error: "Image generation was cancelled." }), {
              status: 499,
              headers: CORS,
            });
          }
          console.error("[generate-image] Image generation failed:", error);
          return new Response(JSON.stringify({ error: "Image generation failed. Please try again." }), {
            status: 502,
            headers: CORS,
          });
        }
      },
    },
  },
});
