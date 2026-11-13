import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { betaExperimentFailure } from "@/lib/ai/beta-experiment.server";
import { clientKey, rateLimit } from "@/lib/ai/rate-limit.server";

const BodySchema = z.object({
  version: z.enum(["3.0", "4.0", "5.0"]),
  prompt: z.string().trim().min(3).max(8000),
  uiLanguage: z.enum(["fa", "en"]).optional(),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).optional(),
});

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

type GeminiImagePart = {
  type?: string;
  data?: string;
  mime_type?: string;
  mimeType?: string;
  inline_data?: { data?: string; mime_type?: string };
  inlineData?: { data?: string; mimeType?: string };
};

type GeminiPayload = {
  error?: { message?: string };
  output_image?: { data?: string; mime_type?: string; mimeType?: string };
  steps?: Array<{ content?: GeminiImagePart[] }>;
  candidates?: Array<{ content?: { parts?: GeminiImagePart[] } }>;
};

function extractGeminiImage(payload: GeminiPayload) {
  const candidates: GeminiImagePart[] = [];

  if (payload.output_image?.data) {
    candidates.push({
      data: payload.output_image.data,
      mime_type: payload.output_image.mime_type ?? payload.output_image.mimeType,
    });
  }

  for (const step of payload.steps ?? []) {
    for (const part of step.content ?? []) {
      if (part.type === "image" || part.data || part.inline_data?.data || part.inlineData?.data) {
        candidates.push(part);
      }
    }
  }

  for (const candidate of payload.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (part.data || part.inline_data?.data || part.inlineData?.data) candidates.push(part);
    }
  }

  for (const part of candidates) {
    const data = part.data ?? part.inline_data?.data ?? part.inlineData?.data;
    const mimeType =
      part.mime_type ??
      part.mimeType ??
      part.inline_data?.mime_type ??
      part.inlineData?.mimeType ??
      "image/png";

    if (data && /^[A-Za-z0-9+/]+={0,2}$/.test(data) && ["image/png", "image/jpeg", "image/webp"].includes(mimeType)) {
      return { data, mimeType };
    }
  }

  return null;
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function readProviderError(response: Response) {
  try {
    const payload = (await response.json()) as GeminiPayload;
    return payload.error?.message || `Gemini API returned HTTP ${response.status}.`;
  } catch {
    return `Gemini API returned HTTP ${response.status}.`;
  }
}

async function generateWithGemini(options: {
  apiKey: string;
  model: string;
  prompt: string;
  aspectRatio: string;
  signal: AbortSignal;
}) {
  const { apiKey, model, prompt, aspectRatio, signal } = options;

  // The Interactions API is Google's current recommended interface for new
  // Gemini integrations. Keep a GenerateContent fallback for API projects or
  // models that have not enabled the Interactions endpoint yet.
  const interactionsResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      model,
      input: prompt,
      response_format: {
        type: "image",
        mime_type: "image/png",
        aspect_ratio: aspectRatio,
        image_size: "1K",
      },
    }),
    signal,
  });

  if (interactionsResponse.ok) {
    const payload = (await interactionsResponse.json()) as GeminiPayload;
    const image = extractGeminiImage(payload);
    if (image) return image;

    throw new Error("Gemini returned a successful response without image data. Check that the configured model supports image generation.");
  }

  // Only fall back when the endpoint itself is unavailable. Authentication,
  // quota, and model errors should be shown instead of silently retrying.
  if (![404, 405, 410].includes(interactionsResponse.status)) {
    throw new Error(await readProviderError(interactionsResponse));
  }

  const legacyUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const legacyResponse = await fetch(legacyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio, imageSize: "1K" },
      },
    }),
    signal,
  });

  if (!legacyResponse.ok) throw new Error(await readProviderError(legacyResponse));

  const payload = (await legacyResponse.json()) as GeminiPayload;
  const image = extractGeminiImage(payload);
  if (!image) {
    throw new Error("Gemini GenerateContent did not return image data. Check the selected image model and API access.");
  }
  return image;
}

export const Route = createFileRoute("/api/public/generate-image")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const limit = rateLimit(`image:${clientKey(request)}`, 5, 60_000);
        if (!limit.allowed) {
          return jsonResponse(
            { error: "Image generation is being requested too quickly. Please try again shortly." },
            429,
          );
        }

        let parsed: z.infer<typeof BodySchema>;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return jsonResponse({ error: "The image request is invalid." }, 400);
        }

        if (parsed.version === "2.0") {
          return jsonResponse({ error: "Image generation is available from Star-AI 3.0 onward." }, 403);
        }

        const betaError = betaExperimentFailure(parsed.version, parsed.uiLanguage);
        if (betaError) return jsonResponse({ error: betaError }, 503);

        const apiKey =
          process.env["GEMINI_API_KEY"] ||
          process.env["GOOGLE_GEMINI_API_KEY"] ||
          process.env["GOOGLE_API_KEY"];

        if (!apiKey) {
          return jsonResponse(
            {
              error:
                parsed.uiLanguage === "fa"
                  ? "سرویس ساخت تصویر جمینای تنظیم نشده است. مدیر برنامه باید Secret با نام GEMINI_API_KEY را در محیط سرور تنظیم کند."
                  : "Gemini image generation is not configured. The administrator must add GEMINI_API_KEY as a server-side secret in the API hosting environment.",
            },
            503,
          );
        }

        const model = process.env["STAR_AI_IMAGE_MODEL"] || "gemini-3.1-flash-image";
        const aspectRatio = parsed.aspectRatio || "1:1";

        try {
          const image = await generateWithGemini({
            apiKey,
            model,
            prompt: parsed.prompt,
            aspectRatio,
            signal: request.signal,
          });

          const extension = image.mimeType === "image/jpeg" ? "jpg" : image.mimeType === "image/webp" ? "webp" : "png";
          return jsonResponse(
            {
              image: {
                dataUrl: `data:${image.mimeType};base64,${image.data}`,
                fileName: `star-ai-image-${Date.now()}.${extension}`,
                mimeType: image.mimeType,
                revisedPrompt: parsed.prompt,
              },
            },
            200,
          );
        } catch (error) {
          if ((error as Error)?.name === "AbortError") {
            return jsonResponse({ error: "Image generation was cancelled." }, 499);
          }

          const message = error instanceof Error ? error.message : "Unknown Gemini API error.";
          console.error("[generate-image] Gemini image generation failed:", message);
          return jsonResponse(
            {
              error:
                parsed.uiLanguage === "fa"
                  ? `خطا در ساخت تصویر با Gemini: ${message}`
                  : `Gemini image generation failed: ${message}`,
            },
            502,
          );
        }
      },
    },
  },
});
