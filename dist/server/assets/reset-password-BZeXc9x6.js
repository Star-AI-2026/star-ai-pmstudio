import { t as StarLogo } from "./StarLogo-aUAmbt8U.js";
import { t as Toaster$1 } from "./sonner-DoFKumIW.js";
import { t as supabase } from "./client-CPNLJU8E.js";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
//#region src/routes/reset-password.tsx?tsr-split=component
var field = "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";
function ResetPasswordRoute() {
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [busy, setBusy] = useState(false);
	const submit = async (e) => {
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
		navigate({
			to: "/",
			replace: true
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		dir: "rtl",
		className: "relative flex min-h-dvh items-center justify-center overflow-hidden px-4",
		children: [
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.12]" }),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: submit,
				className: "glass relative w-full max-w-md space-y-3 rounded-3xl p-7 shadow-glow",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx(StarLogo, { className: "h-10 w-10 text-primary drop-shadow-[0_0_18px_var(--glow)]" }),
							/* @__PURE__ */ jsx("h1", {
								className: "mt-3 text-lg font-semibold",
								children: "انتخاب رمز عبور جدید"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "رمز عبور تازه‌ای برای حساب Star-AI خود بسازید."
							})
						]
					}),
					/* @__PURE__ */ jsx("input", {
						type: "password",
						dir: "ltr",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						placeholder: "رمز عبور جدید",
						"aria-label": "رمز عبور جدید",
						autoComplete: "new-password",
						className: field
					}),
					/* @__PURE__ */ jsx("input", {
						type: "password",
						dir: "ltr",
						value: confirm,
						onChange: (e) => setConfirm(e.target.value),
						placeholder: "تکرار رمز عبور جدید",
						"aria-label": "تکرار رمز عبور جدید",
						autoComplete: "new-password",
						className: field
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "submit",
						disabled: busy,
						className: "flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60",
						children: [busy && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }), " ذخیره رمز عبور"]
					})
				]
			}),
			/* @__PURE__ */ jsx(Toaster$1, { position: "top-center" })
		]
	});
}
//#endregion
export { ResetPasswordRoute as component };
