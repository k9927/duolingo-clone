"use client";

import { useParams } from "next/navigation";
import { Guidebook } from "@/components/path/Guidebook";

export default function GuidebookPage() {
  const { unitId } = useParams<{ unitId: string }>();
  return <Guidebook unitId={Number(unitId)} />;
}
