"use client";

import { motion } from "motion/react";
import { CheckIcon, CloseIcon } from "../icons";
import { useToast } from "../providers/ToastProvider";
import { Button } from "../ui/Button";
import type { AnswerResult } from "@/lib/types";

const PRAISE = ["Nice!", "Great job!", "Amazing!", "Excellent!", "Good job!", "Awesome!"];

interface LessonFooterProps {
  feedback: AnswerResult | null;
  canCheck: boolean;
  checking: boolean;
  showSkip: boolean;
  praiseIndex: number;
  onCheck: () => void;
  onSkip: () => void;
  onContinue: () => void;
}

/** Bottom bar: SKIP / CHECK, which turns into the green or red feedback bar after checking. */
export function LessonFooter({ feedback, canCheck, checking, showSkip, praiseIndex, onCheck, onSkip, onContinue }: LessonFooterProps) {
  if (!feedback) {
    return (
      <footer className="border-t-2 border-line" data-native-enter>
        <div className="mx-auto flex max-w-[1032px] items-center justify-between gap-4 px-4 py-4 sm:h-[140px] sm:py-0">
          {showSkip ? (
            <Button variant="outline" textColor="var(--hare)" onClick={onSkip} disabled={checking} className="max-sm:!hidden sm:w-[150px]">
              Skip
            </Button>
          ) : (
            <span />
          )}
          <Button variant="primary" onClick={onCheck} disabled={!canCheck || checking} className="w-full sm:w-[150px]">
            Check
          </Button>
        </div>
      </footer>
    );
  }

  const correct = feedback.correct;
  return (
    <motion.footer
      initial={{ y: 80, opacity: 0.6 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 36 }}
      className={correct ? "bg-correct-bg" : "bg-wrong-bg"}
      role="status"
      aria-live="polite"
      data-native-enter
    >
      <div className="mx-auto flex max-w-[1032px] flex-col gap-4 px-4 py-4 sm:h-[140px] sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-full bg-bg sm:flex"
          >
            {correct ? <CheckIcon size={44} color="var(--tree-frog)" strokeWidth={4} /> : <CloseIcon size={40} color="var(--fire-ant)" />}
          </motion.div>
          <div className={correct ? "text-correct-ink" : "text-wrong-ink"}>
            <p className="text-2xl font-extrabold">{correct ? PRAISE[praiseIndex % PRAISE.length] : "Correct solution:"}</p>
            {!correct && <p className="text-[17px] font-semibold">{feedback.solution}</p>}
            {feedback.note && (
              <p className="font-semibold">
                {feedback.note} {correct && <span className="font-extrabold">{feedback.solution}</span>}
              </p>
            )}
            <FeedbackLinks />
          </div>
        </div>
        <Button variant={correct ? "primary" : "danger"} onClick={onContinue} className="w-full sm:w-[150px]" autoFocus>
          Continue
        </Button>
      </div>
    </motion.footer>
  );
}

/** TOO EASY / TOO DIFFICULT / REPORT links under the feedback title, as on Duolingo. */
function FeedbackLinks() {
  const toast = useToast();
  const thanks = () => toast({ title: "Thanks for your feedback!" });
  const link = "flex items-center gap-1.5 text-[15px] font-extrabold uppercase tracking-[0.8px] opacity-90 hover:opacity-100";
  return (
    <div className="mt-3 hidden flex-wrap items-center gap-x-6 gap-y-2 sm:flex">
      <button onClick={thanks} className={link}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path d="M3 13h6l-6 7h6M13 8h5l-5 6h5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Too easy
      </button>
      <button onClick={thanks} className={link}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path d="M2.5 20 9 6l3.5 6 2.5-3.5L21.5 20Z" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
          <path d="m7 10.5 2 1.5 2-1.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Too difficult
      </button>
      <button onClick={() => toast({ title: "Thanks for the report!", body: "Exercise reporting is a placeholder in this demo." })} className={link}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path d="M6 21V4h10.5l-1.8 4.2 1.8 4.3H6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        Report
      </button>
    </div>
  );
}
