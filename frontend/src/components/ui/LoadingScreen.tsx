"use client";

import { LottieAnim } from "../mascot/LottieAnim";
import { Owl } from "../mascot/Owl";
import { DUO } from "@/lib/duoAssets";
import { Button } from "./Button";
import type { ApiError } from "@/lib/api";

/**
 * Duolingo's loading screen: the whistling Duo above a small "LOADING..." label,
 * sized from a recording of duolingo.com. Nothing is drawn while the animation file
 * loads, so there's no fallback flashing in before Duo appears.
 */
export function LoadingScreen({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 text-center ${fullScreen ? "fixed inset-0 z-50 bg-bg" : "min-h-[60vh]"}`}>
      {/* The animation canvas has generous padding around Duo, so its empty edges are trimmed with negative margins. */}
      <div className="-my-[86px] h-[300px] w-[300px]">
        <LottieAnim src={DUO.loadingDuo} style={{ width: "100%", height: "100%" }} />
      </div>
      <p className="mt-12 text-[15px] font-bold uppercase tracking-[0.8px] text-faint">Loading...</p>
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
