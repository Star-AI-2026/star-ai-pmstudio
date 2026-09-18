import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { clientKey, rateLimit } from "@/lib/ai/rate-limit.server";

/**
 * Sign-up endpoint guarded by Google reCAPTCHA v2.
 * The captcha token is verified server-side with the secret key BEFORE any
 * account is created, so the checkbox cannot be bypassed from the browser.
 * The secret key never leaves the server.
 */
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const BodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(200),
  captchaToken: z.string().min(10).max(5000),
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function verifyCaptcha(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env["RECAPTCHA_SECRET_KEY"];
  if (!secret) return false;
  const params = new URLSearchParams({ secret, response: token });
  if (ip) params.set("remoteip", ip);
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/signup")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const limit = rateLimit(`signup:${clientKey(request)}`, 10, 60_000);
        if (!limit.allowed) {
          return json({ error: "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید." }, 429);
        }

        const parsed = BodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return json({ error: "اطلاعات ثبت نام معتبر نیست." }, 400);
        }

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          null;

        const ok = await verifyCaptcha(parsed.data.captchaToken, ip);
        if (!ok) {
          return json({ error: "تأیید CAPTCHA انجام نشد. دوباره تلاش کنید." }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.auth.admin.createUser({
          email: parsed.data.email,
          password: parsed.data.password,
          email_confirm: true,
          user_metadata: { display_name: parsed.data.name, full_name: parsed.data.name },
        });

        if (error) {
          const already = /already|registered|exists/i.test(error.message);
          return json(
            {
              error: already
                ? "این ایمیل قبلاً ثبت شده است. وارد شوید یا رمز عبور را بازیابی کنید."
                : "ثبت نام انجام نشد. دوباره تلاش کنید.",
            },
            already ? 409 : 500,
          );
        }

        return json({ ok: true }, 200);
      },
    },
  },
});
