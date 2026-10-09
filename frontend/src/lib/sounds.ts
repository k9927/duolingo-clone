// Duolingo's own sound effects (served via the /duo-cdn rewrite), at the same
// volumes their web app uses.

const SOUNDS = {
  correct: { url: "/duo-cdn/sounds/37d8f0b39dcfe63872192c89653a93f6.mp3", volume: 0.35 },
  wrong: { url: "/duo-cdn/sounds/f0b6ab4396d5891241ef4ca73b4de13a.mp3", volume: 0.35 },
  complete: { url: "/duo-cdn/sounds/2aae0ea735c8e9ed884107d6f0a09e35.mp3", volume: 0.5 },
  failed: { url: "/duo-cdn/sounds/421d48c53ad6d52618dba715722278e0.mp3", volume: 0.5 },
} as const;

type SoundName = keyof typeof SOUNDS;

let enabled = true;
const cache = new Map<SoundName, HTMLAudioElement>();

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

function play(name: SoundName) {
  if (!enabled || typeof window === "undefined") return;
  let audio = cache.get(name);
  if (!audio) {
    audio = new Audio(SOUNDS[name].url);
    audio.volume = SOUNDS[name].volume;
    audio.preload = "auto";
    cache.set(name, audio);
  }
  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
}

/** Load the clips ahead of time so the first answer plays instantly. */
export function preloadSounds() {
  if (typeof window === "undefined") return;
  (Object.keys(SOUNDS) as SoundName[]).forEach((name) => {
    if (cache.has(name)) return;
    const audio = new Audio(SOUNDS[name].url);
    audio.volume = SOUNDS[name].volume;
    audio.preload = "auto";
    cache.set(name, audio);
  });
}

export const sounds = {
  correct: () => play("correct"),
  wrong: () => play("wrong"),
  complete: () => play("complete"),
  failed: () => play("failed"),
  /** Duolingo doesn't play a sound when tapping options. */
  tap: () => undefined,
};
