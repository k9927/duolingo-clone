"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SpeakerIcon } from "../../icons";
import { CharacterBubble, ExerciseTitle, type ExerciseProps } from "./shared";
import { sounds } from "@/lib/sounds";
import { speak } from "@/lib/speech";

type Props = ExerciseProps<"translate"> | ExerciseProps<"listen">;

/** Tap-the-words exercise used for both "translate" and "listen". */
export function WordBank(props: Props) {
  const { exercise, language, locked, feedback, onChange } = props;
  const words = exercise.data.words;
  const [picked, setPicked] = useState<number[]>([]); // indices into `words`

  const isListen = exercise.type === "listen";
  const audioText = exercise.type === "listen" ? exercise.data.audio_text : null;
  // Tiles are in the course language for listening and English→Spanish exercises; those are spoken when tapped.
  const tilesSpeak = isListen || (exercise.type === "translate" && exercise.data.sentence_lang !== language);

  useEffect(() => {
    if (audioText) {
      const t = setTimeout(() => speak(audioText, language), 350);
      return () => clearTimeout(t);
    }
  }, [audioText, language]);

  const update = (next: number[]) => {
    setPicked(next);
    onChange(next.length ? { tokens: next.map((i) => words[i]) } : null);
  };

  const pick = (i: number) => {
    if (locked || picked.includes(i)) return;
    if (tilesSpeak) speak(words[i], language);
    else sounds.tap();
    update([...picked, i]);
  };

  const unpick = (i: number) => {
    if (locked) return;
    update(picked.filter((p) => p !== i));
  };

  const answerTone =
    feedback === "correct" ? "text-correct-ink" : feedback === "wrong" ? "text-wrong-ink" : "";

  return (
    <div>
      <ExerciseTitle>{exercise.prompt}</ExerciseTitle>

      {exercise.type === "translate" ? (
        <CharacterBubble
          text={exercise.data.sentence}
          lang={exercise.data.sentence_lang}
          speakable={exercise.data.sentence_lang === language}
          character={exercise.data.character}
          tts={exercise.data.tts}
          hinted={exercise.hints?.sentence}
          feedback={feedback}
        />
      ) : (
        <div className="mb-8 flex items-center justify-center gap-4">
          <button
            onClick={() => speak(audioText!, language)}
            className="btn-3d flex h-[110px] w-[130px] items-center justify-center rounded-3xl"
            style={{ "--btn-bg": "var(--macaw)", "--btn-shadow": "var(--whale)" } as React.CSSProperties}
            aria-label="Play audio"
          >
            <SpeakerIcon size={56} color="#fff" />
          </button>
          <button
            onClick={() => speak(audioText!, language, true)}
            className="btn-3d flex h-[70px] w-[76px] items-center justify-center rounded-2xl text-3xl"
            style={{ "--btn-bg": "var(--macaw)", "--btn-shadow": "var(--whale)" } as React.CSSProperties}
            aria-label="Play audio slowly"
          >
            🐢
          </button>
        </div>
      )}

      {/* answer lines */}
      <div
        className={`mb-8 flex min-h-[124px] flex-wrap content-start gap-2 py-1 ${answerTone}`}
        style={{ backgroundImage: "linear-gradient(transparent 58px, var(--swan) 58px, var(--swan) 60px, transparent 60px)", backgroundSize: "100% 62px" }}
      >
        {picked.map((i) => (
          <motion.button
            key={i}
            layout
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            disabled={locked}
            onClick={() => unpick(i)}
            className="tile h-[54px] rounded-xl bg-bg px-4 text-[17px] font-semibold"
          >
            {words[i]}
          </motion.button>
        ))}
      </div>

      {/* bank */}
      <div className={`flex flex-wrap justify-center gap-2 ${isListen ? "" : ""}`}>
        {words.map((w, i) =>
          picked.includes(i) ? (
            <span key={i} className="h-[54px] rounded-xl bg-line px-4 text-[17px] font-semibold text-transparent">
              {w}
            </span>
          ) : (
            <button
              key={i}
              disabled={locked}
              onClick={() => pick(i)}
              className="tile h-[54px] rounded-xl bg-bg px-4 text-[17px] font-semibold hover:bg-surface-2"
            >
              {w}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
