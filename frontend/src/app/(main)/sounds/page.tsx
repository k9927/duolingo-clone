"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sounds as sfx } from "@/lib/sounds";
import { speakSequence } from "@/lib/speech";

// Spanish sounds with an example word each (shown like Duolingo's "Sounds" tab).
// Each entry is [symbol, example word, how the sound is spoken]. Like Duolingo, a tile
// plays the sound first and then the word. Text-to-speech can't voice a bare consonant,
// so consonants are spoken in a short syllable (silent "h" in "ha" comes out as "a",
// "ara" gives the single tapped r, "ax" the "ks" of taxi).
type Sound = [symbol: string, word: string, spoken: string];
const VOWELS: Sound[] = [
  ["a", "casa", "a"],
  ["e", "mesa", "e"],
  ["i", "sí", "i"],
  ["o", "oso", "o"],
  ["u", "uno", "u"],
  ["ai", "aire", "ai"],
  ["ei", "rey", "ei"],
  ["oi", "hoy", "oi"],
  ["au", "auto", "au"],
];

const CONSONANTS: Sound[] = [
  ["b", "bebé", "ba"],
  ["c", "casa", "ca"],
  ["ch", "chico", "cha"],
  ["d", "dedo", "da"],
  ["f", "foto", "fa"],
  ["g", "gato", "ga"],
  ["h", "hola", "ha"],
  ["j", "jugo", "ja"],
  ["l", "luna", "la"],
  ["ll", "llave", "lla"],
  ["m", "mamá", "ma"],
  ["n", "nube", "na"],
  ["ñ", "niño", "ña"],
  ["p", "papá", "pa"],
  ["qu", "queso", "que"],
  ["r", "pero", "ara"],
  ["rr", "perro", "rra"],
  ["s", "sol", "sa"],
  ["t", "té", "ta"],
  ["v", "vaca", "va"],
  ["x", "taxi", "ax"],
  ["y", "yo", "ya"],
  ["z", "zapato", "za"],
];

function SoundGrid({ title, items, heard, onPlay }: { title: string; items: Sound[]; heard: Set<string>; onPlay: (sound: Sound) => void }) {
  return (
    <section className="mb-10">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-0.5 flex-1 bg-line" />
        <h2 className="text-[19px] font-extrabold">{title}</h2>
        <div className="h-0.5 flex-1 bg-line" />
      </div>
      <div className="mx-auto grid max-w-[592px] grid-cols-3 gap-2.5">
        {items.map((sound) => {
          const [symbol, word] = sound;
          const done = heard.has(symbol);
          return (
            <button
              key={symbol}
              onClick={() => onPlay(sound)}
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

  const play = ([symbol, word, spoken]: Sound) => {
    sfx.tap();
    speakSequence([spoken, word], "es", true);
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
