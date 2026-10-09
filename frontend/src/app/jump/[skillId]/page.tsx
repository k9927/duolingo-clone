"use client";

import { use } from "react";
import { JumpTest } from "@/components/lesson/JumpTest";

export default function JumpPage({ params }: PageProps<"/jump/[skillId]">) {
  const { skillId } = use(params);
  return <JumpTest skillId={Number(skillId)} />;
}
