"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterBubble, ExerciseTitle, type ExerciseProps } from "./shared";

const SPECIAL_CHARACTERS = ["á", "é", "í", "ñ", "ó", "ú", "ü", "¿", "¡"];

export function TypeAnswer({ exercise, language, locked, feedback, onChange }: ExerciseProps<"type_answer">) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const update = (value: string) => {
    setText(value);
    onChange(value.trim() ? { text: value } : null);
  };

  const insert = (ch: string) => {
    const el = ref.current;
    if (!el || locked) return;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    update(text.slice(0, start) + ch + text.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + ch.length, start + ch.length);
    });
  };

  const tone =
    feedback === "correct" ? "!border-feather" : feedback === "wrong" ? "!border-cardinal" : "focus:border-sel-line";

  return (
    <div>
      <ExerciseTitle>{exercise.prompt}</ExerciseTitle>
      <CharacterBubble text={exercise.data.sentence} lang={exercise.data.sentence_lang} speakable={exercise.data.sentence_lang === language} hinted={exercise.hints?.sentence} feedback={feedback} />
      <textarea
        ref={ref}
        value={text}
        disabled={locked}
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => {
          // Enter submits (handled by the lesson player), so don't insert a newline.
          if (e.key === "Enter") e.preventDefault();
        }}
        placeholder={`Type in ${language === "es" ? "Spanish" : "English"}`}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`h-40 w-full resize-none rounded-2xl border-2 border-line bg-surface-2 p-4 text-lg font-semibold outline-none placeholder:text-faint ${tone}`}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {SPECIAL_CHARACTERS.map((ch) => (
          <button
            key={ch}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insert(ch)}
            disabled={locked}
            className="tile h-11 w-11 rounded-xl bg-bg text-lg font-semibold hover:bg-surface-2"
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}
