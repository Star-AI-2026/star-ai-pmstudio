import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { StarLogo } from "@/components/star/StarLogo";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "تغییر رمز عبور — Star-AI" },
      {
        name: "description",
        content: "رمز عبور جدید حساب Star-AI خود را انتخاب کنید و دوباره وارد شوید.",
      },
      { property: "og:title", content: "تغییر رمز عبور — Star-AI" },
      {
        property: "og:description",
        content: "صفحه انتخاب رمز عبور جدید برای حساب کاربری Star-AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordRoute,
});

const field =
  "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

function ResetPasswordRoute() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    if (password !== confirm) {
      toast.error("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("تغییر رمز عبور انجام نشد. لینک بازیابی را دوباره درخواست کنید.");
      return;
    }
    toast.success("رمز عبور با موفقیت تغییر کرد.");
    void navigate({ to: "/", replace: true });
  };

  return (
    <div dir="rtl" className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.12]" />
      <form onSubmit={submit} className="glass relative w-full max-w-md space-y-3 rounded-3xl p-7 shadow-glow">
        <div className="flex flex-col items-center text-center">
          <StarLogo className="h-10 w-10 text-primary drop-shadow-[0_0_18px_var(--glow)]" />
          <h1 className="mt-3 text-lg font-semibold">انتخاب رمز عبور جدید</h1>
          <p className="mt-1 text-xs text-muted-foreground">رمز عبور تازه‌ای برای حساب Star-AI خود بسازید.</p>
        </div>
        <input
          type="password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور جدید"
          aria-label="رمز عبور جدید"
          autoComplete="new-password"
          className={field}
        />
        <input
          type="password"
          dir="ltr"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="تکرار رمز عبور جدید"
          aria-label="تکرار رمز عبور جدید"
          autoComplete="new-password"
          className={field}
        />
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} ذخیره رمز عبور
        </button>
      </form>
      <Toaster position="top-center" />
    </div>
  );
}
