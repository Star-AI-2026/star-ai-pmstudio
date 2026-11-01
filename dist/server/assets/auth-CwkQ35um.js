import { t as StarLogo } from "./StarLogo-aUAmbt8U.js";
import { t as Toaster$1 } from "./sonner-DoFKumIW.js";
import { a as appUrl, i as SIGNUP_ENDPOINT, n as useAuth, t as AuthProvider } from "./AuthProvider-CkRiyMfH.js";
import { t as supabase } from "./client-CPNLJU8E.js";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
//#region src/components/star/Recaptcha.tsx
/**
* Google reCAPTCHA v2 ("I'm not a robot") checkbox.
* Only the public site key lives here; verification happens server-side.
*/
var RECAPTCHA_SITE_KEY = "6Ldz4r8tAAAAAKtHx4ckFRUd9-jhpstr1xywRSWv";
var SCRIPT_ID = "recaptcha-v2-script";
function loadScript() {
	return new Promise((resolve, reject) => {
		if (window.grecaptcha?.render) return resolve();
		const existing = document.getElementById(SCRIPT_ID);
		if (existing) {
			existing.addEventListener("load", () => resolve());
			existing.addEventListener("error", () => reject(/* @__PURE__ */ new Error("recaptcha")));
			return;
		}
		const s = document.createElement("script");
		s.id = SCRIPT_ID;
		s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
		s.async = true;
		s.defer = true;
		s.onload = () => resolve();
		s.onerror = () => reject(/* @__PURE__ */ new Error("recaptcha"));
		document.head.appendChild(s);
	});
}
function Recaptcha({ onChange, resetKey = 0 }) {
	const box = useRef(null);
	const widget = useRef(null);
	const cb = useRef(onChange);
	cb.current = onChange;
	useEffect(() => {
		let cancelled = false;
		const ready = async () => {
			for (let i = 0; i < 60; i += 1) {
				if (window.grecaptcha?.render) return;
				await new Promise((r) => setTimeout(r, 100));
			}
			throw new Error("recaptcha-timeout");
		};
		loadScript().then(ready).then(() => {
			if (cancelled || !box.current || widget.current !== null) return;
			const g = window.grecaptcha;
			if (!g?.render) return;
			widget.current = g.render(box.current, {
				sitekey: RECAPTCHA_SITE_KEY,
				theme: "dark",
				callback: (token) => cb.current(token),
				"expired-callback": () => cb.current(null),
				"error-callback": () => cb.current(null)
			});
		}).catch(() => cb.current(null));
		return () => {
			cancelled = true;
		};
	}, []);
	useEffect(() => {
		if (resetKey === 0) return;
		if (widget.current !== null) window.grecaptcha?.reset(widget.current);
		cb.current(null);
	}, [resetKey]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex w-full justify-center overflow-hidden",
		children: /* @__PURE__ */ jsx("div", {
			className: "origin-top scale-[0.85] sm:scale-100",
			dir: "ltr",
			children: /* @__PURE__ */ jsx("div", { ref: box })
		})
	});
}
//#endregion
//#region src/routes/auth.tsx?tsr-split=component
function AuthRoute() {
	return /* @__PURE__ */ jsxs(AuthProvider, { children: [/* @__PURE__ */ jsx(AuthScreen, {}), /* @__PURE__ */ jsx(Toaster$1, { position: "top-center" })] });
}
var field = "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";
function AuthScreen() {
	const navigate = useNavigate();
	const { session, loading } = useAuth();
	const [view, setView] = useState("signin");
	const [busy, setBusy] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [captchaToken, setCaptchaToken] = useState(null);
	const [captchaReset, setCaptchaReset] = useState(0);
	useEffect(() => {
		if (!loading && session) navigate({
			to: "/",
			replace: true
		});
	}, [
		loading,
		session,
		navigate
	]);
	const signIn = async (e) => {
		e.preventDefault();
		if (!email.trim() || !password) {
			toast.error("ایمیل و رمز عبور را وارد کنید.");
			return;
		}
		setBusy(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: email.trim(),
			password
		});
		setBusy(false);
		if (error) {
			toast.error("ایمیل یا رمز عبور اشتباه است.");
			return;
		}
		toast.success("خوش آمدید!");
		navigate({
			to: "/",
			replace: true
		});
	};
	const signUp = async (e) => {
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
		if (!captchaToken) {
			toast.error("لطفاً ابتدا تیک «I'm not a robot» را بزنید و CAPTCHA را کامل کنید.");
			return;
		}
		setBusy(true);
		let payload = {};
		try {
			const res = await fetch(SIGNUP_ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: cleanName,
					email: email.trim(),
					password,
					captchaToken
				})
			});
			payload = await res.json().catch(() => ({}));
			if (!res.ok || !payload.ok) throw new Error(payload.error ?? "signup failed");
		} catch (err) {
			setBusy(false);
			setCaptchaToken(null);
			setCaptchaReset((n) => n + 1);
			toast.error(payload.error ?? (err instanceof Error && err.message !== "signup failed" ? "ثبت نام انجام نشد. دوباره تلاش کنید." : "ثبت نام انجام نشد. دوباره تلاش کنید."));
			return;
		}
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: email.trim(),
			password
		});
		setBusy(false);
		if (signInError) {
			toast.error("ورود خودکار انجام نشد. لطفاً وارد شوید.");
			setView("signin");
			return;
		}
		toast.success("حساب شما ساخته شد.");
		navigate({
			to: "/",
			replace: true
		});
	};
	const forgot = async (e) => {
		e.preventDefault();
		if (!email.trim()) {
			toast.error("ایمیل خود را وارد کنید.");
			return;
		}
		setBusy(true);
		const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: appUrl("reset-password") });
		setBusy(false);
		if (error) {
			toast.error("ارسال ایمیل بازیابی انجام نشد. دوباره تلاش کنید.");
			return;
		}
		toast.success("ایمیل بازیابی رمز عبور ارسال شد.");
		setView("signin");
	};
	return /* @__PURE__ */ jsxs("div", {
		dir: "rtl",
		className: "relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10",
		children: [/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.12]" }), /* @__PURE__ */ jsxs("div", {
			className: "glass relative w-full max-w-md rounded-3xl p-7 shadow-glow",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center text-center",
				children: [
					/* @__PURE__ */ jsx(StarLogo, { className: "h-11 w-11 text-primary drop-shadow-[0_0_18px_var(--glow)]" }),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-4 text-2xl font-semibold text-brand-gradient",
						children: "Star-AI"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "دستیار هوش مصنوعی نسل ۲.۰ و ۳.۰"
					})
				]
			}), view === "forgot" ? /* @__PURE__ */ jsxs("form", {
				onSubmit: forgot,
				className: "mt-7 space-y-3",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "text-center text-lg font-semibold",
						children: "فراموشی رمز عبور"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-center text-xs text-muted-foreground",
						children: "ایمیل حساب خود را وارد کنید تا لینک بازیابی برایتان ارسال شود."
					}),
					/* @__PURE__ */ jsx("input", {
						type: "email",
						dir: "ltr",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						placeholder: "ایمیل",
						"aria-label": "ایمیل",
						className: field
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "submit",
						disabled: busy,
						className: "flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60",
						children: [busy && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }), " ارسال ایمیل بازیابی"]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setView("signin"),
						className: "w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground",
						children: "بازگشت به ورود"
					})
				]
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-muted/40 p-1 text-sm",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => setView("signin"),
						className: `rounded-xl px-3 py-2 font-medium transition-colors ${view === "signin" ? "bg-brand-gradient text-primary-foreground" : "text-muted-foreground"}`,
						children: "ورود"
					}), /* @__PURE__ */ jsx("button", {
						onClick: () => setView("signup"),
						className: `rounded-xl px-3 py-2 font-medium transition-colors ${view === "signup" ? "bg-brand-gradient text-primary-foreground" : "text-muted-foreground"}`,
						children: "ثبت نام"
					})]
				}),
				/* @__PURE__ */ jsxs("form", {
					onSubmit: view === "signin" ? signIn : signUp,
					className: "mt-5 space-y-3",
					children: [
						view === "signup" && /* @__PURE__ */ jsx("input", {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "نام و نام نمایشی",
							"aria-label": "نام",
							className: field
						}),
						/* @__PURE__ */ jsx("input", {
							type: "email",
							dir: "ltr",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							placeholder: "ایمیل",
							"aria-label": "ایمیل",
							autoComplete: "email",
							className: field
						}),
						/* @__PURE__ */ jsx("input", {
							type: "password",
							dir: "ltr",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "رمز عبور",
							"aria-label": "رمز عبور",
							autoComplete: view === "signin" ? "current-password" : "new-password",
							className: field
						}),
						view === "signup" && /* @__PURE__ */ jsx("input", {
							type: "password",
							dir: "ltr",
							value: confirm,
							onChange: (e) => setConfirm(e.target.value),
							placeholder: "تکرار رمز عبور",
							"aria-label": "تکرار رمز عبور",
							autoComplete: "new-password",
							className: field
						}),
						view === "signup" && /* @__PURE__ */ jsxs("div", {
							className: "pt-1",
							children: [/* @__PURE__ */ jsx(Recaptcha, {
								onChange: setCaptchaToken,
								resetKey: captchaReset
							}), !captchaToken && /* @__PURE__ */ jsx("p", {
								className: "mt-2 text-center text-[11px] text-muted-foreground",
								children: "برای ثبت نام ابتدا CAPTCHA را کامل کنید."
							})]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "submit",
							disabled: busy || view === "signup" && !captchaToken,
							className: "flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60",
							children: [busy ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" }), view === "signin" ? "ورود" : "ثبت نام"]
						})
					]
				}),
				view === "signin" && /* @__PURE__ */ jsx("button", {
					onClick: () => setView("forgot"),
					className: "mt-2 w-full text-xs text-muted-foreground hover:text-foreground",
					children: "فراموشی رمز عبور"
				})
			] })]
		})]
	});
}
//#endregion
export { AuthRoute as component };
