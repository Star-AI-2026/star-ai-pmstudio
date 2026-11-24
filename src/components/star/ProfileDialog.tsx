import { Loader2, LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth/AuthProvider";
import { useI18n } from "@/lib/star/i18n";

const field =
  "w-full rounded-xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60";

export function ProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, profile, displayName, updateDisplayName, signOut } = useAuth();
  const { t, dir, language } = useI18n();
  const [name, setName] = useState(displayName);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setName(displayName);
  }, [open, displayName]);

  if (!open) return null;

  const save = async () => {
    setBusy(true);
    const { error } = await updateDisplayName(name);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(t("Display name saved."));
    onClose();
  };

  const created = profile?.created_at ? new Date(profile.created_at).toLocaleDateString(language === "fa" ? "fa-IR" : "en-US") : "—";
  const provider = profile?.provider === "google" ? "Google" : t("Email and password");

  return (
    <div dir={dir} className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="glass relative w-full max-w-md rounded-3xl p-6 shadow-glow">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{t("Edit profile")}</h2>
          <button
            onClick={onClose}
            aria-label={t("Close")}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{t("Display name")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label={t("Display name")}
              className={field}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{t("Email")}</label>
            <input value={user?.email ?? ""} dir="ltr" disabled className={field} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <p>{t("Sign-in method")}: {provider}</p>
            <p>{t("Account created")}: {created}</p>
          </div>
        </div>

        <button
          onClick={() => void save()}
          disabled={busy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} {t("Save changes")}
        </button>

        <button
          onClick={() => void signOut()}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-input px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> {t("Log out")}
        </button>
      </div>
    </div>
  );
}
