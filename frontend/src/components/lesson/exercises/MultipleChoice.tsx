"use client";

import { useCallback, useState } from "react";
import { CharacterBubble, ExerciseTitle, KeyHint, NewWordBadge, tileClasses, useNumberKeys, type ExerciseProps } from "./shared";
import { sounds } from "@/lib/sounds";
import { say } from "@/lib/speech";

export function MultipleChoice({ exercise, language, locked, feedback, onChange }: ExerciseProps<"multiple_choice">) {
  const { choices, variant, sentence, new_word: newWord, character } = exercise.data;
  const [selected, setSelected] = useState<string | null>(null);

  const select = useCallback(
    (index: number) => {
      if (locked) return;
      const choice = choices[index];
      setSelected(choice.id);
      onChange({ choice_id: choice.id });
      // Picture cards and plain text options are in the course language; with a sentence shown, options are translations.
      if (variant === "image" || choice.tts || !sentence) say(choice.text, choice.tts, language);
      else sounds.tap();
    },
    [choices, locked, onChange, variant, language, sentence],
  );

  useNumberKeys(choices.length, select, !locked);

  if (variant === "image") {
    return (
      <div>
        {newWord !== false && <NewWordBadge />}
        <ExerciseTitle>{exercise.prompt}</ExerciseTitle>
        {/* 3 across on desktop; 2 across on phones with the last card centred */}
        <div className="flex flex-wrap justify-center gap-2 sm:flex-nowrap">
          {choices.map((c, i) => {
            const isSel = selected === c.id;
            return (
              <button
                key={c.id}
                disabled={locked}
                onClick={() => select(i)}
                className={`flex w-[calc(50%-4px)] flex-col rounded-xl p-3 sm:w-auto sm:flex-1 sm:p-6 ${tileClasses(isSel, isSel ? feedback : null)}`}
              >
                <span className="flex flex-1 items-center justify-center py-4 text-[64px] leading-none sm:py-6 sm:text-[84px]">
                  {c.image?.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Duolingo CDN illustration
                    <img src={c.image} alt="" draggable={false} className="h-[100px] w-[100px] object-contain sm:h-[140px] sm:w-[140px]" />
                  ) : (
                    c.image
                  )}
                </span>
                <span className="flex w-full items-center justify-center gap-2 sm:justify-between">
                  <span className="text-[17px] font-semibold sm:text-[19px]">{c.text}</span>
                  <KeyHint n={i + 1} active={isSel} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ExerciseTitle>{exercise.prompt}</ExerciseTitle>
      {sentence && <CharacterBubble text={sentence} lang={language} speakable character={character} feedback={feedback} />}
      <div className="flex flex-col gap-2">
        {choices.map((c, i) => {
          const isSel = selected === c.id;
          return (
            <button
              key={c.id}
              disabled={locked}
              onClick={() => select(i)}
              className={`flex min-h-[54px] items-center gap-4 rounded-xl px-4 py-3 ${tileClasses(isSel, isSel ? feedback : null)}`}
            >
              <KeyHint n={i + 1} active={isSel} />
              <span className="flex-1 text-center text-[17px] font-semibold sm:text-[19px]">{c.text}</span>
              <span className="hidden w-[30px] sm:block" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
