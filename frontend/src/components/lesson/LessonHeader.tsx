"use client";

import { AnimatePresence, motion } from "motion/react";
import { CloseIcon, HeartIcon, TimerIcon } from "../icons";
import { LottieAnim } from "../mascot/LottieAnim";
import { ProgressBar } from "../ui/ProgressBar";
import { DUO } from "@/lib/duoAssets";
import type { SessionKind } from "@/lib/types";

interface LessonHeaderProps {
  kind: SessionKind;
  progress: number;
  hearts: number;
  combo: number;
  secondsLeft: number | null;
  mistakesLeft: number | null;
  onQuit: () => void;
}

export function LessonHeader({ kind, progress, hearts, combo, secondsLeft, mistakesLeft, onQuit }: LessonHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-[1032px] items-center gap-4 px-4 pt-6 sm:gap-6 sm:pt-[50px]">
      <button onClick={onQuit} className="text-faint transition hover:text-muted" aria-label="Quit lesson">
        <CloseIcon size={22} />
      </button>
      <div className="relative flex-1">
        <ProgressBar value={progress} color={kind === "legendary" ? "var(--bee)" : "var(--owl)"} height={16} />
        {/* Duolingo's sparkle burst at the tip of the bar each time it grows (replays via key). */}
        {progress > 0 && (
          <div
            key={Math.round(progress * 1000)}
            className="pointer-events-none absolute top-1/2 h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${progress * 100}%` }}
          >
            <LottieAnim src={DUO.progressSparkle} loop={false} style={{ width: "100%", height: "100%" }} />
          </div>
        )}
        <AnimatePresence>
          {combo >= 3 && (
            <motion.span
              key={combo}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -top-7 font-extrabold uppercase tracking-wide text-fox"
              style={{ left: `calc(${Math.min(progress, 0.9) * 100}% - 40px)` }}
            >
              {combo} in a row
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {kind === "unit_test" ? (
        <span className="flex items-center gap-1.5 text-lg font-extrabold text-cardinal" title="Mistakes left">
          <HeartIcon size={28} />
          {mistakesLeft}
        </span>
      ) : kind === "legendary" ? (
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 font-extrabold ${secondsLeft !== null && secondsLeft <= 20 ? "text-cardinal" : "text-bee-dark"}`}>
            <TimerIcon size={22} />
            {secondsLeft !== null ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}` : "--"}
          </span>
          <span className="flex items-center gap-1 font-extrabold text-cardinal" title="Mistakes left">
            <HeartIcon size={24} />
            {mistakesLeft}
          </span>
        </div>
      ) : (
        <motion.span
          key={hearts}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 text-lg font-extrabold text-cardinal"
          title={kind === "practice" ? "Practice doesn't cost hearts" : "Hearts"}
        >
          <HeartIcon size={28} />
          {hearts}
        </motion.span>
      )}
    </header>
  );
}
