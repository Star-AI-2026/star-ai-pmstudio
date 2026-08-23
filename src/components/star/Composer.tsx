import { ArrowUp, FileText, ImageIcon, Mic, Paperclip, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { VERSIONS } from "@/lib/ai/versions";
import { ACCEPTED, FileTooLargeError, formatSize, toAttachment } from "@/lib/star/files";
import { useStar } from "@/lib/star/store";
import type { Attachment } from "@/lib/star/types";
import { cn } from "@/lib/utils";

const MAX_CHARS = 24000;

export function Composer() {
  const { version, settings, stream, sendMessage, stopGenerating } = useStar();
  const meta = VERSIONS[version];
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
  }, [text]);

  const submit = () => {
    if (stream.busy) return;
    if (!text.trim() && attachments.length === 0) return;
    if (text.length > MAX_CHARS) {
      toast.error("Your message is too long. Please shorten it.");
      return;
    }
    void sendMessage(text, attachments);
    setText("");
    setAttachments([]);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files).slice(0, 6)) {
      try {
        const a = await toAttachment(file);
        if (a.unsupported) {
          toast.warning(`${a.name} can't be read directly — Star-AI will ask for pasted content.`);
        }
        setAttachments((prev) => [...prev, a]);
      } catch (err) {
        if (err instanceof FileTooLargeError) toast.error(`${file.name} is larger than 12 MB.`);
        else toast.error("Your file could not be processed.");
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-4 sm:px-4 sm:pb-6">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <div key={a.id} className="glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
              {a.dataUrl && a.mimeType.startsWith("image/") ? (
                <img src={a.dataUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
              ) : a.mimeType.startsWith("image/") ? (
                <ImageIcon className="h-4 w-4 text-accent" />
              ) : (
                <FileText className="h-4 w-4 text-accent" />
              )}
              <div className="min-w-0">
                <p className="max-w-40 truncate font-medium">{a.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatSize(a.size)}
                  {a.unsupported ? " · unsupported type" : ""}
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
        </div>
      )}

      <div className="glass rounded-3xl p-2 shadow-glow transition-all duration-500">
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={`Message Star-AI ${version}…`}
          className="max-h-60 w-full resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center gap-1 px-1 pb-0.5">
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
            onClick={() => toast.info("Voice input is coming soon to Star-AI.")}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>

          <span className="ml-1 hidden truncate rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground sm:inline">
            {meta.badge}
            {meta.advanced ? " · Advanced Mode" : ""} · {settings.style}
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
