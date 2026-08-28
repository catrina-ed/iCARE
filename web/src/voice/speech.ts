import { AFFIRMATIONS, VERSES } from 'shared/data';

/**
 * Speaks text aloud.
 *
 * Wrapped in try/catch and a capability check because speech synthesis is
 * absent or blocked in enough places — older browsers, some in-app webviews,
 * a locked-down device — that an unguarded call would take the whole voice
 * sheet down with it. Silence is an acceptable degradation; a blank screen
 * is not.
 */
export function speak(text: string) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  } catch {
    // No voice available; the on-screen text still carries the answer.
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // Nothing to stop.
  }
}

export type InspirationKind = 'affirmation' | 'verse';

/** Same choice all day, different tomorrow — so it feels chosen, not random. */
export function todaysInspiration(kind: InspirationKind) {
  const day = new Date().getDate();
  if (kind === 'verse') {
    const v = VERSES[day % VERSES.length];
    return { kind, text: v.text, ref: v.ref };
  }
  return { kind, text: AFFIRMATIONS[day % AFFIRMATIONS.length], ref: undefined };
}
