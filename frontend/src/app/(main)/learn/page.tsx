"use client";

import { LearningPath } from "@/components/path/LearningPath";
import { ErrorScreen, LoadingScreen } from "@/components/ui/LoadingScreen";
import { api } from "@/lib/api";
import { useResource } from "@/lib/hooks";

export default function LearnPage() {
  const { data: path, error, reload } = useResource(api.path);

  if (error) return <ErrorScreen error={error} onRetry={reload} />;
  if (!path) return <LoadingScreen />;
  return <LearningPath path={path} />;
}
