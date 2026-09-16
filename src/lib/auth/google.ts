import { createLovableAuth } from "@lovable.dev/cloud-auth-js";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { appUrl, HOSTED_ORIGIN, isExternallyHosted } from "@/lib/api-base";

/**
 * Google sign-in.
 *
 * On the Lovable-hosted deployment the generated helper is used as-is.
 *
 * On a static host (GitHub Pages) the OAuth broker path `/~oauth/initiate`
 * does not exist on that origin (hence the 404), and the broker only accepts
 * redirect URLs on the project's own domains. So we start the flow on the
 * hosted origin and come back through `/oauth-bridge`, which forwards the
 * session tokens to this deployment. No secrets are involved on the client.
 */
export async function signInWithGoogle(): Promise<{ error: Error | null; redirected?: boolean }> {
  if (!isExternallyHosted()) {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: appUrl() });
    return { error: result.error ?? null, redirected: Boolean(result.redirected) };
  }

  const auth = createLovableAuth({ oauthBrokerUrl: `${HOSTED_ORIGIN}/~oauth/initiate` });
  const back = `${HOSTED_ORIGIN}/oauth-bridge?return=${encodeURIComponent(appUrl())}`;
  const result = await auth.signInWithOAuth("google", { redirect_uri: back });

  if (result.error) return { error: result.error };
  if (result.redirected) return { error: null, redirected: true };

  try {
    await supabase.auth.setSession(result.tokens);
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
  return { error: null };
}
