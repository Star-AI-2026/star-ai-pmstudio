/**
 * Web search abstraction.
 *
 * Star-AI never fabricates sources. If no provider credential is configured,
 * `getWebSearchProvider()` returns null and the caller must tell the user that
 * Web Search is not configured yet.
 *
 * Configure ONE of:
 *   TAVILY_API_KEY   -> Tavily search
 *   BRAVE_API_KEY    -> Brave Search API
 */

export type SearchResult = {
  title: string;
  url: string;
  domain: string;
  snippet: string;
};

export interface WebSearchProvider {
  readonly id: string;
  search(query: string, signal?: AbortSignal): Promise<SearchResult[]>;
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

class TavilyProvider implements WebSearchProvider {
  readonly id = "tavily";
  #key: string;
  constructor(key: string) {
    this.#key = key;
  }
  async search(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.#key}` },
      body: JSON.stringify({ query, max_results: 6, search_depth: "basic" }),
      signal: signal ?? null,
    });
    if (!res.ok) throw new Error("search-failed");
    const json = (await res.json()) as { results?: { title?: string; url?: string; content?: string }[] };
    return (json.results ?? [])
      .filter((r) => r.url)
      .map((r) => ({
        title: r.title || domainOf(r.url!),
        url: r.url!,
        domain: domainOf(r.url!),
        snippet: (r.content ?? "").slice(0, 400),
      }));
  }
}

class BraveProvider implements WebSearchProvider {
  readonly id = "brave";
  #key: string;
  constructor(key: string) {
    this.#key = key;
  }
  async search(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", "6");
    const res = await fetch(url, {
      headers: { Accept: "application/json", "X-Subscription-Token": this.#key },
      signal: signal ?? null,
    });
    if (!res.ok) throw new Error("search-failed");
    const json = (await res.json()) as {
      web?: { results?: { title?: string; url?: string; description?: string }[] };
    };
    return (json.web?.results ?? [])
      .filter((r) => r.url)
      .map((r) => ({
        title: r.title || domainOf(r.url!),
        url: r.url!,
        domain: domainOf(r.url!),
        snippet: (r.description ?? "").replace(/<[^>]+>/g, "").slice(0, 400),
      }));
  }
}

export function getWebSearchProvider(): WebSearchProvider | null {
  const tavily = process.env["TAVILY_API_KEY"];
  if (tavily) return new TavilyProvider(tavily);
  const brave = process.env["BRAVE_API_KEY"];
  if (brave) return new BraveProvider(brave);
  return null;
}

export function buildSearchContext(query: string, results: SearchResult[]): string {
  return [
    "Live web search results for the user's latest question.",
    `Query: ${query}`,
    "",
    ...results.map(
      (r, i) => `[${i + 1}] ${r.title} — ${r.domain}\n${r.url}\n${r.snippet}`,
    ),
    "",
    "Use ONLY these results when you claim something comes from the web, and cite them as [1], [2]... Never invent sources or URLs.",
  ].join("\n");
}
