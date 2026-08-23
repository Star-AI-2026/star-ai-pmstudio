import { useEffect, useState } from "react";

import { ChatView } from "./ChatView";
import { HelpDialog } from "./HelpDialog";
import { SettingsDialog } from "./SettingsDialog";
import { Sidebar } from "./Sidebar";
import { VersionBackground } from "./VersionBackground";
import { useStar } from "@/lib/star/store";
import { cn } from "@/lib/utils";

export function StarApp() {
  const { hydrated, newConversation, stopGenerating, stream } = useStar();
  const [drawer, setDrawer] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        newConversation();
      }
      if (e.key === "Escape" && stream.busy) stopGenerating();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [newConversation, stopGenerating, stream.busy]);

  return (
    <div className="relative flex h-dvh w-full overflow-hidden">
      <VersionBackground />

      <div className="hidden md:block">
        {hydrated && (
          <Sidebar onOpenSettings={() => setSettingsOpen(true)} onOpenHelp={() => setHelpOpen(true)} />
        )}
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          drawer ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          onClick={() => setDrawer(false)}
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity",
            drawer ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-transform duration-300",
            drawer ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {hydrated && (
            <Sidebar
              onClose={() => setDrawer(false)}
              onOpenSettings={() => {
                setDrawer(false);
                setSettingsOpen(true);
              }}
              onOpenHelp={() => {
                setDrawer(false);
                setHelpOpen(true);
              }}
            />
          )}
        </div>
      </div>

      <main className="flex min-w-0 flex-1">
        <ChatView onOpenSidebar={() => setDrawer(true)} />
      </main>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
