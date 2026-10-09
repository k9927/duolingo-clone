"use client";

import Link from "next/link";
import { DuoImg } from "../ui/DuoImg";
import { DUO } from "@/lib/duoAssets";
import type { UnitData } from "@/lib/types";

export function UnitBanner({ unit }: { unit: UnitData }) {
  return (
    <div
      className="flex min-h-[80px] items-stretch justify-between overflow-hidden rounded-[13px] text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] sm:min-h-[90px] sm:items-center sm:gap-3 sm:p-4 sm:shadow-none"
      style={{ background: unit.color, color: "#fff" }}
    >
      <div className="min-w-0 self-center p-4 sm:p-0">
        <p className="flex items-center gap-2 text-[15px] font-extrabold uppercase text-white/80 sm:text-base">
          <span className="hidden sm:inline-flex">
            <DuoImg src={DUO.path.sectionArrow} width={16} />
          </span>
          Section {unit.section}, Unit {unit.position}
        </p>
        <h2 className="mt-1 truncate text-lg font-extrabold leading-tight sm:text-[22px]">{unit.title}</h2>
      </div>
      <Link
        href={`/guidebook/${unit.id}`}
        aria-label="Opens Guidebook for this unit"
        className="flex shrink-0 items-center gap-2.5 border-l-2 border-black/20 px-4 text-[15px] font-extrabold uppercase tracking-[0.8px] transition hover:bg-white/10 sm:h-[50px] sm:rounded-2xl sm:border-2 sm:shadow-[0_2px_0_rgba(0,0,0,0.2)] sm:active:translate-y-[2px] sm:active:shadow-none"
        style={{ color: unit.color }}
      >
        <DuoImg src={DUO.path.guidebook} width={24} />
        <span className="hidden text-white sm:inline">Guidebook</span>
      </Link>
    </div>
  );
}
