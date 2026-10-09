"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sounds as sfx } from "@/lib/sounds";
import { speak } from "@/lib/speech";

// Spanish sounds with an example word each (shown like Duolingo's "Sounds" tab).
const VOWELS: [string, string][] = [
  ["a", "casa"],
  ["e", "mesa"],
  ["i", "sí"],
  ["o", "oso"],
  ["u", "uno"],
  ["ai", "aire"],
  ["ei", "rey"],
  ["oi", "hoy"],
  ["au", "auto"],
];

const CONSONANTS: [string, string][] = [
  ["b", "bebé"],
  ["c", "casa"],
  ["ch", "chico"],
  ["d", "dedo"],
  ["f", "foto"],
  ["g", "gato"],
  ["h", "hola"],
  ["j", "jugo"],
  ["l", "luna"],
  ["ll", "llave"],
  ["m", "mamá"],
  ["n", "nube"],
  ["ñ", "niño"],
  ["p", "papá"],
  ["qu", "queso"],
  ["r", "pero"],
  ["rr", "perro"],
  ["s", "sol"],
  ["t", "té"],
  ["v", "vaca"],
  ["x", "taxi"],
  ["y", "yo"],
  ["z", "zapato"],
];

function SoundGrid({ title, items, heard, onPlay }: { title: string; items: [string, string][]; heard: Set<string>; onPlay: (s: string, w: string) => void }) {
  return (
    <section className="mb-10">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-0.5 flex-1 bg-line" />
        <h2 className="text-[19px] font-extrabold">{title}</h2>
        <div className="h-0.5 flex-1 bg-line" />
      </div>
      <div className="mx-auto grid max-w-[592px] grid-cols-3 gap-2.5">
        {items.map(([symbol, word]) => {
          const done = heard.has(symbol);
          return (
            <button
              key={symbol}
              onClick={() => onPlay(symbol, word)}
              className="tile flex h-[78px] flex-col items-center justify-center rounded-2xl bg-bg hover:bg-surface-2"
            >
              <span className="text-[17px] font-extrabold leading-tight">{symbol}</span>
              <span className="text-[15px] font-semibold text-faint">{word}</span>
              <span className="mt-1.5 h-2 w-12 overflow-hidden rounded-full bg-line">
                <span className={`block h-full rounded-full bg-bee transition-all ${done ? "w-full" : "w-0"}`} />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function SoundsPage() {
  const [heard, setHeard] = useState<Set<string>>(new Set());

  const play = (symbol: string, word: string) => {
    sfx.tap();
    speak(word, "es", true);
    setHeard((h) => new Set(h).add(symbol));
  };

  return (
    <div className="px-4 pt-6 min-[1100px]:!px-0 min-[1100px]:pt-10">
      <div className="mb-10 flex flex-col items-center text-center">
        <h1 className="text-[32px] font-extrabold leading-tight">Let&apos;s learn Spanish sounds!</h1>
        <p className="mt-4 text-[19px] font-semibold">Train your ear and learn to pronounce Spanish sounds</p>
        <Button variant="secondary" size="lg" href="/practice" className="mt-8 w-full max-w-[390px]">
          Start +10 XP
        </Button>
      </div>
      <SoundGrid title="Vowels" items={VOWELS} heard={heard} onPlay={play} />
      <SoundGrid title="Consonants" items={CONSONANTS} heard={heard} onPlay={play} />
    </div>
  );
}
