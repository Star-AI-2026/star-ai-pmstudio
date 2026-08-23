import { VERSION_LIST } from "@/lib/ai/versions";

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
      <div className="glass scrollbar-thin max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 shadow-glow">
        <h2 className="font-display text-lg font-semibold">Help</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Star-AI ships in two generations. Switch anytime from the sidebar — the theme, animations
          and AI configuration all change with it.
        </p>

        <div className="mt-5 space-y-4">
          {VERSION_LIST.map((v) => (
            <div key={v.id} className="rounded-2xl border border-border p-4">
              <p className="text-sm font-semibold text-brand-gradient">{v.name}</p>
              <p className="text-xs text-muted-foreground">{v.subtitle}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {v.capabilities.map((c) => (
                  <span key={c} className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Attachments</p>
          <p>
            Images, PDFs and text-based files (TXT, MD, CSV, JSON) are sent to the AI. Other formats
            are flagged before sending so nothing fails silently.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-brand-gradient py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Close
        </button>
      </div>
    </div>
  );
}
