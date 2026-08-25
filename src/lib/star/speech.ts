/**
 * Browser speech helpers: dictation (Web Speech API) and text-to-speech.
 * Both degrade gracefully when the browser has no support.
 */

import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionResult = { transcript: string; isFinal: boolean };

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function useDictation(onText: (r: RecognitionResult) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const ref = useRef<SpeechRecognitionLike | null>(null);
  const cb = useRef(onText);
  cb.current = onText;

  useEffect(() => {
    setSupported(getRecognition() !== null);
    return () => ref.current?.stop();
  }, []);

  const stop = useCallback(() => {
    ref.current?.stop();
    ref.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const rec = getRecognition();
    if (!rec) return false;
    rec.lang = typeof navigator !== "undefined" ? navigator.language : "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let text = "";
      let isFinal = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]!;
        text += r[0]?.transcript ?? "";
        if (r.isFinal) isFinal = true;
      }
      cb.current({ transcript: text, isFinal });
    };
    rec.onerror = () => {
      ref.current = null;
      setListening(false);
    };
    rec.onend = () => {
      ref.current = null;
      setListening(false);
    };
    ref.current = rec;
    rec.start();
    setListening(true);
    return true;
  }, []);

  return { listening, supported, start, stop };
}

/** Strip markdown so spoken output doesn't read symbols aloud. */
export function speakableText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " code block. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|]/g, "")
    .replace(/\$\$?[^$]*\$\$?/g, " formula ")
    .replace(/\s+/g, " ")
    .trim();
}

export const tts = {
  supported: () => typeof window !== "undefined" && "speechSynthesis" in window,
  speak(text: string, onEnd?: () => void) {
    if (!this.supported()) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(speakableText(text).slice(0, 4000));
    u.rate = 1.02;
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
    return true;
  },
  stop() {
    if (this.supported()) window.speechSynthesis.cancel();
  },
};
