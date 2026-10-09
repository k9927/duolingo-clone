"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { LessonPlayer } from "./LessonPlayer";
import { Button } from "../ui/Button";
import { DuoImg } from "../ui/DuoImg";
import { ErrorScreen, LoadingScreen } from "../ui/LoadingScreen";
import { api } from "@/lib/api";
import { DUO } from "@/lib/duoAssets";
import { useResource } from "@/lib/hooks";

/** "Jump here?": Duolingo's splash for a unit test, then the test itself. */
export function JumpTest({ skillId }: { skillId: number }) {
  const [started, setStarted] = useState(false);
  const { data: path, error, reload } = useResource(useCallback(() => api.path(), []));

  if (started) return <LessonPlayer kind="unit_test" skillId={skillId} />;
  if (error) return <ErrorScreen error={error} onRetry={reload} />;
  if (!path) return <LoadingScreen fullScreen />;

  const unit = path.units.find((u) => u.skills.some((s) => s.id === skillId));
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }}>
          <DuoImg src={DUO.jumpSplash} width={214} height={233} />
        </motion.div>
        <h1 className="mt-8 text-2xl font-extrabold">Pass this test to jump ahead to Unit {unit?.position ?? ""}!</h1>
      </div>
      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-[1032px] items-center justify-between gap-4 px-4 py-4 sm:h-[140px] sm:py-0">
          <Link
            href="/learn"
            className="rounded-2xl px-4 py-3 text-[17px] font-extrabold uppercase tracking-[0.8px] text-macaw transition hover:bg-surface-2"
          >
            Maybe later
          </Link>
          <Button onClick={() => setStarted(true)} className="w-full sm:w-[150px]" autoFocus>
            Let&apos;s go
          </Button>
        </div>
      </footer>
    </div>
  );
}
