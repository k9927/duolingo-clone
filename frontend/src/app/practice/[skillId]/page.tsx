"use client";

import { use } from "react";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

export default function SkillPracticePage({ params }: PageProps<"/practice/[skillId]">) {
  const { skillId } = use(params);
  return <LessonPlayer kind="practice" skillId={Number(skillId)} />;
}
