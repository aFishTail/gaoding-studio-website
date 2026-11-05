"use client";

import { showGlobalToast } from "./wx";

export async function speakText(text: string, options?: { silent?: boolean }): Promise<void> {
  const clean = (text || "").trim();
  if (!clean || typeof window === "undefined") return;
  if ("speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined") {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "en-US";
      utterance.rate = 0.96;
      window.speechSynthesis.speak(utterance);
      return;
    } catch {
      // fall through
    }
  }
  if (!options?.silent) {
    showGlobalToast({ title: `朗读：${clean.slice(0, 28)}`, icon: "none" });
  }
}

export function stopAudio(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
