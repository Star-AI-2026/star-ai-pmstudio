import { t as StarLogo } from "./StarLogo-aUAmbt8U.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/oauth-bridge.tsx?tsr-split=component
/**
* OAuth return bridge.
*
* The Lovable OAuth broker only accepts redirect URLs on this project's own
* domains. When Star-AI is served from a static host (GitHub Pages), Google
* sign-in therefore returns here and this page forwards the session tokens to
* that deployment. Only the origins below are accepted, so this cannot be used
* as an open redirect. No secrets are involved.
*/
var ALLOWED_RETURN_ORIGINS = ["https://star-ai-2026.github.io"];
function OAuthBridge() {
	const [failed, setFailed] = useState(false);
	useEffect(() => {
		const url = new URL(window.location.href);
		const target = url.searchParams.get("return") ?? "";
		let dest = null;
		try {
			const candidate = new URL(target);
			if (ALLOWED_RETURN_ORIGINS.includes(candidate.origin)) dest = candidate;
		} catch {
			dest = null;
		}
		if (!dest) {
			setFailed(true);
			return;
		}
		url.searchParams.delete("return");
		for (const [k, v] of url.searchParams) dest.searchParams.set(k, v);
		if (window.location.hash) dest.hash = window.location.hash.replace(/^#/, "");
		window.location.replace(dest.toString());
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		dir: "rtl",
		className: "flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center",
		children: [/* @__PURE__ */ jsx(StarLogo, { className: "h-10 w-10 text-primary" }), /* @__PURE__ */ jsx("p", {
			className: "text-sm text-muted-foreground",
			children: failed ? "آدرس بازگشت معتبر نیست." : "در حال تکمیل ورود..."
		})]
	});
}
//#endregion
export { OAuthBridge as component };
