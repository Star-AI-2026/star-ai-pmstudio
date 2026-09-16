import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { StarLogo } from "@/components/star/StarLogo";

/**
 * OAuth return bridge.
 *
 * The Lovable OAuth broker only accepts redirect URLs on this project's own
 * domains. When Star-AI is served from a static host (GitHub Pages), Google
 * sign-in therefore returns here and this page forwards the session tokens to
 * that deployment. Only the origins below are accepted, so this cannot be used
 * as an open redirect. No secrets are involved.
 */
const ALLOWED_RETURN_ORIGINS = ["https://parhamm058-rgb.github.io"];

export const Route = createFileRoute("/oauth-bridge")({
  head: () => ({
    meta: [
      { title: "در حال تکمیل ورود — Star-AI" },
      { name: "description", content: "تکمیل فرایند ورود با Google و بازگشت به Star-AI." },
      { property: "og:title", content: "در حال تکمیل ورود — Star-AI" },
      { property: "og:description", content: "تکمیل فرایند ورود با Google و بازگشت به Star-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OAuthBridge,
});

function OAuthBridge() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const target = url.searchParams.get("return") ?? "";

    let dest: URL | null = null;
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

    // Carry the tokens through, whether the broker used the hash or the query.
    url.searchParams.delete("return");
    for (const [k, v] of url.searchParams) dest.searchParams.set(k, v);
    if (window.location.hash) dest.hash = window.location.hash.replace(/^#/, "");

    window.location.replace(dest.toString());
  }, []);

  return (
    <div dir="rtl" className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <StarLogo className="h-10 w-10 text-primary" />
      <p className="text-sm text-muted-foreground">
        {failed ? "آدرس بازگشت معتبر نیست." : "در حال تکمیل ورود..."}
      </p>
    </div>
  );
}
