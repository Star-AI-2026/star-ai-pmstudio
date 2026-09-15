/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin that serves the Star-AI API when the app is statically hosted. */
  readonly VITE_STAR_AI_API_BASE?: string;
}
