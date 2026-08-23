import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { RESPONSE_STYLES, VERSION_LIST, type ResponseStyle, type StarVersion } from "@/lib/ai/versions";
import { useStar } from "@/lib/star/store";
import { cn } from "@/lib/utils";

const SECTIONS = [
  "General",
  "Appearance",
  "AI",
  "Memory",
  "Privacy",
  "Notifications",
  "Shortcuts",
  "About",
] as const;
type Section = (typeof SECTIONS)[number];

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className={cn(
        "h-6 w-11 rounded-full p-0.5 transition-colors",
        on ? "bg-brand-gradient" : "bg-secondary",
      )}
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full bg-background transition-transform",
          on && "translate-x-5",
        )}
      />
    </button>
  );
}

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, updateSettings, memories, addMemory, deleteMemory, clearMemories, conversations } =
    useStar();
  const [section, setSection] = useState<Section>("General");
  const [memoryDraft, setMemoryDraft] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm">
      <div className="glass flex h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-glow md:flex-row">
        <nav className="scrollbar-thin flex shrink-0 gap-1 overflow-x-auto border-b border-border p-3 md:w-48 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
          <p className="hidden px-2 pb-2 font-display text-sm font-semibold md:block">Settings</p>
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={cn(
                "whitespace-nowrap rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors",
                section === s ? "bg-brand-gradient text-primary-foreground" : "hover:bg-secondary",
              )}
            >
              {s}
            </button>
          ))}
        </nav>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{section}</h2>
            <button
              onClick={onClose}
              className="rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-secondary"
            >
              Done
            </button>
          </div>

          {section === "General" && (
            <div>
              <Row label="Conversations stored" hint="Saved on this device">
                <span className="text-sm tabular-nums">{conversations.length}</span>
              </Row>
              <Row label="Send with Enter" hint="Shift + Enter adds a new line">
                <span className="text-xs text-muted-foreground">Always on</span>
              </Row>
              <Row label="Language" hint="Star-AI replies in the language you write in">
                <span className="text-xs text-muted-foreground">Automatic</span>
              </Row>
            </div>
          )}

          {section === "Appearance" && (
            <div>
              <Row label="Color mode">
                <div className="flex gap-1 rounded-xl border border-border p-1">
                  {(["dark", "light", "system"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => updateSettings({ colorMode: m })}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs capitalize",
                        settings.colorMode === m && "bg-brand-gradient text-primary-foreground",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label="Background intensity">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.backgroundIntensity}
                  onChange={(e) => updateSettings({ backgroundIntensity: Number(e.target.value) })}
                  className="w-40 accent-[var(--primary)]"
                />
              </Row>
              <Row label="Animations">
                <Toggle on={settings.animations} onChange={(v) => updateSettings({ animations: v })} />
              </Row>
              <Row label="Particle effects">
                <Toggle on={settings.particles} onChange={(v) => updateSettings({ particles: v })} />
              </Row>
            </div>
          )}

          {section === "AI" && (
            <div>
              <Row label="Default version" hint="Used when Star-AI starts">
                <select
                  value={settings.defaultVersion}
                  onChange={(e) =>
                    updateSettings({ defaultVersion: e.target.value as StarVersion })
                  }
                  className="rounded-xl border border-border bg-popover px-3 py-1.5 text-xs"
                >
                  {VERSION_LIST.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </Row>
              <Row label="Response style" hint="Applied to the AI system configuration">
                <select
                  value={settings.style}
                  onChange={(e) => updateSettings({ style: e.target.value as ResponseStyle })}
                  className="rounded-xl border border-border bg-popover px-3 py-1.5 text-xs"
                >
                  {RESPONSE_STYLES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} — {s.hint}
                    </option>
                  ))}
                </select>
              </Row>
              <Row label="Streaming responses" hint="Show text as it is generated">
                <Toggle on={settings.streaming} onChange={(v) => updateSettings({ streaming: v })} />
              </Row>
              <Row label="Model configuration" hint="Chosen on the server per version">
                <span className="text-xs text-muted-foreground">STAR_AI_2_MODEL / STAR_AI_3_MODEL</span>
              </Row>
            </div>
          )}

          {section === "Memory" && (
            <div>
              <Row label="Enable memory" hint="Let Star-AI remember useful details">
                <Toggle
                  on={settings.memoryEnabled}
                  onChange={(v) => updateSettings({ memoryEnabled: v })}
                />
              </Row>
              <div className="mt-4 flex gap-2">
                <input
                  value={memoryDraft}
                  onChange={(e) => setMemoryDraft(e.target.value)}
                  placeholder="Remember that…"
                  className="flex-1 rounded-xl border border-border bg-transparent px-3 py-2 text-xs outline-none"
                />
                <button
                  onClick={() => {
                    addMemory(memoryDraft);
                    setMemoryDraft("");
                  }}
                  className="rounded-xl bg-brand-gradient px-3 py-2 text-xs font-medium text-primary-foreground"
                >
                  Save
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {memories.length === 0 && (
                  <p className="text-xs text-muted-foreground">No saved memories yet.</p>
                )}
                {memories.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-2"
                  >
                    <p className="text-xs">{m.text}</p>
                    <button
                      onClick={() => deleteMemory(m.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete memory"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {memories.length > 0 && (
                <button
                  onClick={() => {
                    clearMemories();
                    toast.success("All memories cleared.");
                  }}
                  className="mt-4 rounded-xl border border-destructive/50 px-3 py-1.5 text-xs text-destructive"
                >
                  Clear all memories
                </button>
              )}
              <p className="mt-4 text-[11px] text-muted-foreground">
                Avoid storing passwords, financial details or other sensitive information.
              </p>
            </div>
          )}

          {section === "Privacy" && (
            <div>
              <Row label="Data location" hint="Conversations stay in this browser">
                <span className="text-xs text-muted-foreground">Local device</span>
              </Row>
              <Row label="API keys" hint="Never exposed to the browser">
                <span className="text-xs text-muted-foreground">Server-side only</span>
              </Row>
              <button
                onClick={() => {
                  window.localStorage.removeItem("star-ai:state:v1");
                  window.location.reload();
                }}
                className="mt-4 rounded-xl border border-destructive/50 px-3 py-1.5 text-xs text-destructive"
              >
                Delete all local data
              </button>
            </div>
          )}

          {section === "Notifications" && (
            <div>
              <Row label="Completion alerts" hint="Notify when a long response finishes">
                <Toggle
                  on={settings.notifications}
                  onChange={(v) => updateSettings({ notifications: v })}
                />
              </Row>
            </div>
          )}

          {section === "Shortcuts" && (
            <div className="space-y-2 text-xs">
              {[
                ["Enter", "Send message"],
                ["Shift + Enter", "New line"],
                ["Ctrl / ⌘ + K", "Search conversations"],
                ["Ctrl / ⌘ + N", "New chat"],
                ["Esc", "Stop generating"],
              ].map(([k, d]) => (
                <div key={k} className="flex items-center justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">{d}</span>
                  <kbd className="rounded-md border border-border px-2 py-1 font-mono text-[11px]">
                    {k}
                  </kbd>
                </div>
              ))}
            </div>
          )}

          {section === "About" && (
            <div className="space-y-3 text-sm">
              <p className="font-display text-xl font-semibold text-brand-gradient">Star-AI</p>
              <p className="text-xs text-muted-foreground">
                Two generations of the same assistant. Star-AI 2.0 is tuned for fast everyday work;
                Star-AI 3.0 adds deeper reasoning, file and image understanding, and long-form work.
              </p>
              <p className="text-xs text-muted-foreground">
                Model selection happens entirely on the server via the STAR_AI_2_MODEL and
                STAR_AI_3_MODEL environment variables.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
