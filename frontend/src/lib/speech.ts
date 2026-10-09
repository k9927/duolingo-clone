// Exercise audio: Duolingo's recorded voice clips when a word has one, otherwise
// text-to-speech through the browser's Web Speech API.

const LOCALES: Record<string, string> = { es: "es-ES", en: "en-US" };

let current: HTMLAudioElement | null = null;
let voices: SpeechSynthesisVoice[] = [];

function synth(): SpeechSynthesis | null {
  return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
}

// Browsers load voices asynchronously; keep a fresh list so the first utterance
// already gets a native voice instead of the default (often English) one.
if (synth()) {
  voices = synth()!.getVoices();
  synth()!.addEventListener?.("voiceschanged", () => {
    voices = synth()!.getVoices();
  });
}

/** Best voice for a locale: exact match first, preferring the natural-sounding online voices. */
function pickVoice(locale: string): SpeechSynthesisVoice | undefined {
  const norm = (v: SpeechSynthesisVoice) => v.lang.replace("_", "-").toLowerCase();
  const target = locale.toLowerCase();
  const lang = target.slice(0, 2);
  const candidates = voices.filter((v) => norm(v) === target).concat(voices.filter((v) => norm(v).startsWith(lang) && norm(v) !== target));
  return candidates.find((v) => /natural|online|google/i.test(v.name)) ?? candidates[0];
}

/** Stops any clip or speech that is still playing. */
export function stopSpeech() {
  current?.pause();
  current = null;
  synth()?.cancel();
}

/** Plays Duolingo's recorded audio when available, else falls back to text-to-speech. */
export function say(text: string, audioUrl?: string | null, lang = "es", slow = false) {
  if (!text && !audioUrl) return;
  if (audioUrl && typeof window !== "undefined") {
    stopSpeech();
    current = new Audio(audioUrl);
    current.playbackRate = slow ? 0.7 : 1;
    current.play().catch(() => speak(text, lang, slow));
    return;
  }
  speak(text, lang, slow);
}

export function speak(text: string, lang = "es", slow = false) {
  const s = synth();
  if (!s || !text) return;
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  const locale = LOCALES[lang] ?? lang;
  utterance.lang = locale;
  utterance.rate = slow ? 0.55 : 0.95;
  const voice = pickVoice(locale);
  if (voice) utterance.voice = voice;
  s.speak(utterance);
}
