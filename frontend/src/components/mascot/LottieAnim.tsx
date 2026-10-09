"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useUser } from "../providers/UserProvider";

// lottie-web touches `window`, so only load it in the browser.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const cache = new Map<string, Promise<object>>();

function loadAnimation(src: string) {
  if (!cache.has(src)) {
    cache.set(
      src,
      fetch(src).then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${src}`);
        return r.json();
      }),
    );
  }
  return cache.get(src)!;
}

interface LottieAnimProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  loop?: boolean;
  /** Rendered while loading or if the animation can't be fetched. */
  fallback?: React.ReactNode;
}

/** Plays one of Duolingo's Lottie animations (Duo, lesson characters). */
export function LottieAnim({ src, className, style, loop = true, fallback = null }: LottieAnimProps) {
  // "Animations" off in Preferences: show each animation's first frame, still.
  const animate = useUser().me?.settings.animations ?? true;
  const [state, setState] = useState<{ src: string; data: object | null; failed: boolean }>({ src, data: null, failed: false });

  useEffect(() => {
    let cancelled = false;
    loadAnimation(src).then(
      (data) => !cancelled && setState({ src, data, failed: false }),
      () => !cancelled && setState({ src, data: null, failed: true }),
    );
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (state.src !== src || !state.data) return <>{fallback}</>;
  return <Lottie animationData={state.data} loop={animate && loop} autoplay={animate} className={className} style={style} />;
}
