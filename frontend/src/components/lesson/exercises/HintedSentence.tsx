"use client";

import { useState } from "react";
import { say } from "@/lib/speech";
import type { HintedText, HintToken } from "@/lib/types";

/**
 * A sentence with Duolingo's word hints: every word is underlined with dashes, hovering
 * (or tapping) one shows its meanings in a popover, and clicking a word in the course
 * language reads it aloud.
 */
export function HintedSentence({
  hinted,
  speakable,
  className = "",
}: {
  hinted: HintedText;
  /** True when the sentence is in the course language, so words can be read aloud. */
  speakable: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <span className={`whitespace-pre-wrap ${className}`} onMouseLeave={() => setOpen(null)}>
      {hinted.tokens.map((t, i) => {
        if (t.hints == null) return <span key={i}>{t.text}</span>;
        const hasHints = t.hints.length > 0;
        return (
          <span key={i} className="relative inline-block">
            <span
              role="button"
              tabIndex={0}
              onMouseEnter={() => hasHints && setOpen(i)}
              onClick={() => {
                if (speakable) say(t.text, t.tts, hinted.lang);
                if (hasHints) setOpen(i);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                if (speakable) say(t.text, t.tts, hinted.lang);
                setOpen(open === i || !hasHints ? null : i);
              }}
              onBlur={() => setOpen(null)}
              className={`cursor-pointer rounded-md outline-none focus-visible:bg-surface-2 ${
                hasHints ? "border-b-2 border-dashed border-line" : ""
              } ${open === i ? "bg-surface-2" : ""}`}
            >
              {t.text}
            </span>
            {open === i && <HintPopover token={t} />}
          </span>
        );
      })}
    </span>
  );
}

function HintPopover({ token }: { token: HintToken }) {
  return (
    <span
      role="tooltip"
      className="absolute left-1/2 top-[calc(100%+14px)] z-30 block w-max min-w-[110px] max-w-[300px] -translate-x-1/2 rounded-2xl border-2 border-line bg-popover text-center font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
    >
      <span className="absolute -top-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-tl-[3px] border-l-2 border-t-2 border-line bg-popover" />
      {token.hints!.map((h, j) => (
        <span key={h} className={`relative block whitespace-nowrap px-5 py-3 text-[17px] text-ink ${j > 0 ? "border-t-2 border-line" : ""}`}>
          {h}
        </span>
      ))}
      {token.example && (
        <span className="relative block border-t-2 border-line px-5 py-3 text-[17px] leading-snug">
          <span className="block text-ink">“{token.example.text}”</span>
          <span className="mt-1 block text-[15px] text-muted">{token.example.translation}</span>
        </span>
      )}
    </span>
  );
}
