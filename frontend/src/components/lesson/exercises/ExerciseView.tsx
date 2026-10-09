"use client";

import { FillBlank } from "./FillBlank";
import { MatchPairs } from "./MatchPairs";
import { MultipleChoice } from "./MultipleChoice";
import type { FeedbackState } from "./shared";
import { TypeAnswer } from "./TypeAnswer";
import { WordBank } from "./WordBank";
import type { Answer, Exercise } from "@/lib/types";

interface ExerciseViewProps {
  exercise: Exercise;
  language: string;
  locked: boolean;
  feedback: FeedbackState;
  onChange: (answer: Answer | null) => void;
}

/** Picks the component for an exercise type. */
export function ExerciseView({ exercise, ...rest }: ExerciseViewProps) {
  switch (exercise.type) {
    case "multiple_choice":
      return <MultipleChoice exercise={exercise} {...rest} />;
    case "translate":
    case "listen":
      return <WordBank exercise={exercise as never} {...rest} />;
    case "match_pairs":
      return <MatchPairs exercise={exercise} {...rest} />;
    case "fill_blank":
      return <FillBlank exercise={exercise} {...rest} />;
    case "type_answer":
      return <TypeAnswer exercise={exercise} {...rest} />;
  }
}
