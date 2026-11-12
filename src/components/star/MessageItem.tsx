import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  ImageIcon,
  Info,
  Pencil,
  RefreshCw,
  Sheet,
  Square,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Markdown } from "./Markdown";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { tts } from "@/lib/star/speech";
import type { Attachment, Message } from "@/lib/star/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/star/i18n";

function time(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function AttachmentIcon({ a }: { a: Attachment }) {
  if (a.kind === "image" || a.mimeType.startsWith("image/"))
    return <ImageIcon className="h-3.5 w-3.5 text-accent" />;
  if (a.kind === "data") return <Sheet className="h-3.5 w-3.5 text-accent" />;
  return <FileText className="h-3.5 w-3.5 text-accent" />;
}

export function MessageItem({
  message,
  streaming,
  onRegenerate,
  onEdit,
  autoSpeak = false,
}: {
  message: Message;
  streaming: boolean;
  onRegenerate: () => void;
  onEdit: (text: string) => void;
  autoSpeak?: boolean;
}) {
  const { t, dir } = useI18n();
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const isUser = message.role === "user";

  const copy = () => {
    void navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const toggleSpeak = () => {
    if (speaking) {
      tts.stop();
      setSpeaking(false);
      return;
    }
    if (tts.speak(message.content, () => setSpeaking(false))) setSpeaking(true);
  };

  useEffect(() => {
    if (!autoSpeak || isUser || streaming || !message.content.trim() || message.error) return;
    if (tts.speak(message.content, () => setSpeaking(false))) setSpeaking(true);
    return () => tts.stop();
    // Speak once when the response finishes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming]);

  if (isUser) {
    return (
      <div dir={dir} className="group flex flex-col items-end gap-1.5">
        {!!message.attachments?.length && (
          <div className="flex flex-wrap justify-end gap-2">
            {message.attachments.map((a) => (
              <div
                key={a.id}
                className="glass flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs"
              >
                <AttachmentIcon a={a} />
                <span className="max-w-40 truncate">{a.name}</span>
                {a.summary && (
                  <span className="hidden text-[10px] text-muted-foreground sm:inline">
                    {a.summary}
                  </span>
                )}
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
              aria-label={t("Edit your message")}
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

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <span>{time(message.createdAt)}</span>
          <button onClick={copy} className="hover:text-foreground" aria-label={t("Copy message")}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setEditing((e) => !e)}
            className="hover:text-foreground"
            aria-label={t("Edit message")}
          >
            {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  const empty = !message.content.trim();
  const hasArtifacts = Boolean(message.generatedImages?.length || message.generatedFiles?.length);

  return (
    <div dir={dir} className="group flex flex-col gap-2">
      {message.reasoning && (
        <details className="glass rounded-xl px-3 py-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none font-medium">{t("Thought process")}</summary>
          <p className="mt-2 whitespace-pre-wrap">{message.reasoning}</p>
        </details>
      )}

      {message.notice && (
        <p className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" /> {message.notice}
        </p>
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
      ) : !empty ? (
        <div className="max-w-full text-sm">
          <Markdown content={message.content} />
        </div>
      ) : null}

      {!!message.generatedImages?.length && (
        <div className="grid gap-3">
          {message.generatedImages.map((image) => (
            <div key={image.id} className="glass max-w-full overflow-hidden rounded-2xl border border-border/70 p-2">
              <a href={image.dataUrl} target="_blank" rel="noreferrer" aria-label="Open generated image">
                <img
                  src={image.dataUrl}
                  alt="Image generated by Star-AI"
                  className="h-auto max-h-[640px] w-full rounded-xl object-contain"
                  loading="lazy"
                />
              </a>
              <div className="flex items-center justify-between gap-3 px-1 pt-2 text-xs">
                <span className="min-w-0 truncate text-muted-foreground">{image.name}</span>
                <a
                  href={image.dataUrl}
                  download={image.name}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 font-medium text-primary-foreground"
                >
                  <Download className="h-3.5 w-3.5" /> Save Image
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {!!message.generatedFiles?.length && (
        <div className="grid gap-2">
          {message.generatedFiles.map((file) => (
            <div key={file.id} className="glass flex max-w-full items-center gap-3 rounded-2xl border border-border/70 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{file.name}</p>
                <p className="text-[11px] text-muted-foreground">{file.kind.toUpperCase()} · {file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`}</p>
              </div>
              <a
                href={file.dataUrl}
                download={file.name}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 text-xs font-medium text-primary-foreground"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
            </div>
          ))}
        </div>
      )}

      {!!message.sources?.length && (
        <div className="glass rounded-2xl p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Sources
          </p>
          <ol className="grid gap-2 sm:grid-cols-2">
            {message.sources.map((s, i) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block rounded-xl border border-border px-3 py-2 transition-colors hover:bg-secondary"
                >
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    <span className="text-muted-foreground">[{i + 1}]</span>
                    <span className="truncate">{s.title}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                    {s.domain}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}

      {!streaming && !message.error && (!empty || hasArtifacts) && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <span>{time(message.createdAt)}</span>
          <span className={cn("rounded-full border border-border px-1.5 py-0.5")}>
            Star-AI {message.version}
          </span>
          <button onClick={copy} className="hover:text-foreground" aria-label={t("Copy response")}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onRegenerate}
            className="hover:text-foreground"
            aria-label={t("Regenerate response")}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          {tts.supported() && (
            <button
              onClick={toggleSpeak}
              className="hover:text-foreground"
              aria-label={speaking ? t("Stop reading aloud") : t("Read response aloud")}
            >
              {speaking ? (
                <Square className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
