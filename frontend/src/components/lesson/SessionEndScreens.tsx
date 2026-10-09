"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { QuestIcon } from "../shell/RightPanel";
import { LottieAnim } from "../mascot/LottieAnim";
import { Owl } from "../mascot/Owl";
import { DuoImg } from "../ui/DuoImg";
import { Button } from "../ui/Button";
import { DUO } from "@/lib/duoAssets";
import { dailyQuests, type Quest } from "@/lib/hooks";
import type { CompleteResult } from "@/lib/types";

// The screens Duolingo shows after "Lesson Complete!": score progress, daily
// quest progress, the daily-goal gem chest and the Legendary offer.

/** XP needed per point of the course score (our stand-in for the Duolingo Score). */
export const SCORE_XP = 100;

/** Number that rolls into place digit by digit, like Duolingo's odometer counters. */
export function RollingNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const digits = String(value).split("").map(Number);
  return (
    <span className="inline-flex overflow-hidden leading-none" style={{ height: "1em" }} aria-label={String(value)}>
      {digits.map((d, i) => (
        <span key={`${digits.length}-${i}`} className="inline-block" style={{ height: "1em" }} aria-hidden>
          <motion.span
            className="flex flex-col"
            initial={{ y: 0 }}
            animate={{ y: `-${d}em` }}
            transition={{ delay: delay + i * 0.08, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="block h-[1em] leading-none">
                {n}
              </span>
            ))}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Bar that animates from `from` to `to` (0..1) after mounting. */
function GrowingBar({ from, to, color, height, delay = 0.4, children }: { from: number; to: number; color: string; height: number; delay?: number; children?: React.ReactNode }) {
  const clamp = (v: number) => `${Math.max(0, Math.min(1, v)) * 100}%`;
  return (
    <div className="relative w-full overflow-hidden rounded-full bg-line" style={{ height }}>
      <motion.div
        className="relative h-full rounded-full"
        style={{ background: color }}
        initial={{ width: clamp(from) }}
        animate={{ width: clamp(to) }}
        transition={{ delay, duration: 1, ease: "easeOut" }}
      >
        <div className="absolute left-[5px] right-2 rounded-full bg-white/40" style={{ top: height * 0.22, height: Math.max(3, height * 0.18) }} />
      </motion.div>
      {children}
    </div>
  );
}

function EndLayout({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center justify-center px-4 py-10 text-center">{children}</div>
      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-[1032px] items-center justify-between gap-4 px-4 py-4 sm:h-[140px] sm:py-0">{footer}</div>
      </footer>
    </div>
  );
}

function ContinueButton({ onClick, variant = "primary" }: { onClick: () => void; variant?: "primary" | "secondary" | "white" }) {
  return (
    <Button variant={variant} onClick={onClick} className="w-full sm:ml-auto sm:w-[176px]" autoFocus>
      Continue
    </Button>
  );
}

// ------------------------------------------------------------------ score

export function ScoreProgress({ result, onContinue }: { result: CompleteResult; onContinue: () => void }) {
  const after = result.me.total_xp;
  const before = after - result.xp_earned;
  const scoreBefore = 1 + Math.floor(before / SCORE_XP);
  const score = 1 + Math.floor(after / SCORE_XP);
  const increased = score > scoreBefore;
  const language = result.me.course?.learning_language_name ?? "Spanish";
  const flag = DUO.flags[result.me.course?.learning_language ?? "es"] ?? DUO.flags.es;

  return (
    <EndLayout footer={<ContinueButton variant="secondary" onClick={onContinue} />}>
      <div className="h-[180px] w-[150px]">
        <LottieAnim src={DUO.sessionEnd.scoreDuo} style={{ width: "100%", height: "100%" }} fallback={<Owl size={140} mood="happy" />} />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <DuoImg src={flag} width={66} height={53} />
        <motion.span
          key={score}
          initial={increased ? { scale: 0.4, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 12 }}
          className="text-[70px] font-extrabold leading-none"
        >
          {score}
        </motion.span>
      </div>
      <h1 className="mt-8 text-[28px] font-extrabold leading-tight">
        {increased ? `You increased your ${language} Score!` : `You’re a step closer to increasing your ${language} Score!`}
      </h1>
      <div className="mt-8 flex w-full max-w-[540px] items-center gap-4 text-[28px] font-extrabold text-muted">
        <span>{score}</span>
        <GrowingBar from={increased ? 0 : (before % SCORE_XP) / SCORE_XP} to={(after % SCORE_XP) / SCORE_XP} color="var(--owl)" height={16} />
        <span>{score + 1}</span>
      </div>
    </EndLayout>
  );
}

// ------------------------------------------------------------------ daily quests

/** Quest values before and after this session, derived from the completion result. */
export function questProgress(result: CompleteResult): { quest: Quest; before: number }[] {
  const after = dailyQuests(result.me);
  const before: Record<Quest["kind"], number> = { xp: result.xp_today - result.xp_earned };
  return after.map((quest) => ({ quest, before: Math.min(before[quest.kind], quest.goal) }));
}

/** True when at least one quest moved and wasn't already finished. */
export function questsProgressed(result: CompleteResult) {
  return questProgress(result).some(({ quest, before }) => before < quest.goal && quest.value > before);
}

function QuestProgressRow({ quest, before, delay }: { quest: Quest; before: number; delay: number }) {
  const done = quest.value >= quest.goal;
  const justDone = done && before < quest.goal;
  const [shown, setShown] = useState(before);
  useEffect(() => {
    const t = setTimeout(() => setShown(Math.min(quest.value, quest.goal)), (delay + 0.5) * 1000);
    return () => clearTimeout(t);
  }, [quest.value, quest.goal, delay]);

  return (
    <div className="flex items-center gap-[22px] p-[18px]">
      <QuestIcon kind={quest.kind} size={60} />
      <div className="min-w-0 flex-1 text-left">
        <p className="mb-3 text-[19px] font-extrabold">{quest.title}</p>
        <div className="relative flex items-center">
          <GrowingBar from={before / quest.goal} to={quest.value / quest.goal} color="var(--bee)" height={20} delay={delay}>
            <span
              className={`absolute inset-0 flex items-center justify-center text-[14px] font-extrabold transition-colors ${
                shown > 0 ? "text-[#cd7900]" : "text-faint"
              }`}
            >
              {shown} / {quest.goal}
            </span>
          </GrowingBar>
          <div className="relative -ml-4 shrink-0">
            <DuoImg src={DUO.questChest} width={35} />
            {justDone && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2">
                <DelayedLottie src={DUO.sessionEnd.questBurst} delayMs={(delay + 1) * 1000} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DelayedLottie({ src, delayMs }: { src: string; delayMs: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  return on ? <LottieAnim src={src} loop={false} style={{ width: "100%", height: "100%" }} /> : null;
}

export function QuestsProgress({ result, onContinue }: { result: CompleteResult; onContinue: () => void }) {
  const rows = questProgress(result);
  const allDone = rows.every(({ quest }) => quest.value >= quest.goal);
  const newlyDone = rows.filter(({ quest, before }) => quest.value >= quest.goal && before < quest.goal).length;
  const title = allDone
    ? "All Daily Quests complete!"
    : newlyDone > 0
      ? `${newlyDone} Daily Quest${newlyDone === 1 ? "" : "s"} complete!`
      : "Daily Quests";

  return (
    <EndLayout footer={<ContinueButton onClick={onContinue} />}>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-[32px] font-extrabold leading-tight ${newlyDone > 0 ? "text-bee" : ""}`}
      >
        {title}
      </motion.h1>
      <div className="mt-6 w-full max-w-[520px] divide-y-2 divide-line rounded-2xl border-2 border-line">
        {rows.map(({ quest, before }, i) => (
          <QuestProgressRow key={quest.id} quest={quest} before={before} delay={0.4 + i * 0.3} />
        ))}
      </div>
    </EndLayout>
  );
}

// ------------------------------------------------------------------ gem chest

export function GemReward({ gems, onContinue }: { gems: number; onContinue: () => void }) {
  return (
    <EndLayout footer={<ContinueButton onClick={onContinue} />}>
      <div className="h-[310px] w-[333px] max-w-full">
        <LottieAnim
          src={DUO.sessionEnd.gemChest}
          loop={false}
          style={{ width: "100%", height: "100%" }}
          fallback={<DuoImg src={DUO.popover.gemsChest} width={200} />}
        />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold">You earned {gems} gems!</h1>
      <p className="mt-10 text-[19px] font-semibold text-muted">Nice job reaching your daily goal!</p>
    </EndLayout>
  );
}

// ------------------------------------------------------------------ legendary offer

export function LegendaryOffer({ onStart, onContinue }: { onStart: () => void; onContinue: () => void }) {
  return (
    // Duolingo switches to its dark "legendary" palette for this screen in both themes.
    <div className="flex min-h-screen flex-col bg-[#181818] text-white">
      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}>
          <DuoImg src={DUO.sessionEnd.legendaryDuo} width={340} />
        </motion.div>
        <h1 className="text-2xl font-extrabold">Prove you’re a legend</h1>
        <p className="mt-6 max-w-[360px] text-[17px] font-semibold">Complete this extra-hard challenge and level up to Legendary!</p>
        <Button variant="gold" onClick={onStart} className="mt-6 w-full max-w-[360px]" textColor="#ae6802">
          Start +40 XP
        </Button>
      </div>
      <footer className="border-t-2 border-white/10">
        <div className="mx-auto flex max-w-[1032px] items-center justify-between gap-4 px-4 py-4 sm:h-[140px] sm:py-0">
          <Button
            variant="ghost"
            textColor="#fff"
            onClick={onContinue}
            className="w-full !border-2 !border-white/50 sm:w-[250px]"
          >
            No thanks
          </Button>
          <Button variant="white" textColor="#000437" onClick={onContinue} className="max-sm:!hidden sm:w-[250px]" autoFocus>
            Continue
          </Button>
        </div>
      </footer>
    </div>
  );
}
