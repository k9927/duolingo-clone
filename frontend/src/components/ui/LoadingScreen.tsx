"use client";

import { useState } from "react";
import { LottieAnim } from "../mascot/LottieAnim";
import { Owl } from "../mascot/Owl";
import { DUO } from "@/lib/duoAssets";
import { Button } from "./Button";
import type { ApiError } from "@/lib/api";

// Fun facts Duolingo shows under its loading animation (from Duolingo's own copy).
const FACTS = [
  "More Americans are learning a language on Duolingo than in the U.S. public school system.",
  "More people are learning Irish on Duolingo than there are native Irish speakers.",
  "15 minutes a day can teach you a language. What can 15 minutes of social media do?",
  "Duolingo is the world’s largest community of language learners.",
  "Our mission is to develop the best education in the world and make it universally available.",
  "Duolingo learners with high grit and motivation did more lessons, and learners who did more lessons learned more.",
];

/** Duolingo's loading screen: whistling Duo, "LOADING..." and a fun fact. */
export function LoadingScreen({ fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  const [fact] = useState(() => FACTS[Math.floor(Math.random() * FACTS.length)]);
  return (
    <div className={`flex flex-col items-center justify-center px-6 text-center ${fullScreen ? "fixed inset-0 z-50 bg-bg" : "min-h-[60vh]"}`}>
      {/* The animation canvas has generous padding, so it is scaled up and the padding trimmed. */}
      <div className="-my-24 h-[440px] w-[440px] max-w-[110vw]">
        <LottieAnim src={DUO.loadingDuo} style={{ width: "100%", height: "100%" }} fallback={<Owl size={110} mood="think" />} />
      </div>
      <p className="mt-2 text-[17px] font-extrabold uppercase tracking-[1.5px] text-faint">Loading...</p>
      {fullScreen && (
        <p className="mt-5 max-w-[380px] text-[19px] font-semibold leading-relaxed" suppressHydrationWarning>
          {fact}
        </p>
      )}
    </div>
  );
}

export function ErrorScreen({ error, onRetry }: { error: ApiError | Error; onRetry?: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <Owl size={110} mood="sad" />
      <h2 className="text-2xl font-extrabold">Oops, something went wrong</h2>
      <p className="max-w-sm font-semibold text-muted">{error.message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
