import { useEffect, useRef } from "react";

/**
 * Google reCAPTCHA v2 ("I'm not a robot") checkbox.
 * Only the public site key lives here; verification happens server-side.
 */
export const RECAPTCHA_SITE_KEY = "6Ldz4r8tAAAAAKtHx4ckFRUd9-jhpstr1xywRSWv";

type Grecaptcha = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => number;
  reset: (id?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const SCRIPT_ID = "recaptcha-v2-script";

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha?.render) return resolve();
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("recaptcha")));
      return;
    }
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("recaptcha"));
    document.head.appendChild(s);
  });
}

export function Recaptcha({
  onChange,
  resetKey = 0,
}: {
  onChange: (token: string | null) => void;
  /** Bump to clear the checkbox (e.g. after a failed submit). */
  resetKey?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    let cancelled = false;
    void loadScript()
      .then(() => {
        if (cancelled || !box.current || widget.current !== null) return;
        const g = window.grecaptcha;
        if (!g?.render) return;
        widget.current = g.render(box.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          theme: "dark",
          callback: (token: string) => cb.current(token),
          "expired-callback": () => cb.current(null),
          "error-callback": () => cb.current(null),
        });
      })
      .catch(() => cb.current(null));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (resetKey === 0) return;
    if (widget.current !== null) window.grecaptcha?.reset(widget.current);
    cb.current(null);
  }, [resetKey]);

  return (
    <div className="flex w-full justify-center overflow-hidden">
      <div className="origin-top scale-[0.85] sm:scale-100" dir="ltr">
        <div ref={box} />
      </div>
    </div>
  );
}
