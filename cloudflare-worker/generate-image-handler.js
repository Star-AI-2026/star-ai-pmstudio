// Add this module to the existing Star-AI Cloudflare Worker.
// It does not replace the Worker: wire it into the existing router as explained
// in IMAGE_GENERATION_ROUTE_FA.md. Keep your existing chat route unchanged.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
  });
}

function extractImage(payload) {
  for (const candidate of payload?.candidates ?? []) {
    for (const part of candidate?.content?.parts ?? []) {
      const inline = part?.inlineData ?? part?.inline_data;
      const data = inline?.data ?? part?.data;
      const mimeType = inline?.mimeType ?? inline?.mime_type ?? part?.mimeType ?? part?.mime_type ?? "image/png";
      if (typeof data === "string" && ["image/png", "image/jpeg", "image/webp"].includes(mimeType)) {
        return { data, mimeType };
      }
    }
  }
  return null;
}

export async function handleStarAIImageGeneration(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request body." }, 400);
  }

  const version = String(body?.version ?? "");
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const uiLanguage = body?.uiLanguage === "fa" ? "fa" : "en";
  const aspectRatio = ["1:1", "16:9", "9:16", "4:3", "3:4"].includes(body?.aspectRatio)
    ? body.aspectRatio
    : "1:1";

  if (!["3.0", "4.0", "5.0"].includes(version)) {
    return json({ error: "Image generation is available from Star-AI 3.0 onward." }, 403);
  }
  if (prompt.length < 3 || prompt.length > 8000) {
    return json({ error: "The image prompt must contain between 3 and 8000 characters." }, 400);
  }

  // Preserve the requested experimental behaviour only for Star-AI 5.0 Beta.
  if (version === "5.0") {
    const probability = Number(env.STAR_AI_5_BETA_SUCCESS_RATE ?? "0.2");
    const successRate = Number.isFinite(probability) ? Math.min(1, Math.max(0, probability)) : 0.2;
    if (Math.random() >= successRate) {
      return json({ error: uiLanguage === "fa"
        ? "خطای آزمایشی Star-AI 5.0 Beta: تولید تصویر در این تلاش ناموفق بود. دوباره تلاش کن."
        : "Star-AI 5.0 Beta experimental error: image generation failed for this attempt. Please try again." }, 503);
    }
  }

  const apiKey = env.GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (!apiKey) {
    return json({ error: uiLanguage === "fa"
      ? "کلید Gemini در Cloudflare Worker تنظیم نشده است. Secret با نام GEMINI_API_KEY را اضافه کن."
      : "Gemini is not configured on this Cloudflare Worker. Add the GEMINI_API_KEY Secret." }, 503);
  }

  const model = String(env.STAR_AI_IMAGE_MODEL || "gemini-3.1-flash-image");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio, imageSize: "1K" },
        },
      }),
      signal: request.signal,
    });

    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const upstreamMessage = payload?.error?.message || `Gemini API returned HTTP ${upstream.status}.`;
      return json({ error: uiLanguage === "fa"
        ? `خطا در سرویس Gemini (${upstream.status}): ${upstreamMessage}`
        : `Gemini API error (${upstream.status}): ${upstreamMessage}` }, 502);
    }

    const image = extractImage(payload);
    if (!image) {
      return json({ error: "Gemini returned a response without image data. Check that the selected model supports image generation." }, 502);
    }

    const extension = image.mimeType === "image/jpeg" ? "jpg" : image.mimeType === "image/webp" ? "webp" : "png";
    return json({
      image: {
        dataUrl: `data:${image.mimeType};base64,${image.data}`,
        fileName: `star-ai-image-${Date.now()}.${extension}`,
        mimeType: image.mimeType,
      },
    });
  } catch (error) {
    if (error?.name === "AbortError") return json({ error: "Image generation was cancelled." }, 499);
    const message = error instanceof Error ? error.message : "Unknown Gemini API error.";
    return json({ error: uiLanguage === "fa" ? `خطا در ارتباط با Gemini: ${message}` : `Gemini request failed: ${message}` }, 502);
  }
}
