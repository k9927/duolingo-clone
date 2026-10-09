"use client";

import { useCallback, useState } from "react";
import { HintedSentence } from "./HintedSentence";
import { ExerciseTitle, KeyHint, LessonCharacter, useNumberKeys, type ExerciseProps } from "./shared";
import { sounds } from "@/lib/sounds";
import { speak } from "@/lib/speech";

export function FillBlank({ exercise, language, locked, feedback, onChange }: ExerciseProps<"fill_blank">) {
  const { before, after, translation, choices } = exercise.data;
  const [picked, setPicked] = useState<number | null>(null);

  const choose = useCallback(
    (i: number) => {
      if (locked) return;
      const next = picked === i ? null : i;
      // The word choices are in the course language, so they're spoken when picked.
      if (next !== null) speak(choices[next], language);
      else sounds.tap();
      setPicked(next);
      onChange(next === null ? null : { choice: choices[next] });
    },
    [locked, picked, choices, onChange, language],
  );

  useNumberKeys(choices.length, choose, !locked);

  const blankTone =
    feedback === "correct"
      ? "!border-feather text-correct-ink"
      : feedback === "wrong"
        ? "!border-cardinal text-wrong-ink"
        : "text-macaw";

  return (
    <div>
      <ExerciseTitle>{exercise.prompt}</ExerciseTitle>
      <div className="mb-10 flex items-center gap-4">
        <LessonCharacter seed={before + after} size={110} feedback={feedback} />
        <div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-3 text-2xl font-semibold">
            {exercise.hints?.before ? <HintedSentence hinted={exercise.hints.before} speakable /> : <span>{before}</span>}
            <button
              onClick={() => picked !== null && choose(picked)}
              disabled={locked || picked === null}
              className={`inline-flex h-12 min-w-24 items-center justify-center border-b-2 border-faint px-2 ${blankTone}`}
            >
              {picked !== null && (
                <span className="tile rounded-xl bg-bg px-3 py-1 text-lg">{choices[picked]}</span>
              )}
            </button>
            {exercise.hints?.after ? <HintedSentence hinted={exercise.hints.after} speakable /> : <span>{after}</span>}
          </p>
          <p className="mt-3 font-semibold text-muted">{translation}</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {choices.map((c, i) =>
          picked === i ? (
            <span key={c} className="flex h-14 items-center rounded-xl bg-line px-5 text-lg font-semibold text-transparent">
              {c}
            </span>
          ) : (
            <button
              key={c}
              disabled={locked}
              onClick={() => choose(i)}
              className="tile flex h-14 items-center gap-3 rounded-xl bg-bg px-4 text-lg font-semibold hover:bg-surface-2"
            >
              <KeyHint n={i + 1} />
              {c}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
