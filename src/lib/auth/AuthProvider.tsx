import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  display_name: string;
  email: string | null;
  provider: string;
  created_at: string;
};

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** Best available human name: profile name → metadata name → email username. */
  displayName: string;
  emailVerified: boolean;
  refreshProfile: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Derives a friendly name without ever surfacing the raw email address. */
export function nameFromUser(user: User | null): string {
  if (!user) return "";
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  for (const key of ["display_name", "full_name", "name", "given_name"]) {
    const v = meta[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const email = user.email ?? "";
  const local = email.split("@")[0] ?? "";
  if (!local) return "";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function providerOf(user: User): string {
  const p = (user.app_metadata as { provider?: string } | undefined)?.provider;
  return p && p.trim() ? p : "email";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const ensuring = useRef<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setProfile(null);
      setLoading(false);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;

  /** Creates the Star-AI profile on first sign-in, then keeps it in state. */
  const ensureProfile = useCallback(async (u: User) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, email, provider, created_at")
      .eq("id", u.id)
      .maybeSingle();

    if (error) return;

    if (data) {
      setProfile(data as Profile);
      return;
    }

    const insert = {
      id: u.id,
      display_name: nameFromUser(u),
      email: u.email ?? null,
      provider: providerOf(u),
    };
    const { data: created } = await supabase
      .from("profiles")
      .insert(insert)
      .select("id, display_name, email, provider, created_at")
      .maybeSingle();
    if (created) setProfile(created as Profile);
  }, []);

  useEffect(() => {
    if (!user) {
      ensuring.current = null;
      return;
    }
    if (ensuring.current === user.id) return;
    ensuring.current = user.id;
    void ensureProfile(user);
  }, [user, ensureProfile]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await ensureProfile(user);
  }, [user, ensureProfile]);

  const updateDisplayName = useCallback(
    async (name: string) => {
      const clean = name.trim();
      if (!user) return { error: "ابتدا وارد حساب خود شوید." };
      if (!clean) return { error: "نام نمایشی نمی‌تواند خالی باشد." };
      const { data, error } = await supabase
        .from("profiles")
        .update({ display_name: clean })
        .eq("id", user.id)
        .select("id, display_name, email, provider, created_at")
        .maybeSingle();
      if (error) return { error: "ذخیره نام نمایشی انجام نشد. دوباره تلاش کنید." };
      if (data) setProfile(data as Profile);
      await supabase.auth.updateUser({ data: { display_name: clean } });
      return { error: null };
    },
    [user],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const displayName = useMemo(
    () => (profile?.display_name?.trim() ? profile.display_name.trim() : nameFromUser(user)),
    [profile, user],
  );

  const value: AuthContextValue = {
    loading,
    session,
    user,
    profile,
    displayName,
    emailVerified: Boolean(user?.email_confirmed_at ?? user?.confirmed_at),
    refreshProfile,
    updateDisplayName,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
