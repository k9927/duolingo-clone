"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExerciseTitle, KeyHint, type ExerciseProps } from "./shared";
import { sounds } from "@/lib/sounds";
import { say } from "@/lib/speech";

type Side = "left" | "right";
interface Item {
  pairId: string;
  text: string;
  side: Side;
  tts?: string;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Tap a word in each column to pair them up. Mismatches flash red but cost no hearts. */
export function MatchPairs({ exercise, language, locked, onChange }: ExerciseProps<"match_pairs">) {
  const pairs = exercise.data.pairs;
  const [columns] = useState(() => ({
    left: shuffle(pairs.map((p) => ({ pairId: p.id, text: p.left, side: "left" as const, tts: p.tts }))),
    right: shuffle(pairs.map((p) => ({ pairId: p.id, text: p.right, side: "right" as const }))),
  }));
  const [selected, setSelected] = useState<Item | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<Item[]>([]);
  const [justMatched, setJustMatched] = useState<string | null>(null);

  const tap = useCallback(
    (item: Item) => {
      if (locked || matched.includes(item.pairId) || wrong.length) return;
      if (item.side === "left") say(item.text, item.tts, language);
      if (!selected || selected.side === item.side) {
        setSelected(item);
        if (item.side === "right") sounds.tap();
        return;
      }
      if (selected.pairId === item.pairId) {
        const nextMatched = [...matched, item.pairId];
        setMatched(nextMatched);
        setJustMatched(item.pairId);
        setTimeout(() => setJustMatched(null), 450);
        sounds.correct();
        if (nextMatched.length === pairs.length) {
          onChange({ matches: nextMatched.map((id) => ({ left: id, right: id })) });
        }
      } else {
        setWrong([selected, item]);
        sounds.wrong();
        setTimeout(() => setWrong([]), 550);
      }
      setSelected(null);
    },
    [locked, matched, wrong.length, selected, language, pairs.length, onChange],
  );

  const all = useMemo(() => [...columns.right, ...columns.left], [columns]);
  const keyTap = useCallback((i: number) => tap(all[i]), [tap, all]);
  useNumberKeysForPairs(all.length, keyTap, !locked);

  const renderItem = (item: Item, index: number) => {
    const isMatched = matched.includes(item.pairId);
    const isSel = selected === item;
    const isWrong = wrong.includes(item);
    const flash = justMatched === item.pairId;
    let cls = "tile bg-bg hover:bg-surface-2";
    if (isMatched && !flash) cls = "tile bg-bg text-line [&_span]:!border-line [&_span]:!text-line";
    else if (flash) cls = "tile !border-correct-line bg-correct-bg text-correct-ink";
    else if (isWrong) cls = "tile !border-cardinal bg-wrong-bg text-wrong-ink animate-shake";
    else if (isSel) cls = "tile !border-sel-line bg-sel text-sel-ink";
    return (
      <button
        key={`${item.side}-${item.pairId}`}
        disabled={locked || isMatched}
        onClick={() => tap(item)}
        className={`flex min-h-[51px] items-center gap-3 rounded-xl px-3 py-2 text-left ${cls}`}
      >
        <KeyHint n={(index + 1) % 10} active={isSel} />
        <span className="flex-1 text-center text-[17px] font-semibold sm:text-[19px]">{item.text}</span>
      </button>
    );
  };

  return (
    <div>
      <ExerciseTitle>{exercise.prompt}</ExerciseTitle>
      {/* Duolingo lists the English words on the left and the Spanish on the right. */}
      <div className="mx-auto grid max-w-[540px] grid-cols-2 gap-x-4 sm:gap-x-7">
        <div className="flex flex-col gap-2.5">{columns.right.map((item, i) => renderItem(item, i))}</div>
        <div className="flex flex-col gap-2.5">{columns.left.map((item, i) => renderItem(item, i + columns.right.length))}</div>
      </div>
    </div>
  );
}

/** Keys 1-9 then 0 map to the ten tiles. */
function useNumberKeysForPairs(count: number, onKey: (index: number) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (!/^[0-9]$/.test(e.key)) return;
      const index = e.key === "0" ? 9 : Number(e.key) - 1;
      if (index < count) onKey(index);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [count, onKey, enabled]);
}
