/**
 * Star-AI Cloudflare Worker
 *
 * Routes:
 *   GET  /                         Health check
 *   POST /api/public/chat          Gemini text chat (NDJSON stream)
 *   POST /api/public/generate-image Gemini image generation
 *
 * Required Worker Secret:
 *   GEMINI_API_KEY
 *
 * Optional Worker variables:
 *   TAVILY_API_KEY
 *   STAR_AI_CHAT_MODEL             default: gemini-2.5-flash
 *   STAR_AI_IMAGE_MODEL            default: gemini-3.1-flash-image
 *   STAR_AI_5_BETA_SUCCESS_RATE    default: 0.2 (20% success)
 */

const CHAT_MODEL = "gemini-2.5-flash";
const DEFAULT_IMAGE_MODEL = "gemini-3.1-flash-image";
const CHAT_PATH = "/api/public/chat";
const IMAGE_PATH = "/api/public/generate-image";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function line(data) {
  return new TextEncoder().encode(JSON.stringify(data) + "\n");
}

function getLastUserMessage(messages) {
  return [...messages].reverse().find(
    (message) => message && message.role === "user" && typeof message.content === "string",
  )?.content || "";
}

function getBetaSuccessRate(env) {
  const configured = Number(env.STAR_AI_5_BETA_SUCCESS_RATE ?? "0.2");
  return Number.isFinite(configured) ? Math.min(1, Math.max(0, configured)) : 0.2;
}

function betaFailureMessage(uiLanguage) {
  return uiLanguage === "fa"
    ? "خطای آزمایشی Star-AI 5.0 Beta: این نسخه عمداً ناپایدار است. لطفاً دوباره تلاش کنید یا به یک نسخه پایدارتر بروید."
    : "Experimental Star-AI 5.0 Beta error: this model is intentionally unstable. Please try again or switch to a more stable version.";
}

function shouldFailBeta(version, env) {
  if (version !== "5.0") return false;
  return Math.random() >= getBetaSuccessRate(env);
}

async function searchWeb(query, apiKey, signal) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: 5,
      include_answer: false,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error("Tavily search failed: " + response.status);
  }

  const data = await response.json();
  return (data.results || []).map((item) => ({
    title: String(item.title || "Untitled").slice(0, 300),
    url: String(item.url || ""),
    domain: (() => {
      try {
        return new URL(item.url).hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    })(),
    snippet: String(item.content || "").slice(0, 1500),
  })).filter((item) => item.url.startsWith("https://") || item.url.startsWith("http://"));
}

function extractGeneratedImage(payload) {
  for (const candidate of payload?.candidates || []) {
    for (const part of candidate?.content?.parts || []) {
      const inline = part?.inlineData || part?.inline_data;
      const data = inline?.data || part?.data;
      const mimeType = inline?.mimeType || inline?.mime_type || part?.mimeType || part?.mime_type || "image/png";
      if (typeof data === "string" && data.length > 0 && ["image/png", "image/jpeg", "image/webp"].includes(mimeType)) {
        return { data, mimeType };
      }
    }
  }
  return null;
}

async function handleImageGeneration(request, env) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed. Use POST." }, 405);
  }

  if (!env.GEMINI_API_KEY) {
    return json({
      error: "Gemini API key is not configured on this Cloudflare Worker. Add GEMINI_API_KEY under Worker Settings > Variables and Secrets.",
    }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request body." }, 400);
  }

  const version = String(body?.version || "");
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const uiLanguage = body?.uiLanguage === "fa" ? "fa" : "en";
  const validAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
  const aspectRatio = validAspectRatios.includes(body?.aspectRatio) ? body.aspectRatio : "1:1";

  if (!["3.0", "4.0", "5.0"].includes(version)) {
    return json({
      error: uiLanguage === "fa"
        ? "ساخت تصویر از Star-AI 3.0 به بعد فعال است."
        : "Image generation is available from Star-AI 3.0 onward.",
    }, 403);
  }

  if (prompt.length < 3 || prompt.length > 8000) {
    return json({
      error: uiLanguage === "fa"
        ? "متن درخواست تصویر باید بین ۳ تا ۸۰۰۰ نویسه باشد."
        : "The image prompt must contain between 3 and 8000 characters.",
    }, 400);
  }

  // Keep the intentionally unstable 20% default success rate limited to 5.0 Beta.
  if (shouldFailBeta(version, env)) {
    return json({ error: betaFailureMessage(uiLanguage) }, 503);
  }

  const model = String(env.STAR_AI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL).trim();
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          responseFormat: {
            image: {
              aspectRatio,
              imageSize: "1K",
            },
          },
        },
      }),
      signal: request.signal,
    });

    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const providerMessage = payload?.error?.message || `Gemini API returned HTTP ${upstream.status}.`;
      console.error("Gemini image API error:", upstream.status, providerMessage);
      return json({
        error: uiLanguage === "fa"
          ? `خطای سرویس Gemini (${upstream.status}): ${providerMessage}`
          : `Gemini API error (${upstream.status}): ${providerMessage}`,
      }, 502);
    }

    const image = extractGeneratedImage(payload);
    if (!image) {
      const modelText = (payload?.candidates || [])
        .flatMap((candidate) => candidate?.content?.parts || [])
        .map((part) => part?.text || "")
        .filter(Boolean)
        .join(" ")
        .slice(0, 500);
      return json({
        error: uiLanguage === "fa"
          ? `جمینای تصویر برنگرداند. ${modelText || "مدل یا دسترسی API را بررسی کن."}`
          : `Gemini returned no image data. ${modelText || "Check the configured image model and API access."}`,
      }, 502);
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
    if (error?.name === "AbortError") {
      return json({ error: "Image generation was cancelled." }, 499);
    }
    const message = error instanceof Error ? error.message : "Unknown Gemini image API error.";
    console.error("Star-AI image Worker error:", message);
    return json({
      error: uiLanguage === "fa"
        ? `خطا در ارتباط با Gemini: ${message}`
        : `Gemini request failed: ${message}`,
    }, 502);
  }
}

async function handleChat(request, env) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed. Use POST." }, 405);
  }

  if (!env.GEMINI_API_KEY) {
    return json({ error: "Gemini API key is not configured." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request." }, 400);
  }

  if (!Array.isArray(body.messages) || !body.messages.length) {
    return json({ error: "A chat message is required." }, 400);
  }

  const requestedVersion = String(body.version || "2.0");
  const version = ["2.0", "3.0", "4.0", "5.0"].includes(requestedVersion) ? requestedVersion : "2.0";
  const uiLanguage = body.uiLanguage === "fa" ? "fa" : "en";

  if (shouldFailBeta(version, env)) {
    return json({ error: betaFailureMessage(uiLanguage) }, 503);
  }

  const language =
    typeof body.language === "string" && body.language !== "auto"
      ? `Reply in ${body.language}.`
      : "Reply in the language used by the user.";

  const userQuery = getLastUserMessage(body.messages);

  const output = new ReadableStream({
    async start(controller) {
      const send = (event) => controller.enqueue(line(event));

      try {
        let searchContext = "";
        let sources = [];

        // Search the web only when the Web option is enabled.
        if (body.webSearch === true) {
          if (!env.TAVILY_API_KEY) {
            send({ type: "notice", value: "Web Search is not configured yet." });
          } else if (userQuery.trim()) {
            send({ type: "status", value: "Searching the web..." });
            try {
              sources = await searchWeb(userQuery, env.TAVILY_API_KEY, request.signal);
              if (sources.length) {
                send({ type: "sources", sources });
                searchContext =
                  "The following information was retrieved from web search. " +
                  "Use it to answer the user's question. Do not invent facts. " +
                  "If sources disagree, explain the disagreement.\n\n" +
                  sources.map((source, index) =>
                    `[${index + 1}] ${source.title}\n` +
                    `Website: ${source.domain}\n` +
                    `URL: ${source.url}\n` +
                    `Information: ${source.snippet}`
                  ).join("\n\n");
              } else {
                send({ type: "notice", value: "No web results were found." });
              }
            } catch (error) {
              console.error("Tavily search error:", error);
              send({ type: "notice", value: "Web search failed. Answering without search results." });
            }
          }
        }

        const systemInstruction = [
          `You are Star-AI ${version}${version === "5.0" ? " Beta" : ""}, an AI assistant.`,
          `Refer to yourself as Star-AI ${version}${version === "5.0" ? " Beta" : ""}.`,
          version === "5.0"
            ? "You are an experimental Beta assistant. Be helpful when a request succeeds; the Worker separately applies the configured experimental success rate."
            : version === "4.0"
              ? "You are an advanced assistant. Analyze carefully and state uncertainty."
              : version === "3.0"
                ? "Provide thoughtful answers with clear explanations and reliable reasoning."
                : "Provide fast, direct and practical answers.",
          "Answer helpfully and accurately. Use Markdown when useful.",
          language,
          typeof body.assistantName === "string"
            ? `The user prefers to call you ${body.assistantName.slice(0, 40)}.`
            : "",
          typeof body.userName === "string"
            ? `The user's display name is ${body.userName.slice(0, 80)}.`
            : "",
          body.style === "short" ? "Keep answers concise." : "",
          body.style === "detailed" ? "Give thorough, well-structured answers." : "",
          body.mode === "coding"
            ? "For coding tasks, provide runnable code and explain important details."
            : "",
          body.mode === "study"
            ? "Teach simply, step by step, with examples."
            : "",
          Array.isArray(body.memories)
            ? "Relevant user memories:\n" + body.memories
                .filter((item) => typeof item === "string")
                .slice(0, 20)
                .map((item) => item.slice(0, 1000))
                .join("\n")
            : "",
          searchContext,
          searchContext
            ? "Base current and factual claims on the search results when relevant. Do not claim to have searched if no results were returned. The application will display source links separately."
            : "",
        ].filter(Boolean).join("\n\n");

        const contents = body.messages
          .filter((message) =>
            message &&
            (message.role === "user" || message.role === "assistant") &&
            typeof message.content === "string"
          )
          .slice(-100)
          .map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content.slice(0, 60000) }],
          }));

        if (!contents.length) {
          send({ type: "error", value: "No valid messages were provided." });
          return;
        }

        const model = String(env.STAR_AI_CHAT_MODEL || CHAT_MODEL).trim();
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;
        const upstream = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: { temperature: body.style === "creative" ? 0.9 : 0.7 },
          }),
          signal: request.signal,
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          console.error("Gemini chat error:", upstream.status, detail);
          send({
            type: "error",
            value: upstream.status === 429
              ? "Gemini request limit reached. Please try again later."
              : "Gemini could not process the request.",
          });
          return;
        }

        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n");
          buffer = events.pop() || "";

          for (const eventLine of events) {
            if (!eventLine.startsWith("data:")) continue;
            const raw = eventLine.slice(5).trim();
            if (!raw || raw === "[DONE]") continue;

            try {
              const chunk = JSON.parse(raw);
              const text = (chunk.candidates || [])
                .flatMap((candidate) => candidate.content?.parts || [])
                .map((part) => part.text || "")
                .join("");
              if (text) send({ type: "text", value: text });

              const reason = chunk.promptFeedback?.blockReason;
              if (reason) send({ type: "error", value: "Gemini blocked this request: " + reason });
            } catch {
              // Ignore incomplete streaming events.
            }
          }
        }

        if (buffer.startsWith("data:")) {
          try {
            const chunk = JSON.parse(buffer.slice(5).trim());
            const text = (chunk.candidates || [])
              .flatMap((candidate) => candidate.content?.parts || [])
              .map((part) => part.text || "")
              .join("");
            if (text) send({ type: "text", value: text });
          } catch {
            // Ignore an incomplete final event.
          }
        }

        send({ type: "done" });
      } catch (error) {
        console.error("Worker chat error:", error);
        if (error?.name !== "AbortError") {
          send({ type: "error", value: "Something went wrong. Please try again." });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(output, {
    headers: {
      ...CORS,
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (url.pathname === "/" && request.method === "GET") {
      return json({
        service: "Star-AI Gemini API",
        status: "online",
        chatModel: env.STAR_AI_CHAT_MODEL || CHAT_MODEL,
        imageModel: env.STAR_AI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
        webSearch: Boolean(env.TAVILY_API_KEY),
        imageGeneration: Boolean(env.GEMINI_API_KEY),
      });
    }

    if (url.pathname === IMAGE_PATH) {
      return handleImageGeneration(request, env);
    }

    if (url.pathname === CHAT_PATH) {
      return handleChat(request, env);
    }

    return json({ error: "Not found", path: url.pathname }, 404);
  },
};
