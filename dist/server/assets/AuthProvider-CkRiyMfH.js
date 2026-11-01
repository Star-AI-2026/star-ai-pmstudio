import { t as supabase } from "./client-CPNLJU8E.js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { jsx } from "react/jsx-runtime";
var CHAT_ENDPOINT = `${"https://star-ai-pmstudio.lovable.app".replace(/\/+$/, "")}/api/public/chat`;
/** Captcha-protected sign-up endpoint (verification happens server-side). */
var SIGNUP_ENDPOINT = `https://star-ai-pmstudio.lovable.app/api/public/signup`;
/** Absolute URL inside the app, honouring the deployment base path. */
function appUrl(path = "") {
	const joined = `/star-ai-pmstudio//${path}`.replace(/\/{2,}/g, "/");
	return new URL(joined, window.location.origin).toString().replace(/\/$/, "") || window.location.origin;
}
//#endregion
//#region src/lib/auth/AuthProvider.tsx
var AuthContext = createContext(null);
function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
	return ctx;
}
/** Derives a friendly name without ever surfacing the raw email address. */
function nameFromUser(user) {
	if (!user) return "";
	const meta = user.user_metadata ?? {};
	for (const key of [
		"display_name",
		"full_name",
		"name",
		"given_name"
	]) {
		const v = meta[key];
		if (typeof v === "string" && v.trim()) return v.trim();
	}
	const local = (user.email ?? "").split("@")[0] ?? "";
	if (!local) return "";
	const cleaned = local.replace(/[._-]+/g, " ").trim();
	return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
function providerOf(user) {
	const p = user.app_metadata?.provider;
	return p && p.trim() ? p : "email";
}
function AuthProvider({ children }) {
	const [loading, setLoading] = useState(true);
	const [session, setSession] = useState(null);
	const [profile, setProfile] = useState(null);
	const ensuring = useRef(null);
	useEffect(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
			setSession(next);
			if (!next) setProfile(null);
			setLoading(false);
		});
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});
		return () => sub.subscription.unsubscribe();
	}, []);
	const user = session?.user ?? null;
	/** Creates the Star-AI profile on first sign-in, then keeps it in state. */
	const ensureProfile = useCallback(async (u) => {
		const { data, error } = await supabase.from("profiles").select("id, display_name, email, provider, created_at").eq("id", u.id).maybeSingle();
		if (error) return;
		if (data) {
			setProfile(data);
			return;
		}
		const { data: fresh } = await supabase.auth.getUser();
		const full = fresh.user?.id === u.id ? fresh.user : u;
		const insert = {
			id: u.id,
			display_name: nameFromUser(full),
			email: u.email ?? null,
			provider: providerOf(u)
		};
		const { data: created } = await supabase.from("profiles").insert(insert).select("id, display_name, email, provider, created_at").maybeSingle();
		if (created) setProfile(created);
	}, []);
	useEffect(() => {
		if (!user) {
			ensuring.current = null;
			return;
		}
		if (ensuring.current === user.id) return;
		ensuring.current = user.id;
		ensureProfile(user);
	}, [user, ensureProfile]);
	const refreshProfile = useCallback(async () => {
		if (!user) return;
		await ensureProfile(user);
	}, [user, ensureProfile]);
	const updateDisplayName = useCallback(async (name) => {
		const clean = name.trim();
		if (!user) return { error: "ابتدا وارد حساب خود شوید." };
		if (!clean) return { error: "نام نمایشی نمی‌تواند خالی باشد." };
		const { data, error } = await supabase.from("profiles").update({ display_name: clean }).eq("id", user.id).select("id, display_name, email, provider, created_at").maybeSingle();
		if (error) return { error: "ذخیره نام نمایشی انجام نشد. دوباره تلاش کنید." };
		if (data) setProfile(data);
		await supabase.auth.updateUser({ data: { display_name: clean } });
		return { error: null };
	}, [user]);
	const signOut = useCallback(async () => {
		await supabase.auth.signOut();
		setProfile(null);
		setSession(null);
	}, []);
	const value = {
		loading,
		session,
		user,
		profile,
		displayName: useMemo(() => profile?.display_name?.trim() ? profile.display_name.trim() : nameFromUser(user), [profile, user]),
		emailVerified: Boolean(user?.email_confirmed_at ?? user?.confirmed_at),
		refreshProfile,
		updateDisplayName,
		signOut
	};
	return /* @__PURE__ */ jsx(AuthContext.Provider, {
		value,
		children
	});
}
//#endregion
export { appUrl as a, SIGNUP_ENDPOINT as i, useAuth as n, CHAT_ENDPOINT as r, AuthProvider as t };
