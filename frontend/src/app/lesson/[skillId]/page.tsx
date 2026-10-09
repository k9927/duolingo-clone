"use client";

import { use } from "react";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

export default function LessonPage({ params }: PageProps<"/lesson/[skillId]">) {
  const { skillId } = use(params);
  return <LessonPlayer kind="lesson" skillId={Number(skillId)} />;
}
