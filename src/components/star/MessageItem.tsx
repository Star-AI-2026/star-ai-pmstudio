import {
  AlertTriangle,
  Check,
  Copy,
  FileText,
  ImageIcon,
  Pencil,
  RefreshCw,
  X,
} from "lucide-react";
import { useState } from "react";

import { Markdown } from "./Markdown";
import { ThinkingIndicator } from "./ThinkingIndicator";
import type { Message } from "@/lib/star/types";
import { cn } from "@/lib/utils";

function time(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageItem({
  message,
  streaming,
  onRegenerate,
  onEdit,
}: {
  message: Message;
  streaming: boolean;
  onRegenerate: () => void;
  onEdit: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const isUser = message.role === "user";

  const copy = () => {
    void navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (isUser) {
    return (
      <div className="group flex flex-col items-end gap-1.5">
        {!!message.attachments?.length && (
          <div className="flex flex-wrap justify-end gap-2">
            {message.attachments.map((a) => (
              <div
                key={a.id}
                className="glass flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs"
              >
                {a.mimeType.startsWith("image/") ? (
                  <ImageIcon className="h-3.5 w-3.5 text-accent" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-accent" />
                )}
                <span className="max-w-40 truncate">{a.name}</span>
              </div>
            ))}
          </div>
        )}

        {editing ? (
          <div className="glass w-full max-w-2xl rounded-2xl p-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-sm outline-none"
            />
            <div className="mt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  setEditing(false);
                  setDraft(message.content);
                }}
                className="rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  onEdit(draft);
                }}
                className="rounded-lg bg-brand-gradient px-3 py-1.5 font-medium text-primary-foreground"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-gradient px-4 py-2.5 text-sm text-primary-foreground shadow-soft">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <span>{time(message.createdAt)}</span>
          <button onClick={copy} className="hover:text-foreground" aria-label="Copy message">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setEditing((e) => !e)}
            className="hover:text-foreground"
            aria-label="Edit message"
          >
            {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  const empty = !message.content.trim();

  return (
    <div className="group flex flex-col gap-2">
      {message.reasoning && (
        <details className="glass rounded-xl px-3 py-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none font-medium">Thought process</summary>
          <p className="mt-2 whitespace-pre-wrap">{message.reasoning}</p>
        </details>
      )}

      {message.error ? (
        <div className="flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p>{message.error}</p>
            <button
              onClick={onRegenerate}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-secondary"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </div>
        </div>
      ) : empty && streaming ? (
        <ThinkingIndicator />
      ) : (
        <div className="max-w-full text-sm">
          <Markdown content={message.content} />
        </div>
      )}

      {!streaming && !message.error && !empty && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <span>{time(message.createdAt)}</span>
          <span className={cn("rounded-full border border-border px-1.5 py-0.5")}>
            Star-AI {message.version}
          </span>
          <button onClick={copy} className="hover:text-foreground" aria-label="Copy response">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onRegenerate}
            className="hover:text-foreground"
            aria-label="Regenerate response"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
