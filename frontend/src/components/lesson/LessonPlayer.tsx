"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeartIcon } from "../icons";
import { LottieAnim } from "../mascot/LottieAnim";
import { Owl } from "../mascot/Owl";
import { DUO } from "@/lib/duoAssets";
import { useToast } from "../providers/ToastProvider";
import { useUser } from "../providers/UserProvider";
import { Button } from "../ui/Button";
import { ErrorScreen, LoadingScreen } from "../ui/LoadingScreen";
import { ExerciseView } from "./exercises/ExerciseView";
import { LessonComplete, LessonFailed, StreakCelebration } from "./LessonComplete";
import { LessonFooter } from "./LessonFooter";
import { GemReward, LegendaryOffer, QuestsProgress, ScoreProgress, questsProgressed } from "./SessionEndScreens";
import { LessonHeader } from "./LessonHeader";
import { OutOfHeartsModal, QuitModal } from "./LessonModals";
import { api, ApiError } from "@/lib/api";
import { useNow } from "@/lib/hooks";
import { preloadSounds, sounds } from "@/lib/sounds";
import { speak, stopSpeech } from "@/lib/speech";
import type { Answer, AnswerResult, CompleteResult, Exercise, LessonSession, SessionKind } from "@/lib/types";

const END_SCREENS = new Set<string>(["complete", "streak", "score", "quests", "gems", "legendary"]);

// Encouragement shown after this many correct answers in a row.
const CHEERS: Record<number, string> = { 4: "Super impressive!", 8: "You're on fire!", 12: "Unstoppable!" };

/** The course-language sentence to read after a correct answer, if the learner produced one. */
function answerToSpeak(ex: Exercise, answer: Answer, solution: string, language: string): string | null {
  switch (ex.type) {
    case "translate":
    case "type_answer":
      return ex.data.sentence_lang !== language ? solution : null;
    case "fill_blank":
      return [ex.data.before, String(answer.choice ?? ""), ex.data.after].join(" ").replace(/\s+([.,!?])/g, "$1").trim();
    default:
      return null;
  }
}

type EndScreen = "complete" | "streak" | "score" | "quests" | "gems" | "legendary";
type Phase = "loading" | "playing" | "finishing" | EndScreen | "failed" | "no_hearts" | "error";

/** The celebration screens shown after a session, in Duolingo's order. */
function endScreens(kind: SessionKind, r: CompleteResult): EndScreen[] {
  const screens: EndScreen[] = ["complete"];
  if (r.streak_extended) screens.push("streak");
  if (r.xp_earned > 0) screens.push("score");
  if (questsProgressed(r)) screens.push("quests");
  if (r.gems_earned > 0) screens.push("gems");
  if (kind === "lesson" && r.skill_completed) screens.push("legendary");
  return screens;
}

/**
 * Runs one session: shows exercises in a queue, checks answers with the API,
 * re-queues mistakes at the end (like Duolingo) and finishes once every
 * exercise has been answered correctly.
 */
export function LessonPlayer({ kind, skillId }: { kind: SessionKind; skillId?: number }) {
  const router = useRouter();
  const { me, setMe, refresh } = useUser();
  const toast = useToast();

  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<ApiError | null>(null);
  const [session, setSession] = useState<LessonSession | null>(null);
  const [queue, setQueue] = useState<number[]>([]); // indices into session.exercises
  const [pos, setPos] = useState(0);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [hearts, setHearts] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [praise, setPraise] = useState(0);
  const [modal, setModal] = useState<"quit" | "hearts" | null>(null);
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [failReason, setFailReason] = useState<"time" | "mistakes">("mistakes");
  const [deadline, setDeadline] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [interlude, setInterlude] = useState<{ text: string; nextPos: number } | null>(null);

  const inFlight = useRef(false);
  const answerAudio = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Don't let lesson audio keep talking after leaving the lesson.
  useEffect(
    () => () => {
      if (answerAudio.current) clearTimeout(answerAudio.current);
      stopSpeech();
    },
    [],
  );
  const started = useRef(false);

  const start = useCallback(async () => {
    setPhase("loading");
    setFeedback(null);
    setAnswer(null);
    setPos(0);
    setSolved(new Set());
    setMistakes(0);
    setCombo(0);
    setModal(null);
    setInterlude(null);
    try {
      const s = await api.startSession(kind, skillId);
      setSession(s);
      setQueue(s.exercises.map((_, i) => i));
      setHearts(s.hearts);
      setDeadline(s.time_limit_seconds ? Date.now() + s.time_limit_seconds * 1000 : null);
      setPhase("playing");
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError(0, "unknown", String(e));
      if (err.code === "out_of_hearts") {
        setPhase("no_hearts");
        setModal("hearts");
      } else {
        setError(err);
        setPhase("error");
      }
    }
  }, [kind, skillId]);

  useEffect(preloadSounds, []);

  useEffect(() => {
    // Guard against React StrictMode running the effect twice in development.
    if (started.current) return;
    started.current = true;
    void start();
  }, [start]);

  const exerciseIndex = queue[pos];
  const current = session && exerciseIndex !== undefined ? session.exercises[exerciseIndex] : null;

  // ------------------------------------------------------------------ actions

  const check = useCallback(
    async (override?: Answer) => {
      const submitted = override ?? answer;
      if (!session || !current || feedback || submitted == null || inFlight.current) return;
      inFlight.current = true;
      try {
        const res = await api.answer(session.id, current.id, submitted);
        setFeedback(res);
        setHearts(res.hearts);
        setMistakes(res.mistakes);
        if (res.correct) {
          sounds.correct();
          // Duolingo reads the answer aloud when it was written in the course language.
          const spoken = answerToSpeak(current, submitted, res.solution, session.language);
          if (spoken) answerAudio.current = setTimeout(() => speak(spoken, session.language), 450);
          setSolved((s) => new Set(s).add(exerciseIndex));
          setCombo((c) => c + 1);
          setPraise((p) => p + 1);
        } else {
          sounds.wrong();
          setQueue((q) => [...q, exerciseIndex]);
          setCombo(0);
        }
      } catch (e) {
        if (e instanceof ApiError && e.code === "out_of_hearts") setModal("hearts");
        else toast({ title: e instanceof Error ? e.message : "Something went wrong", tone: "error" });
      } finally {
        inFlight.current = false;
      }
    },
    [answer, session, current, feedback, exerciseIndex, toast],
  );

  const finish = useCallback(async () => {
    if (!session) return;
    setPhase("finishing");
    try {
      const r = await api.complete(session.id);
      setResult(r);
      setMe(r.me);
      sounds.complete();
      setPhase("complete");
      r.new_achievements.forEach((a) =>
        toast({
          title: `${a.title} · Level ${a.level} unlocked!`,
          body: a.gem_reward ? `${a.description} · +${a.gem_reward} gems` : a.description,
          icon: a.icon,
          tone: "success",
          durationMs: 5000,
        }),
      );
    } catch (e) {
      if (e instanceof ApiError && e.code === "time_up") {
        setFailReason("time");
        setPhase("failed");
      } else {
        setError(e instanceof ApiError ? e : new ApiError(0, "unknown", String(e)));
        setPhase("error");
      }
    }
  }, [session, setMe, toast]);

  const next = useCallback(() => {
    if (!feedback) return;
    if (feedback.session_status === "failed") {
      setFailReason("mistakes");
      setPhase("failed");
      return;
    }
    setFeedback(null);
    setAnswer(null);
    if (answerAudio.current) clearTimeout(answerAudio.current);
    stopSpeech();
    const nextPos = pos + 1;
    if (nextPos >= queue.length) {
      void finish();
      return;
    }
    // Duolingo-style interludes between exercises.
    const cheer = feedback.correct && me?.settings.motivational_messages !== false && CHEERS[combo];
    if (session && nextPos === session.exercises.length) {
      setInterlude({ text: "Let's review the exercise you missed!", nextPos });
    } else if (cheer) {
      setInterlude({ text: cheer, nextPos });
    } else {
      setPos(nextPos);
    }
    if (kind === "lesson" && hearts <= 0) setModal("hearts");
  }, [feedback, pos, queue.length, finish, kind, hearts, session, combo, me]);

  const leaveInterlude = useCallback(() => {
    if (!interlude) return;
    setPos(interlude.nextPos);
    setInterlude(null);
  }, [interlude]);

  const exit = useCallback(() => {
    void refresh();
    // A Sounds lesson returns to the Sounds tab it was started from.
    router.push(kind === "sounds" ? "/sounds" : "/learn");
  }, [refresh, router, kind]);

  const quit = useCallback(() => {
    if (session && (phase === "playing" || phase === "failed")) void api.abandon(session.id).catch(() => undefined);
    exit();
  }, [session, phase, exit]);

  const refill = useCallback(async () => {
    setBusy(true);
    try {
      const updated = await api.purchase("heart_refill");
      setMe(updated);
      setHearts(updated.hearts);
      setModal(null);
      toast({ title: "Hearts refilled!", icon: <HeartIcon size={30} />, tone: "success" });
      if (phase === "no_hearts") void start();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Couldn't refill hearts", tone: "error" });
    } finally {
      setBusy(false);
    }
  }, [phase, setMe, start, toast]);

  const practiceForHearts = useCallback(() => {
    if (session && phase === "playing") void api.abandon(session.id).catch(() => undefined);
    router.push("/practice");
  }, [session, phase, router]);

  // ------------------------------------------------------------------ effects

  const onAnswerChange = useCallback(
    (next: Answer | null) => {
      setAnswer(next);
      // Match-pairs submits itself once every pair is matched.
      if (next && current?.type === "match_pairs") void check(next);
    },
    [current, check],
  );

  // Enter = check / continue, even while an answer tile has focus.
  useEffect(() => {
    if (phase !== "playing" || modal) return;
    const onKey = (e: KeyboardEvent) => {
      // Footer buttons already react to Enter natively.
      if (e.key !== "Enter" || (e.target instanceof Element && e.target.closest("[data-native-enter]"))) return;
      e.preventDefault();
      if (interlude) leaveInterlude();
      else if (feedback) next();
      else void check();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, modal, feedback, next, check, interlude, leaveInterlude]);

  // Legendary countdown.
  const now = useNow(deadline ? 250 : 60_000);
  const secondsLeft = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;
  const timedOut = phase === "playing" && secondsLeft === 0;
  useEffect(() => {
    if (timedOut && session) void api.abandon(session.id).catch(() => undefined);
  }, [timedOut, session]);

  // ------------------------------------------------------------------ render

  const heartsModal = (
    <OutOfHeartsModal
      open={modal === "hearts"}
      gems={me?.gems ?? 0}
      refillCost={me?.heart_refill_cost ?? 350}
      busy={busy}
      onRefill={refill}
      onPractice={practiceForHearts}
      onQuit={quit}
    />
  );

  if (phase === "error" && error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <ErrorScreen error={error} />
        <Button variant="secondary" onClick={exit}>
          Back to learn
        </Button>
      </div>
    );
  }
  if (phase === "no_hearts") return <div className="min-h-screen">{heartsModal}</div>;
  if (phase === "loading" || !session) return <LoadingScreen fullScreen />;

  if (result && END_SCREENS.has(phase)) {
    const screens = endScreens(session.kind, result);
    const advance = () => {
      const nextScreen = screens[screens.indexOf(phase as EndScreen) + 1];
      if (nextScreen) setPhase(nextScreen);
      else exit();
    };
    switch (phase as EndScreen) {
      case "complete":
        return <LessonComplete kind={session.kind} result={result} onContinue={advance} />;
      case "streak":
        return <StreakCelebration streak={result.streak} today={result.me.today} onContinue={advance} />;
      case "score":
        return <ScoreProgress result={result} onContinue={advance} />;
      case "quests":
        return <QuestsProgress result={result} onContinue={advance} />;
      case "gems":
        return <GemReward gems={result.gems_earned} onContinue={advance} />;
      case "legendary":
        return (
          <LegendaryOffer
            onStart={() => {
              void refresh();
              router.push(`/legendary/${session.skill_id}`);
            }}
            onContinue={advance}
          />
        );
    }
  }
  if (phase === "failed" || timedOut) {
    return (
      <LessonFailed
        title={timedOut || failReason === "time" ? "Out of time!" : "Too many mistakes"}
        body={
          kind === "legendary"
            ? "Legendary challenges must be finished quickly and accurately. You've got this, try again!"
            : kind === "unit_test"
              ? "You can always keep learning and try the test again later."
              : "Give it another go!"
        }
        onRetry={() => void start()}
        onExit={exit}
      />
    );
  }

  const progress = solved.size / session.exercises.length;
  const mistakesLeft = session.max_mistakes !== null ? Math.max(0, session.max_mistakes - mistakes) : null;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <LessonHeader
        kind={session.kind}
        progress={progress}
        hearts={hearts}
        combo={combo}
        secondsLeft={secondsLeft}
        mistakesLeft={mistakesLeft}
        // Like Duolingo: nothing to lose yet, so leave without asking.
        onQuit={() => (solved.size === 0 && mistakes === 0 ? quit() : setModal("quit"))}
      />

      {interlude ? (
        <Interlude text={interlude.text} onContinue={leaveInterlude} />
      ) : (
        <>
      <main className="flex flex-1 justify-center px-4 py-8 sm:items-center">
        <div className="w-full max-w-[600px]">
          {current && (
            <motion.div
              key={pos}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {pos >= session.exercises.length && (
                <p className="mb-2 flex items-center gap-2 text-[15px] font-extrabold uppercase tracking-[0.5px] text-fox">
                  <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-fox text-bg">↺</span>
                  Previous mistake
                </p>
              )}
              <ExerciseView
                exercise={current}
                language={session.language}
                locked={!!feedback || phase === "finishing"}
                feedback={feedback ? (feedback.correct ? "correct" : "wrong") : null}
                onChange={onAnswerChange}
              />
            </motion.div>
          )}
        </div>
      </main>

      <LessonFooter
        feedback={feedback}
        canCheck={answer !== null && phase === "playing"}
        checking={phase === "finishing"}
        showSkip={current?.type !== "match_pairs"}
        praiseIndex={praise}
        onCheck={() => void check()}
        onSkip={() => void check({ skipped: true })}
        onContinue={next}
      />
        </>
      )}

      <QuitModal open={modal === "quit"} onStay={() => setModal(null)} onQuit={quit} />
      {heartsModal}
    </div>
  );
}

/** Owl popping up from the bottom with a speech bubble, between exercises. */
function Interlude({ text, onContinue }: { text: string; onContinue: () => void }) {
  return (
    <>
      <main className="relative flex flex-1 items-end justify-center overflow-hidden px-4">
        <div className="flex w-full max-w-[600px] items-end gap-3">
          {/* Duolingo's "Mid Lesson Duo" animation: Duo pops up from the bottom edge. */}
          <div className="-ml-4 h-[140px] w-[140px] shrink-0 sm:h-[170px] sm:w-[170px]">
            <LottieAnim
              src={DUO.midLessonDuo}
              loop={false}
              style={{ width: "100%", height: "100%" }}
              fallback={<Owl size={150} mood="celebrate" />}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="relative mb-10 rounded-2xl border-2 border-line px-4 py-3 text-[17px] font-extrabold sm:mb-12"
          >
            <span className="absolute -left-[9px] top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-line bg-bg" />
            {text}
          </motion.div>
        </div>
      </main>
      <footer className="border-t-2 border-line" data-native-enter>
        <div className="mx-auto flex max-w-[1032px] justify-end px-4 py-4 sm:h-[140px] sm:items-center sm:py-0">
          <Button onClick={onContinue} className="w-full sm:w-[150px]" autoFocus>
            Continue
          </Button>
        </div>
      </footer>
    </>
  );
}
