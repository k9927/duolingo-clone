"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { LottieAnim } from "../mascot/LottieAnim";
import { Owl } from "../mascot/Owl";
import { DuoImg } from "../ui/DuoImg";
import { DUO } from "@/lib/duoAssets";
import { NodePopover } from "./NodePopover";
import { JumpNode, nodeShadow, PathNode } from "./PathNode";
import { UnitBanner } from "./UnitBanner";
import type { PathData, UnitData } from "@/lib/types";

// Horizontal offsets (px) of successive nodes, as measured on duolingo.com.
// Odd units wind the other way.
const OFFSETS = [0, -45, -70, -45, 0, 45, 70, 45];

export function LearningPath({ path }: { path: PathData }) {
  const [selected, setSelected] = useState<number | null>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const bannerRef = useRef<HTMLDivElement>(null);
  const current = useCurrentUnit(sectionRefs, bannerRef);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  useEffect(() => {
    // React listens on the document too, so stopPropagation can't shield the node
    // from this listener: ignore clicks that land on a node or its popover instead.
    const close = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("[data-path-node]")) return;
      setSelected(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div className="relative px-4 pt-6 sm:px-6 min-[1100px]:!px-0 min-[1100px]:pt-12">
      {/* One banner pinned to the top that switches to whichever unit is being scrolled through. */}
      <div ref={bannerRef} className="sticky top-[62px] z-20 min-[1100px]:top-6">
        <UnitBanner unit={path.units[current] ?? path.units[0]} />
      </div>
      {path.units.map((unit, unitIndex) => (
        <section
          key={unit.id}
          ref={(el) => {
            sectionRefs.current[unitIndex] = el;
          }}
          className="mb-6"
        >
          {unitIndex > 0 && (
            <div className="mb-6 mt-4 flex items-center gap-4 text-faint">
              <div className="h-0.5 flex-1 bg-line" />
              <span className="text-[17px] font-bold">{unit.title}</span>
              <div className="h-0.5 flex-1 bg-line" />
            </div>
          )}
          <UnitNodes
            unit={unit}
            unitIndex={unitIndex}
            direction={unitIndex % 2 === 0 ? 1 : -1}
            selected={selected}
            onSelect={(id) => setSelected((s) => (s === id ? null : id))}
            activeRef={activeRef}
          />
        </section>
      ))}
      <ScrollToTop />
    </div>
  );
}

/** Index of the unit whose section has scrolled up to the pinned banner. */
function useCurrentUnit(sections: React.RefObject<(HTMLElement | null)[]>, banner: React.RefObject<HTMLElement | null>) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const bannerBottom = banner.current?.getBoundingClientRect().bottom ?? 140;
      let index = 0;
      sections.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= bannerBottom) index = i;
      });
      setCurrent(index);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections, banner]);
  return current;
}

interface UnitNodesProps {
  unit: UnitData;
  unitIndex: number;
  direction: 1 | -1;
  selected: number | null;
  onSelect: (skillId: number) => void;
  activeRef: React.RefObject<HTMLDivElement | null>;
}

function UnitNodes({ unit, unitIndex, direction, selected, onSelect, activeRef }: UnitNodesProps) {
  const chestAfter = 1; // a reward chest sits after the second skill of each unit
  const chestOpen = ["completed", "legendary"].includes(unit.skills[chestAfter]?.state ?? "");
  const started = unit.completed || unit.skills.some((s) => s.state !== "locked");
  // Unit 1 is never locked, so the locked artwork starts at Unit 2.
  const lockedIndex = Math.max(0, unitIndex - 1) % DUO.lockedCharacters.dark.length;
  const lockedCharacter = { light: DUO.lockedCharacters.light[lockedIndex], dark: DUO.lockedCharacters.dark[lockedIndex] };
  let row = 0;
  // Margin that shifts a centred flex item by `offset` px.
  const shift = () => ({ marginLeft: OFFSETS[row++ % OFFSETS.length] * direction * 2 });

  return (
    <div className="relative flex flex-col items-center gap-6 overflow-x-clip pb-4 pt-[84px]">
      {/* Mascot standing on its platform beside the path; greyed out until the unit is reached. */}
      <div
        className={`pointer-events-none absolute top-[162px] flex flex-col items-center ${
          direction === 1 ? "left-[calc(50%-18px)]" : "right-[calc(50%-18px)]"
        }`}
      >
        {started ? (
          <>
            <div className="h-[190px] w-[200px] sm:h-[261px] sm:w-[276px]">
              <LottieAnim
                src={DUO.unitCharacters[unitIndex % DUO.unitCharacters.length]}
                style={{ width: "100%", height: "100%" }}
                fallback={<Owl size={130} />}
              />
            </div>
          </>
        ) : (
          <DuoImg src={lockedCharacter} width={180} height={174} />
        )}
      </div>

      {unit.skills.map((skill, i) => (
        <Fragment key={skill.id}>
          {/* A locked unit opens with a "Jump here?" node that starts the unit test. */}
          {i === 0 && unitIndex > 0 && !started ? (
            <div className="relative" style={shift()}>
              <JumpNode skillId={skill.id} unitNumber={unit.position} color={unit.color} />
            </div>
          ) : (
          /* The current node gets headroom for its START bubble. */
          <div data-path-node className="relative" style={{ ...shift(), marginTop: skill.state === "active" && i > 0 ? 36 : 0 }}>
            <PathNode
              ref={skill.state === "active" ? activeRef : undefined}
              skill={skill}
              color={unit.color}
              selected={selected === skill.id}
              onClick={() => onSelect(skill.id)}
            />
            <AnimatePresence>{selected === skill.id && <NodePopover skill={skill} color={unit.color} />}</AnimatePresence>
          </div>
          )}
          {i === chestAfter && (
            <div className="flex h-[90px] w-[80px] items-center justify-center" style={shift()}>
              <DuoImg src={chestOpen ? DUO.path.chestOpen : DUO.path.chestLocked} width={80} height={90} />
            </div>
          )}
        </Fragment>
      ))}

      <div style={shift()} title={unit.completed ? "Unit complete!" : "Finish the unit to earn this trophy"}>
        <div
          className="flex h-[57px] w-[70px] items-center justify-center rounded-[50%]"
          style={{
            background: unit.completed ? "var(--bee)" : "var(--swan)",
            boxShadow: `0 8px 0 ${nodeShadow(unit.completed ? "var(--bee)" : "var(--swan)")}`,
          }}
        >
          <DuoImg src={unit.completed ? DUO.path.trophyPassed : DUO.path.trophyLocked} width={42} height={34} />
        </div>
      </div>
    </div>
  );
}

/** Floating "back to top" button that appears once the path is scrolled. */
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="pointer-events-none sticky bottom-24 z-20 flex justify-end md:bottom-8">
      <AnimatePresence>
        {visible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="tile pointer-events-auto flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-bg text-macaw"
            aria-label="Scroll to top"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 20V5m0 0-6 6m6-6 6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
