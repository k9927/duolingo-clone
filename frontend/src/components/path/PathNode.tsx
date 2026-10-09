"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { DuoImg } from "../ui/DuoImg";
import { DUO } from "@/lib/duoAssets";
import type { SkillNode } from "@/lib/types";

const RING_W = 98;
const RING_H = 93;
const STROKE = 8;

interface PathNodeProps {
  skill: SkillNode;
  color: string;
  onClick: () => void;
  selected: boolean;
}

/** Duolingo's node shadow is the fill colour with 20% black over it. */
export const nodeShadow = (color: string) => `color-mix(in srgb, ${color} 80%, black)`;

/** A 70×57 lesson button on the path, with progress ring and START bubble on the current one. */
export const PathNode = forwardRef<HTMLDivElement, PathNodeProps>(function PathNode(
  { skill, color, onClick, selected },
  ref,
) {
  const { state } = skill;
  const locked = state === "locked";
  const legendary = state === "legendary";
  const fill = locked ? "var(--swan)" : legendary ? "var(--bee)" : color;
  const progress = skill.lessons_completed / skill.lessons_total;
  const rx = (RING_W - STROKE) / 2;
  const ry = (RING_H - STROKE) / 2;
  // Ellipse perimeter (Ramanujan) for the progress dash.
  const perimeter = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));

  return (
    <div ref={ref} className="relative h-[65px] w-[70px]">
      {state === "active" && (
        <>
          <svg
            width={RING_W}
            height={RING_H}
            className="pointer-events-none absolute -left-[14px] -top-[14px] -rotate-90"
            viewBox={`0 0 ${RING_W} ${RING_H}`}
            aria-hidden
          >
            <ellipse cx={RING_W / 2} cy={RING_H / 2} rx={rx} ry={ry} stroke="var(--swan)" strokeWidth={STROKE} fill="none" />
            <ellipse
              cx={RING_W / 2}
              cy={RING_H / 2}
              rx={rx}
              ry={ry}
              stroke={color}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={perimeter}
              strokeDashoffset={perimeter * (1 - progress)}
              style={{ transition: "stroke-dashoffset 600ms ease" }}
            />
          </svg>
          {!selected && (
            <div
              onClick={onClick}
              className="absolute -top-[66px] left-1/2 z-10 animate-bounce-soft cursor-pointer whitespace-nowrap rounded-[10px] border-2 border-line bg-bg px-3 py-2.5 text-[17px] font-extrabold uppercase leading-none tracking-[0.5px]"
              style={{ color }}
            >
              Start
              <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-[5px] rotate-45 border-b-2 border-r-2 border-line bg-bg" />
            </div>
          )}
        </>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label={`${skill.title}: ${state}`}
        className="btn-3d relative flex h-[57px] w-[70px] items-center justify-center rounded-[50%]"
        style={
          {
            "--btn-bg": fill,
            "--btn-shadow": nodeShadow(fill),
            boxShadow: `0 8px 0 ${nodeShadow(fill)}`,
          } as React.CSSProperties
        }
      >
        <DuoImg
          src={legendary ? DUO.path.legendary : state === "completed" ? DUO.path.completed : locked ? DUO.path.starLocked : DUO.path.star}
          width={42}
          height={34}
        />
      </button>
    </div>
  );
});

/** First node of a locked unit: a fast-forward button that starts the unit test. */
export function JumpNode({ skillId, unitNumber, color }: { skillId: number; unitNumber: number; color: string }) {
  return (
    <Link href={`/jump/${skillId}`} aria-label={`Jump to Unit ${unitNumber}`} className="relative block h-[65px] w-[70px]">
      <span
        className="absolute -top-[57px] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[10px] border-2 border-line bg-bg px-3 py-2.5 text-[17px] font-extrabold uppercase leading-none tracking-[0.5px]"
        style={{ color }}
      >
        Jump here?
        <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-[5px] rotate-45 border-b-2 border-r-2 border-line bg-bg" />
      </span>
      <span
        className="btn-3d relative flex h-[57px] w-[70px] items-center justify-center rounded-[50%]"
        style={{ "--btn-bg": color, "--btn-shadow": nodeShadow(color), boxShadow: `0 8px 0 ${nodeShadow(color)}` } as React.CSSProperties}
      >
        <DuoImg src={DUO.path.jump} width={42} height={34} />
      </span>
    </Link>
  );
}
