"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import type { SkillNode } from "@/lib/types";

interface NodePopoverProps {
  skill: SkillNode;
  color: string;
}

/** The speech-bubble card that opens under a path node. */
export function NodePopover({ skill, color }: NodePopoverProps) {
  const router = useRouter();
  const locked = skill.state === "locked";
  const done = skill.state === "completed" || skill.state === "legendary";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute left-1/2 top-full z-20 mt-3 w-[300px] -translate-x-1/2"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`relative rounded-2xl p-4 ${locked ? "border-2 border-line bg-surface-2" : ""}`}
        style={locked ? undefined : { background: done && skill.state === "legendary" ? "#FFC800" : color }}
      >
        <span
          className={`absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 ${locked ? "border-l-2 border-t-2 border-line bg-surface-2" : ""}`}
          style={locked ? undefined : { background: skill.state === "legendary" ? "#FFC800" : color }}
        />
        <p className={`text-[19px] font-extrabold ${locked ? "text-faint" : "text-white"}`}>
          {skill.title}
        </p>
        <p className={`mb-4 mt-1 font-bold ${locked ? "text-faint" : "text-white/90"}`}>
          {locked
            ? "Complete all levels above to unlock this!"
            : skill.state === "legendary"
              ? "You've reached Legendary! Keep it fresh with practice."
              : done
                ? "Prove your proficiency with Legendary"
                : `Lesson ${skill.lessons_completed + 1} of ${skill.lessons_total}`}
        </p>

        {locked ? (
          <Button full disabled>
            Locked
          </Button>
        ) : done ? (
          <div className="flex flex-col gap-3">
            <Button variant="white" full textColor={color} onClick={() => router.push(`/practice/${skill.id}`)}>
              Practice +10 XP
            </Button>
            {skill.state === "completed" && (
              <Button variant="gold" full onClick={() => router.push(`/legendary/${skill.id}`)}>
                Legendary +40 XP
              </Button>
            )}
          </div>
        ) : (
          <Button variant="white" full textColor={color} onClick={() => router.push(`/lesson/${skill.id}`)}>
            Start +10 XP
          </Button>
        )}
      </div>
    </motion.div>
  );
}
