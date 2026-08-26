import { ArrowUp, FileText, Globe, ImageIcon, Mic, Paperclip, Sheet, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ModeSelector } from "./ModeSelector";
import { VERSIONS } from "@/lib/ai/versions";
import {
  ACCEPTED,
  FileTooLargeError,
  UnreadableFileError,
  formatSize,
  toAttachment,
} from "@/lib/star/files";
import { useDictation } from "@/lib/star/speech";
import { useStar } from "@/lib/star/store";
import type { Attachment } from "@/lib/star/types";
import { cn } from "@/lib/utils";

const MAX_CHARS = 24000;
const MAX_FILES = 6;

type Uploading = { id: string; name: string; progress: number };

export function Composer() {
  const { version, settings, stream, sendMessage, stopGenerating, webSearch, setWebSearch } =
    useStar();
  const meta = VERSIONS[version];
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploads, setUploads] = useState<Uploading[]>([]);
  const [dragging, setDragging] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const baseText = useRef("");

  const dictation = useDictation(({ transcript, isFinal }) => {
    setText(`${baseText.current}${baseText.current ? " " : ""}${transcript}`.slice(0, MAX_CHARS));
    if (isFinal) baseText.current = `${baseText.current} ${transcript}`.trim();
  });

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
  }, [text]);

  useEffect(() => {
    if (!stream.busy) taRef.current?.focus();
  }, [stream.busy]);

  const submit = () => {
    if (stream.busy) return;
    if (!text.trim() && attachments.length === 0) return;
    if (text.length > MAX_CHARS) {
      toast.error("Your message is too long. Please shorten it.");
      return;
    }
    if (dictation.listening) dictation.stop();
    void sendMessage(text, attachments);
    setText("");
    baseText.current = "";
    setAttachments([]);
  };

  const onFiles = async (files: FileList | File[] | null) => {
    if (!files) return;
    const list = Array.from(files);
    if (!list.length) return;
    if (attachments.length + list.length > MAX_FILES) {
      toast.error(`You can attach up to ${MAX_FILES} files per message.`);
      return;
    }

    for (const file of list) {
      const tempId = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
      setUploads((u) => [...u, { id: tempId, name: file.name, progress: 0 }]);
      try {
        const a = await toAttachment(file, (p) =>
          setUploads((u) => u.map((x) => (x.id === tempId ? { ...x, progress: p } : x))),
        );
        if (a.unsupported) {
          toast.warning(`${a.name} can't be read directly — paste its content instead.`);
        }
        setAttachments((prev) => [...prev, a]);
      } catch (err) {
        if (err instanceof FileTooLargeError) toast.error(`${file.name} is larger than 12 MB.`);
        else if (err instanceof UnreadableFileError)
          toast.error(`${file.name} could not be read. It may be corrupted or protected.`);
        else toast.error("Your file could not be processed.");
      } finally {
        setUploads((u) => u.filter((x) => x.id !== tempId));
      }
    }
  };

  const toggleMic = () => {
    if (dictation.listening) {
      dictation.stop();
      return;
    }
    baseText.current = text.trim();
    if (!dictation.start()) toast.info("Voice input isn't supported in this browser.");
  };

  return (
    <div
      className="mx-auto w-full max-w-3xl px-3 pb-4 sm:px-4 sm:pb-6"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void onFiles(e.dataTransfer.files);
      }}
    >
      {(attachments.length > 0 || uploads.length > 0) && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <div key={a.id} className="glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
              {a.dataUrl && a.mimeType.startsWith("image/") ? (
                <img src={a.dataUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
              ) : a.kind === "data" ? (
                <Sheet className="h-4 w-4 text-accent" />
              ) : a.mimeType.startsWith("image/") ? (
                <ImageIcon className="h-4 w-4 text-accent" />
              ) : (
                <FileText className="h-4 w-4 text-accent" />
              )}
              <div className="min-w-0">
                <p className="max-w-40 truncate font-medium">{a.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatSize(a.size)}
                  {a.summary ? ` · ${a.summary}` : ""}
                </p>
              </div>
              <button
                onClick={() => setAttachments((p) => p.filter((x) => x.id !== a.id))}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${a.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {uploads.map((u) => (
            <div key={u.id} className="glass w-44 rounded-xl px-3 py-2 text-xs">
              <p className="truncate font-medium">{u.name}</p>
              <div
                className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary"
                role="progressbar"
                aria-valuenow={u.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Processing ${u.name}`}
              >
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all"
                  style={{ width: `${Math.max(u.progress, 8)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          "glass rounded-3xl p-2 shadow-glow transition-all duration-500",
          dragging && "ring-2 ring-primary",
          dictation.listening && "ring-2 ring-accent",
        )}
      >
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={(e) => {
            const files = Array.from(e.clipboardData.files);
            if (files.length) {
              e.preventDefault();
              void onFiles(files);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          aria-label="Message Star-AI"
          placeholder={
            dictation.listening ? "Listening…" : `Message Star-AI ${version}…`
          }
          className="max-h-60 w-full resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap items-center gap-1 px-1 pb-0.5">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => {
              void onFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            onClick={toggleMic}
            className={cn(
              "rounded-full p-2 transition-colors hover:bg-secondary hover:text-foreground",
              dictation.listening ? "bg-accent/20 text-accent" : "text-muted-foreground",
            )}
            aria-label={dictation.listening ? "Stop voice input" : "Start voice input"}
            aria-pressed={dictation.listening}
          >
            <Mic className={cn("h-4 w-4", dictation.listening && "animate-pulse")} />
          </button>

          <ModeSelector />

          <button
            onClick={() => setWebSearch(!webSearch)}
            aria-pressed={webSearch}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              webSearch
                ? "border-transparent bg-brand-gradient text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-secondary",
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Web</span>
          </button>

          <span className="ml-1 hidden truncate rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground lg:inline">
            {meta.badge}
            {meta.advanced ? " · Advanced" : ""} · {settings.style}
          </span>

          <span
            className={cn(
              "ml-auto mr-1 text-[11px] tabular-nums",
              text.length > MAX_CHARS ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {text.length}/{MAX_CHARS}
          </span>

          {stream.busy ? (
            <button
              onClick={stopGenerating}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground transition-transform hover:scale-105"
              aria-label="Stop generating"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!text.trim() && attachments.length === 0}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-soft transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Star-AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
