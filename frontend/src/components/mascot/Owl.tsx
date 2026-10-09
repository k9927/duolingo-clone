"use client";

import { motion, type Transition } from "motion/react";
import { useId } from "react";

export type OwlMood = "happy" | "sad" | "celebrate" | "think" | "wink";

interface OwlProps {
  mood?: OwlMood;
  size?: number;
  className?: string;
  /** Idle animation: bounce, blink, glance around and wave. */
  animate?: boolean;
}

const GREEN = "#58CC02";
const GREEN_LIGHT = "#89E219";
const GREEN_DARK = "#46A302";
const FACE = "#A5ED6E";
const ORANGE = "#FF9600";
const ORANGE_LIGHT = "#FFC800";
const PUPIL = "#4B4B4B";

const forever = (t: Transition): Transition => ({ repeat: Infinity, ease: "easeInOut", ...t });

/** Duo-style owl mascot drawn in SVG with idle animations (used on the path, lessons and celebrations). */
export function Owl({ mood = "happy", size = 120, className, animate = true }: OwlProps) {
  const id = useId().replace(/:/g, "");
  const celebrate = mood === "celebrate";
  const sad = mood === "sad";
  const pupilY = sad ? 6 : mood === "think" ? -6 : 2;
  const on = animate;

  // Pivot SVG parts around their own box.
  const pivot = (x: string, y: string) => ({ transformBox: "fill-box" as const, originX: x, originY: y });

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-hidden
      style={pivot("50%", "100%")}
      animate={
        on
          ? celebrate
            ? { y: [0, -14, 0], scaleY: [1, 1.04, 0.96, 1] }
            : { y: [0, -4, 0], scaleY: [1, 0.985, 1] }
          : undefined
      }
      transition={forever({ duration: celebrate ? 0.7 : 2.4 })}
    >
      <defs>
        <radialGradient id={`body-${id}`} cx="35%" cy="25%" r="85%">
          <stop offset="0%" stopColor="#6FDB12" />
          <stop offset="55%" stopColor={GREEN} />
          <stop offset="100%" stopColor="#4DB802" />
        </radialGradient>
        {[76, 124].map((cx) => (
          <clipPath key={cx} id={`eye-${id}-${cx}`}>
            <ellipse cx={cx} cy="86" rx="23" ry="25" />
          </clipPath>
        ))}
      </defs>

      {/* left wing */}
      <motion.path
        d="M40 100 C16 108 12 146 30 162 C42 150 46 128 46 108 Z"
        fill={GREEN_DARK}
        style={pivot("100%", "0%")}
        animate={on && celebrate ? { rotate: [0, 35, 0] } : { rotate: 0 }}
        transition={forever({ duration: 0.7 })}
      />
      {/* right wing (waves now and then) */}
      <motion.path
        d="M160 100 C184 108 188 146 170 162 C158 150 154 128 154 108 Z"
        fill={GREEN_DARK}
        style={pivot("0%", "0%")}
        animate={on ? (celebrate ? { rotate: [0, -35, 0] } : { rotate: [0, -30, 0, -30, 0] }) : { rotate: 0 }}
        transition={celebrate ? forever({ duration: 0.7 }) : forever({ duration: 1.2, repeatDelay: 4.5 })}
      />

      {/* feet */}
      <g fill={ORANGE}>
        <path d="M70 176 q6 -6 12 0 q2 8 -6 10 q-8 -2 -6 -10Z" />
        <path d="M118 176 q6 -6 12 0 q2 8 -6 10 q-8 -2 -6 -10Z" />
      </g>

      {/* body with ear tufts */}
      <path
        d="M38 70 C35 54 39 38 47 28 C62 35 78 38 100 38 C122 38 138 35 153 28 C161 38 165 54 162 70
           C171 96 171 130 165 150 C157 172 131 181 100 181 C69 181 43 172 35 150 C29 130 29 96 38 70 Z"
        fill={`url(#body-${id})`}
      />
      {/* belly */}
      <path d="M56 138 C56 120 78 114 100 114 C122 114 144 120 144 138 C144 162 124 174 100 174 C76 174 56 162 56 138 Z" fill={GREEN_LIGHT} />
      <g stroke={GREEN} strokeWidth="3.5" fill="none" strokeLinecap="round">
        <path d="M82 138 l6 6 6 -6" />
        <path d="M106 138 l6 6 6 -6" />
        <path d="M94 154 l6 6 6 -6" />
      </g>

      {/* face mask */}
      <path
        d="M46 86 C46 60 64 50 82 54 C90 56 96 60 100 64 C104 60 110 56 118 54 C136 50 154 60 154 86 C154 110 134 120 116 116 C108 114 103 110 100 108 C97 110 92 114 84 116 C66 120 46 110 46 86 Z"
        fill={FACE}
        opacity="0.55"
      />

      {/* eyes */}
      {[
        { cx: 76, flip: false },
        { cx: 124, flip: true },
      ].map(({ cx, flip }) => {
        const winkThis = mood === "wink" && flip;
        return (
          <g key={cx}>
            <ellipse cx={cx} cy="86" rx="23" ry="25" fill="#fff" />
            {winkThis ? (
              <path d={`M${cx - 15} 90 q15 -14 30 0`} stroke={PUPIL} strokeWidth="5" fill="none" strokeLinecap="round" />
            ) : (
              <motion.g
                animate={on ? { x: [0, 5, 5, -3, -3, 0] } : undefined}
                transition={forever({ duration: 7, times: [0, 0.1, 0.4, 0.5, 0.85, 1] })}
              >
                <ellipse cx={cx + 4} cy={89 + pupilY} rx="11" ry="14" fill={PUPIL} />
                <circle cx={cx + 8} cy={82 + pupilY} r="4" fill="#fff" />
              </motion.g>
            )}
            {/* eyelid: blinks, and droops when sad */}
            {!winkThis && (
              <g clipPath={`url(#eye-${id}-${cx})`}>
                <motion.rect
                  x={cx - 24}
                  y="60"
                  width="48"
                  height="52"
                  fill={GREEN}
                  style={pivot("50%", "0%")}
                  initial={{ scaleY: sad ? 0.45 : 0 }}
                  animate={on ? { scaleY: sad ? [0.45, 0.6, 0.45] : [0, 0, 1, 0] } : { scaleY: sad ? 0.45 : 0 }}
                  transition={forever({ duration: sad ? 4 : 4.2, times: sad ? undefined : [0, 0.94, 0.97, 1] })}
                />
              </g>
            )}
          </g>
        );
      })}

      {/* beak */}
      <motion.g style={pivot("50%", "0%")} animate={on && celebrate ? { scaleY: [1, 1.25, 1] } : undefined} transition={forever({ duration: 0.7 })}>
        <path d="M91 110 C95 105 105 105 109 110 C107 119 103 124 100 126 C97 124 93 119 91 110 Z" fill={ORANGE} />
        <path d="M93 110 C97 107 103 107 107 110 C103 113 97 113 93 110 Z" fill={ORANGE_LIGHT} />
      </motion.g>

      {/* tear when sad */}
      {sad && (
        <motion.path
          d="M58 104 q-5 9 0 12 q5 -3 0 -12Z"
          fill="#84D8FF"
          animate={on ? { y: [0, 14], opacity: [1, 0] } : undefined}
          transition={forever({ duration: 1.6 })}
        />
      )}
    </motion.svg>
  );
}
