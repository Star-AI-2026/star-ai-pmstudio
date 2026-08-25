import type { Conversation } from "./types";

export function download(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "chat";
}

export function toMarkdown(c: Conversation) {
  const lines = [
    `# ${c.title}`,
    "",
    `_Star-AI ${c.version} · ${new Date(c.createdAt).toLocaleString()}_`,
    "",
  ];
  for (const m of c.messages) {
    lines.push(`## ${m.role === "user" ? "You" : `Star-AI ${m.version}`}`, "", m.content, "");
    if (m.sources?.length) {
      lines.push("**Sources**", "");
      m.sources.forEach((s, i) => lines.push(`${i + 1}. [${s.title}](${s.url})`));
      lines.push("");
    }
  }
  return lines.join("\n");
}

export function toPlainText(c: Conversation) {
  return c.messages
    .map((m) => `${m.role === "user" ? "You" : `Star-AI ${m.version}`}:\n${m.content}`)
    .join("\n\n---\n\n");
}

export function exportConversation(c: Conversation, format: "md" | "txt" | "json" | "pdf") {
  const name = slug(c.title);
  if (format === "md") return download(`${name}.md`, toMarkdown(c), "text/markdown;charset=utf-8");
  if (format === "txt") return download(`${name}.txt`, toPlainText(c));
  if (format === "json")
    return download(`${name}.json`, JSON.stringify(c, null, 2), "application/json");

  // PDF via the browser print dialog — no extra dependency, works offline.
  const win = window.open("", "_blank", "width=820,height=900");
  if (!win) return;
  const esc = (s: string) =>
    s.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[ch] ?? ch);
  win.document.write(`<!doctype html><html><head><title>${esc(c.title)}</title>
<style>body{font:14px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#111}
h1{font-size:22px} .who{font-weight:600;margin-top:22px;color:#4338ca} pre{white-space:pre-wrap;background:#f4f4f5;padding:12px;border-radius:8px}
.msg{white-space:pre-wrap}</style></head><body>
<h1>${esc(c.title)}</h1><p>Star-AI ${c.version} — ${new Date(c.createdAt).toLocaleString()}</p>
${c.messages
  .map(
    (m) =>
      `<div class="who">${m.role === "user" ? "You" : `Star-AI ${m.version}`}</div><div class="msg">${esc(m.content)}</div>`,
  )
  .join("")}
</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
