import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ArrowRight } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { StarLogo } from "@/components/star/StarLogo";
import { Toaster } from "@/components/ui/sonner";
import { appUrl } from "@/lib/api-base";
import { signInWithGoogle } from "@/lib/auth/google";
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود و ثبت نام — Star-AI" },
      {
        name: "description",
        content:
          "به حساب Star-AI خود وارد شوید یا ثبت نام کنید و از دستیار هوش مصنوعی Star-AI ۲.۰ و ۳.۰ استفاده کنید.",
      },
      { property: "og:title", content: "ورود و ثبت نام — Star-AI" },
      {
        property: "og:description",
        content: "ورود، ثبت نام، تأیید ایمیل و بازیابی رمز عبور برای دستیار هوش مصنوعی Star-AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthRoute,
});

function AuthRoute() {
  return (
    <AuthProvider>
      <AuthScreen />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}

type View = "signin" | "signup" | "forgot";

const field =
  "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.6l4-2.9Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
      />
    </svg>
  );
}

function AuthScreen() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [view, setView] = useState<View>("signin");
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("ایمیل و رمز عبور را وارد کنید.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error("ایمیل یا رمز عبور اشتباه است.");
      return;
    }
    toast.success("خوش آمدید!");
    void navigate({ to: "/", replace: true });
  };

  const signUp = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error("نام نمی‌تواند خالی باشد.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("ایمیل معتبر وارد کنید.");
      return;
    }
    if (password.length < 8) {
      toast.error("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    if (password !== confirm) {
      toast.error("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: appUrl(),
        data: { display_name: cleanName, full_name: cleanName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(
        /already|registered|exists/i.test(error.message)
          ? "این ایمیل قبلاً ثبت شده است. وارد شوید یا رمز عبور را بازیابی کنید."
          : "ثبت نام انجام نشد. دوباره تلاش کنید.",
      );
      return;
    }
    setPendingEmail(email.trim());
    if (data.session) {
      toast.success("حساب شما ساخته شد.");
      void navigate({ to: "/", replace: true });
      return;
    }
    setView("verify");
  };

  const forgot = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("ایمیل خود را وارد کنید.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: appUrl("reset-password"),
    });
    setBusy(false);
    if (error) {
      toast.error("ارسال ایمیل بازیابی انجام نشد. دوباره تلاش کنید.");
      return;
    }
    toast.success("ایمیل بازیابی رمز عبور ارسال شد.");
    setView("signin");
  };

  const google = async () => {
    setBusy(true);
    const result = await signInWithGoogle();
    if (result.error) {
      setBusy(false);
      toast.error("ورود با Google انجام نشد. دوباره تلاش کنید.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/", replace: true });
  };

  const resend = async () => {
    if (!pendingEmail) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: { emailRedirectTo: appUrl() },
    });
    setBusy(false);
    if (error) {
      toast.error("ارسال دوباره ایمیل انجام نشد. کمی بعد تلاش کنید.");
      return;
    }
    toast.success("ایمیل تأیید دوباره ارسال شد.");
  };

  const checkVerified = async () => {
    setBusy(true);
    const { data } = await supabase.auth.getUser();
    setBusy(false);
    if (data.user?.email_confirmed_at) {
      toast.success("ایمیل شما تأیید شد.");
      void navigate({ to: "/", replace: true });
    } else {
      toast.info("هنوز تأیید نشده است. ایمیل خود را باز کنید و روی لینک تأیید بزنید.");
    }
  };

  return (
    <div dir="rtl" className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.12]" />
      <div className="glass relative w-full max-w-md rounded-3xl p-7 shadow-glow">
        <div className="flex flex-col items-center text-center">
          <StarLogo className="h-11 w-11 text-primary drop-shadow-[0_0_18px_var(--glow)]" />
          <h1 className="mt-4 text-2xl font-semibold text-brand-gradient">Star-AI</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            دستیار هوش مصنوعی نسل ۲.۰ و ۳.۰
          </p>
        </div>

        {view === "verify" ? (
          <div className="mt-7 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">ایمیل خود را تأیید کنید</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              یک ایمیل تأیید به <span className="font-medium text-foreground">{pendingEmail}</span>{" "}
              ارسال کردیم.
            </p>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => void resend()}
                disabled={busy}
                className="w-full rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
              >
                ارسال دوباره ایمیل
              </button>
              <button
                onClick={() => void checkVerified()}
                disabled={busy}
                className="w-full rounded-xl border border-input px-4 py-3 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-60"
              >
                بررسی وضعیت تأیید
              </button>
              <button
                onClick={() => setView("signin")}
                className="w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                بازگشت به ورود
              </button>
            </div>
          </div>
        ) : view === "forgot" ? (
          <form onSubmit={forgot} className="mt-7 space-y-3">
            <h2 className="text-center text-lg font-semibold">فراموشی رمز عبور</h2>
            <p className="text-center text-xs text-muted-foreground">
              ایمیل حساب خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.
            </p>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ایمیل"
              aria-label="ایمیل"
              className={field}
            />
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} ارسال ایمیل بازیابی
            </button>
            <button
              type="button"
              onClick={() => setView("signin")}
              className="w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              بازگشت به ورود
            </button>
          </form>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-muted/40 p-1 text-sm">
              <button
                onClick={() => setView("signin")}
                className={`rounded-xl px-3 py-2 font-medium transition-colors ${
                  view === "signin" ? "bg-brand-gradient text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                ورود
              </button>
              <button
                onClick={() => setView("signup")}
                className={`rounded-xl px-3 py-2 font-medium transition-colors ${
                  view === "signup" ? "bg-brand-gradient text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                ثبت نام
              </button>
            </div>

            <form onSubmit={view === "signin" ? signIn : signUp} className="mt-5 space-y-3">
              {view === "signup" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="نام و نام نمایشی"
                  aria-label="نام"
                  className={field}
                />
              )}
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل"
                aria-label="ایمیل"
                autoComplete="email"
                className={field}
              />
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور"
                aria-label="رمز عبور"
                autoComplete={view === "signin" ? "current-password" : "new-password"}
                className={field}
              />
              {view === "signup" && (
                <input
                  type="password"
                  dir="ltr"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="تکرار رمز عبور"
                  aria-label="تکرار رمز عبور"
                  autoComplete="new-password"
                  className={field}
                />
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {view === "signin" ? "ورود" : "ثبت نام"}
              </button>
            </form>

            {view === "signin" && (
              <button
                onClick={() => setView("forgot")}
                className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground"
              >
                فراموشی رمز عبور
              </button>
            )}

            <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> یا <span className="h-px flex-1 bg-border" />
            </div>

            <button
              onClick={() => void google()}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-background/60 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-60"
            >
              <GoogleIcon /> ادامه با Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
