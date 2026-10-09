"use client";

import { use } from "react";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

export default function LegendaryPage({ params }: PageProps<"/legendary/[skillId]">) {
  const { skillId } = use(params);
  return <LessonPlayer kind="legendary" skillId={Number(skillId)} />;
}
