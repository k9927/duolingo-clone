"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { CheckIcon, FlameIcon, XpIcon } from "../icons";
import { LottieAnim } from "../mascot/LottieAnim";
import { Owl } from "../mascot/Owl";
import { useToast } from "../providers/ToastProvider";
import { DUO } from "@/lib/duoAssets";
import { Button } from "../ui/Button";
import { RollingNumber } from "./SessionEndScreens";
import type { CompleteResult, SessionKind } from "@/lib/types";

function StatCard({ label, color, delay, children }: { label: string; color: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 22 }}
      className="w-full max-w-[190px] flex-1 rounded-2xl border-2 p-[2px]"
      style={{ background: color, borderColor: color }}
    >
      <p className="py-1 text-center text-[13px] font-extrabold uppercase tracking-wide text-[var(--snow)]">{label}</p>
      <div className="flex h-[76px] items-center justify-center gap-2 rounded-[14px] bg-bg text-[19px] font-extrabold" style={{ color }}>
        {children}
      </div>
    </motion.div>
  );
}

/** Green target icon used on Duolingo's accuracy card. */
function AccuracyIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <circle cx="12" cy="14" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="12" cy="14" r="5" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M12 14 22 4M18 3.5l4.5.5.5 4.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const TITLES: Record<SessionKind, string> = {
  lesson: "Lesson Complete!",
  practice: "Practice Complete!",
  legendary: "Legendary!",
  unit_test: "Test passed!",
  sounds: "Lesson Complete!",
};

export function LessonComplete({ kind, result, onContinue }: { kind: SessionKind; result: CompleteResult; onContinue: () => void }) {
  const toast = useToast();
  const accuracyLabel = result.accuracy === 100 ? "Amazing" : result.accuracy >= 80 ? "Great" : "Good";
  // Duolingo plays one of its character celebration scenes at random.
  const [scene] = useState(() => DUO.lessonEndScenes[Math.floor(Math.random() * DUO.lessonEndScenes.length)]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <div className="h-[398px] max-h-[45vh] w-[375px] max-w-full">
          <LottieAnim src={scene} loop={false} style={{ width: "100%", height: "100%" }} fallback={<Owl size={190} mood="celebrate" />} />
        </div>
        <motion.h1
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={`mt-4 text-[32px] font-extrabold ${kind === "legendary" ? "text-beetle" : "text-bee"}`}
        >
          {TITLES[kind]}
        </motion.h1>

        <div className="mt-10 flex w-full justify-center gap-4">
          <StatCard label="Total XP" color="var(--bee)" delay={0.2}>
            <XpIcon size={26} /> <RollingNumber value={result.xp_earned} delay={0.4} />
          </StatCard>
          <StatCard label={accuracyLabel} color="var(--owl)" delay={0.35}>
            <AccuracyIcon />
            <span className="inline-flex">
              <RollingNumber value={result.accuracy} delay={0.55} />%
            </span>
          </StatCard>
        </div>
      </div>

      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-[1032px] items-center justify-between gap-4 px-4 py-4 sm:h-[140px] sm:py-0">
          <Button
            variant="outline"
            textColor="var(--hare)"
            className="max-sm:!hidden sm:w-[190px]"
            onClick={() => toast({ title: "Lesson review is coming soon" })}
          >
            Review lesson
          </Button>
          <Button onClick={onContinue} className="w-full sm:w-[176px]" autoFocus>
            Continue
          </Button>
        </div>
      </footer>
    </div>
  );
}

const DAY_LABELS = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];

export function StreakCelebration({ streak, today, onContinue }: { streak: number; today: string; onContinue: () => void }) {
  // Duolingo shows a 5-day window: the streak days so far, then the days ahead.
  const base = new Date(today + "T00:00:00");
  const back = Math.min(streak - 1, 4);
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - back + i);
    return { label: DAY_LABELS[d.getDay()], done: i <= back, isToday: i === back };
  });
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ scale: 0.3, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
          <FlameIcon size={150} />
        </motion.div>
        <div className="-mt-4 h-5 w-24 rounded-[50%] bg-fox/30" />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-[120px] font-black leading-none text-fox"
        >
          {streak}
        </motion.p>
        <p className="text-[25px] font-extrabold text-fox">day streak</p>

        <div className="mt-8 w-full max-w-[340px] rounded-2xl border-2 border-line">
          <div className="flex justify-between px-6 py-4">
            {days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className={`text-[15px] font-extrabold ${d.isToday ? "text-fox" : "text-faint"}`}>{d.label}</span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-full ${d.done ? "bg-fox" : "bg-line"}`}
                >
                  {d.done && <CheckIcon size={18} color="#fff" strokeWidth={4} />}
                </motion.span>
              </div>
            ))}
          </div>
          <p className="border-t-2 border-line px-5 py-3 text-[15px] font-semibold">
            {streak === 1
              ? "But your streak will reset if you don't practice tomorrow. Watch out!"
              : "Practice each day so your streak won't reset!"}
          </p>
        </div>
      </div>
      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-[1032px] justify-end px-4 py-4 sm:h-[140px] sm:items-center sm:py-0">
          <Button variant="secondary" onClick={onContinue} className="w-full sm:w-[150px]" autoFocus>
            Continue
          </Button>
        </div>
      </footer>
    </div>
  );
}

export function LessonFailed({ title, body, onRetry, onExit }: { title: string; body: string; onRetry: () => void; onExit: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Owl size={150} mood="sad" />
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="max-w-sm font-semibold text-muted">{body}</p>
      <div className="mt-4 flex w-full max-w-xs flex-col gap-3">
        <Button variant="gold" full onClick={onRetry}>
          Try again
        </Button>
        <Button variant="ghost" full textColor="var(--hare)" onClick={onExit}>
          Back to learn
        </Button>
      </div>
    </div>
  );
}
