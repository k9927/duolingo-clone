"use client";

import { useEffect } from "react";
import { SpeakerIcon } from "../../icons";
import { LottieAnim } from "../../mascot/LottieAnim";
import { Owl } from "../../mascot/Owl";
import { DUO } from "@/lib/duoAssets";
import { say } from "@/lib/speech";
import type { Answer, Exercise } from "@/lib/types";

export type FeedbackState = "correct" | "wrong" | null;

export interface ExerciseProps<T extends Exercise["type"]> {
  exercise: Extract<Exercise, { type: T }>;
  language: string;
  /** True once the answer has been checked; inputs are frozen. */
  locked: boolean;
  feedback: FeedbackState;
  onChange: (answer: Answer | null) => void;
}

export function ExerciseTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-6 text-2xl font-extrabold sm:text-[32px] sm:leading-tight">{children}</h1>;
}

/** Purple "NEW WORD" label shown above exercises that introduce vocabulary. */
export function NewWordBadge() {
  return (
    <p className="mb-2 flex items-center gap-2 text-[15px] font-extrabold uppercase tracking-[0.5px] text-beetle">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <circle cx="15" cy="15" r="15" fill="var(--beetle)" />
        <path d="M11 8.5h5l-2.5 4h4.5l-7 9 1.5-6H9z" fill="var(--snow)" />
      </svg>
      New word
    </p>
  );
}

/** One of Duolingo's animated lesson characters, picked consistently per sentence. */
export function LessonCharacter({ seed, size = 130, feedback = null }: { seed: string; size?: number; feedback?: FeedbackState }) {
  const hash = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const anims = DUO.characters[hash % DUO.characters.length];
  // After checking, the character reacts once (thumbs up / dance, or a sad face), like Duolingo.
  const src = feedback === "correct" ? anims.correct : feedback === "wrong" ? anims.incorrect : anims.idle;
  const idle = <LottieAnim src={anims.idle} style={{ width: "100%", height: "100%" }} fallback={<Owl size={size * 0.85} mood="happy" />} />;
  return (
    <div className="shrink-0" style={{ width: size, height: size * 1.15 }}>
      <LottieAnim key={src} src={src} loop={feedback === null} style={{ width: "100%", height: "100%" }} fallback={idle} />
    </div>
  );
}

/** Character + speech bubble used to present a sentence. */
export function CharacterBubble({
  text,
  lang,
  speakable,
  tts,
  feedback = null,
}: {
  text: string;
  lang: string;
  speakable: boolean;
  /** Character art from lesson data; the animated cast is used instead so it can react to answers. */
  character?: string | null;
  tts?: string | null;
  feedback?: FeedbackState;
}) {
  // Like Duolingo, a sentence in the course language is read aloud when the exercise appears.
  useEffect(() => {
    if (!speakable) return;
    const t = setTimeout(() => say(text, tts, lang), 350);
    return () => clearTimeout(t);
  }, [speakable, text, tts, lang]);

  return (
    <div className="mb-6 flex items-end gap-2">
      <LessonCharacter seed={text} feedback={feedback} />
      <div className="relative mb-10 rounded-2xl border-2 border-line px-4 py-3">
        <span className="absolute -left-[9px] bottom-4 h-4 w-4 rotate-45 border-b-2 border-l-2 border-line bg-bg" />
        <div className="flex items-center gap-3">
          {speakable && (
            <button
              onClick={() => say(text, tts, lang)}
              className="shrink-0 text-macaw transition hover:brightness-110"
              aria-label="Listen"
            >
              <SpeakerIcon size={26} />
            </button>
          )}
          <span className="text-[17px] font-semibold underline decoration-line decoration-dashed decoration-2 underline-offset-[6px]">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Small numbered key hint shown on options (Duolingo supports 1-9 keyboard shortcuts). */
export function KeyHint({ n, active }: { n: number; active?: boolean }) {
  return (
    <span
      className={`hidden h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border-2 text-[15px] font-bold sm:flex ${
        active ? "border-sel-line text-sel-ink" : "border-line text-faint"
      }`}
    >
      {n}
    </span>
  );
}

/** Calls `onKey(index)` when the user presses 1-9 (unless typing in a field). */
export function useNumberKeys(count: number, onKey: (index: number) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest("input, textarea")) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= count) onKey(n - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [count, onKey, enabled]);
}

/** Tailwind classes for an option tile in its current state. */
export function tileClasses(selected: boolean, feedback: FeedbackState) {
  // Like Duolingo, a wrong pick keeps its blue "selected" look; the feedback bar shows the error.
  if (selected && feedback === "correct")
    return "tile !border-correct-line bg-correct-bg text-correct-ink [box-shadow:0_2px_0_var(--turtle)]";
  if (selected) return "tile !border-sel-line bg-sel text-sel-ink [box-shadow:0_2px_0_var(--blue-jay)]";
  return "tile bg-bg hover:bg-surface-2";
}
