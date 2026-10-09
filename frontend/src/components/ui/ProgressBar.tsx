"use client";

import { motion } from "motion/react";

interface ProgressBarProps {
  value: number; // 0..1
  color?: string;
  height?: number;
  className?: string;
}

/** Rounded bar with the glossy highlight stripe used across Duolingo. */
export function ProgressBar({ value, color = "var(--owl)", height = 16, className = "" }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-line ${className}`} style={{ height }}>
      <motion.div
        className="relative h-full rounded-full"
        style={{ background: color }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        {pct > 4 && (
          <div
            className="absolute left-2 right-2 rounded-full bg-white/30"
            style={{ top: height * 0.22, height: Math.max(3, height * 0.22) }}
          />
        )}
      </motion.div>
    </div>
  );
}
