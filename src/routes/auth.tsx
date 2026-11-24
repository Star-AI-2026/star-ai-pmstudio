import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ArrowRight } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Recaptcha } from "@/components/star/Recaptcha";
import { StarLogo } from "@/components/star/StarLogo";
import { Toaster } from "@/components/ui/sonner";
import { appUrl, SIGNUP_ENDPOINT } from "@/lib/api-base";
import { signInWithGoogle } from "@/lib/auth/google";
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log In / Sign Up — Star-AI" },
      {
        name: "description",
        content:
          "Sign in or create a Star-AI account to use the Star-AI assistant.",
      },
      { property: "og:title", content: "Sign In / Sign Up — Star-AI" },
      {
        property: "og:description",
        content: "Sign in, sign up, email verification and password recovery for Star-AI.",
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


function AuthScreen() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [view, setView] = useState<View>("signin");
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error("Incorrect email or password.");
      return;
    }
    toast.success("Welcome back!");
    void navigate({ to: "/", replace: true });
  };

  const signUp = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error("Name cannot be empty.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA first.");
      return;
    }
    setBusy(true);
    // The captcha is verified on the server before the account is created.
    let payload: { ok?: boolean; error?: string } = {};
    try {
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: email.trim(),
          password,
          captchaToken,
        }),
      });
      payload = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !payload.ok) throw new Error(payload.error ?? "signup failed");
    } catch (err) {
      setBusy(false);
      setCaptchaToken(null);
      setCaptchaReset((n) => n + 1);
      toast.error(
        payload.error ?? (err instanceof Error && err.message !== "signup failed"
          ? "Sign-up failed. Please try again."
          : "Sign-up failed. Please try again."),
      );
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signInError) {
      toast.error("Automatic sign-in failed. Please sign in.");
      setView("signin");
      return;
    }
    toast.success("Your account has been created.");
    void navigate({ to: "/", replace: true });
  };

  const forgot = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: appUrl("reset-password"),
    });
    setBusy(false);
    if (error) {
      toast.error("Could not send the recovery email. Please try again.");
      return;
    }
    toast.success("Password recovery email sent.");
    setView("signin");
  };

  

  return (
    <div dir="ltr" lang="en" className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.12]" />
      <div className="glass relative w-full max-w-md rounded-3xl p-7 shadow-glow">
        <div className="flex flex-col items-center text-center">
          <StarLogo className="h-11 w-11 text-primary drop-shadow-[0_0_18px_var(--glow)]" />
          <h1 className="mt-4 text-2xl font-semibold text-brand-gradient">Star-AI</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Smart AI assistant for everyday tasks
          </p>
        </div>

        {view === "forgot" ? (
          <form onSubmit={forgot} className="mt-7 space-y-3">
            <h2 className="text-center text-lg font-semibold">Forgot password?</h2>
            <p className="text-center text-xs text-muted-foreground">
              Enter your account email and we’ll send you a password reset link.
            </p>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              aria-label="Email"
              className={field}
            />
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send password reset email
            </button>
            <button
              type="button"
              onClick={() => setView("signin")}
              className="w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Back to sign in
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
                Sign in
              </button>
              <button
                onClick={() => setView("signup")}
                className={`rounded-xl px-3 py-2 font-medium transition-colors ${
                  view === "signup" ? "bg-brand-gradient text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={view === "signin" ? signIn : signUp} className="mt-5 space-y-3">
              {view === "signup" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  aria-label="Name"
                  className={field}
                />
              )}
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                className={field}
              />
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                autoComplete={view === "signin" ? "current-password" : "new-password"}
                className={field}
              />
              {view === "signup" && (
                <input
                  type="password"
                  dir="ltr"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  aria-label="Confirm password"
                  autoComplete="new-password"
                  className={field}
                />
              )}

              {view === "signup" && (
                <div className="pt-1">
                  <Recaptcha onChange={setCaptchaToken} resetKey={captchaReset} />
                  {!captchaToken && (
                    <p className="mt-2 text-center text-[11px] text-muted-foreground">
                      Complete the CAPTCHA to create an account.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || (view === "signup" && !captchaToken)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {view === "signin" ? "Sign in" : "Sign up"}
              </button>
            </form>

            {view === "signin" && (
              <button
                onClick={() => setView("forgot")}
                className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </button>
            )}

            
          </>
        )}
      </div>
    </div>
  );
}
