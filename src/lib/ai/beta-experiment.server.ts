/**
 * Intentional instability for the experimental 5.0 Beta model only.
 * Set STAR_AI_5_BETA_SUCCESS_RATE between 0 and 1 to tune its success rate.
 */
export function betaExperimentFailure(version: string, uiLanguage?: string): string | null {
  if (version !== "5.0") return null;

  const configured = Number(process.env["STAR_AI_5_BETA_SUCCESS_RATE"] ?? "0.2");
  const successRate = Number.isFinite(configured)
    ? Math.min(1, Math.max(0, configured))
    : 0.2;

  if (Math.random() < successRate) return null;

  return uiLanguage === "fa"
    ? "خطای آزمایشی Star-AI 5.0 Beta: این نسخه عمداً ناپایدار است. لطفاً دوباره تلاش کنید یا به یک نسخه پایدارتر بروید."
    : "Experimental Star-AI 5.0 Beta error: this model is intentionally unstable. Please try again or switch to a more stable version.";
}
