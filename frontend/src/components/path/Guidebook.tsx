"use client";

import Link from "next/link";
import { useCallback } from "react";
import { SpeakerIcon } from "../icons";
import { DuoImg } from "../ui/DuoImg";
import { ErrorScreen, LoadingScreen } from "../ui/LoadingScreen";
import { api } from "@/lib/api";
import { DUO } from "@/lib/duoAssets";
import { useResource } from "@/lib/hooks";
import { speak } from "@/lib/speech";
import type { Guidebook as GuidebookData, GuidebookTip, Phrase } from "@/lib/types";

/** Renders `**bold**` markup from the guidebook copy. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

function SpeakButton({ text }: { text: string }) {
  return (
    <button onClick={() => speak(text)} className="shrink-0 text-macaw transition hover:brightness-110" aria-label={`Listen to ${text}`}>
      <SpeakerIcon size={29} />
    </button>
  );
}

/** Spanish text with Duolingo's dashed underline under each word. */
function Underlined({ text }: { text: string }) {
  return (
    <span className="underline decoration-line decoration-dashed decoration-2 underline-offset-[6px]">{text}</span>
  );
}

/** Key phrase in a speech bubble with its tail on the left, sized to its content. */
function PhraseBubble({ phrase }: { phrase: Phrase }) {
  return (
    <div className="relative ml-2 w-fit max-w-[calc(100%-8px)] rounded-[15px] border-2 border-line bg-bg px-4 pb-4 pt-2">
      <span className="absolute -left-[9px] top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-line bg-bg" />
      <div className="relative flex items-start gap-[10px] pt-[9px]">
        <SpeakButton text={phrase.text} />
        <div className="min-w-0">
          <p className="text-[17px] font-medium leading-6">
            <Underlined text={phrase.text} />
          </p>
          <p className="mt-[6px] text-[17px] font-normal leading-6 text-muted">{phrase.translation}</p>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[17px] font-bold uppercase leading-[23px] text-macaw">{children}</p>;
}

function TipSection({ tip }: { tip: GuidebookTip }) {
  return (
    <section className="mt-8 rounded-t-2xl bg-surface-2 px-6 pb-4 pt-8">
      <SectionLabel>Tip</SectionLabel>
      <h3 className="mt-[10px] text-[25px] font-bold leading-[31px]">{tip.title}</h3>
      <p className="mt-8 text-[19px] font-normal leading-[26px]">
        <RichText text={tip.body} />
      </p>

      {tip.table && (
        <table className="mt-8 w-full border-separate border-spacing-0 rounded-2xl bg-bg text-left">
          <thead>
            <tr>
              {tip.table.headers.map((h, i) => (
                <th
                  key={h}
                  className={`border-y-2 border-[color-mix(in_srgb,var(--macaw)_60%,var(--bg))] bg-[color-mix(in_srgb,var(--macaw)_30%,transparent)] px-4 py-[18px] text-[19px] font-bold ${
                    i === 0 ? "rounded-tl-2xl border-l-2" : "rounded-tr-2xl border-x-2"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tip.table.rows.map((row, r) => {
              const last = r === tip.table!.rows.length - 1;
              return (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={`border-b-2 border-[color-mix(in_srgb,var(--macaw)_60%,var(--bg))] px-4 py-[10px] text-[19px] font-normal leading-[26px] ${
                        c === 0 ? "border-l-2" : "border-x-2"
                      } ${last && c === 0 ? "rounded-bl-2xl" : ""} ${last && c === row.length - 1 ? "rounded-br-2xl" : ""}`}
                    >
                      {c === 0 ? <Underlined text={cell} /> : cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {tip.examples.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          {tip.examples.map((ex) => (
            <div key={ex.text} className="flex items-start gap-[10px] pt-2">
              <SpeakButton text={ex.text} />
              <div>
                <p className="text-[19px] font-normal leading-[26px]">
                  <Underlined text={ex.text} />
                </p>
                <p className="mt-[6px] text-[19px] font-normal leading-[26px] text-muted">{ex.translation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function GuidebookBody({ book }: { book: GuidebookData }) {
  return (
    <div className="pb-12">
      <div className="sticky top-0 z-10 border-b-2 border-line bg-bg pb-4 pt-[35px]">
        <Link href="/learn" className="inline-flex items-center gap-4 text-[22px] font-bold text-muted hover:brightness-110">
          <DuoImg src={DUO.guidebook.back} width={16} />
          Back
        </Link>
      </div>

      <header className="flex items-center gap-8 border-b-2 border-line py-6">
        <DuoImg src={DUO.guidebook.characters[(book.number - 1) % DUO.guidebook.characters.length]} width={122} height={132} />
        <div>
          <h1 className="text-[25px] font-bold leading-[30px]">Unit {book.number} Guidebook</h1>
          <p className="mt-[10px] text-[19px] font-medium leading-[26.6px] text-muted">Explore grammar tips and key phrases for this unit</p>
        </div>
      </header>

      <section className="pt-8">
        <SectionLabel>Key phrases</SectionLabel>
        <div className="mt-[11px] flex flex-col gap-[21px]">
          {book.phrases.map((p) => (
            <PhraseBubble key={p.text} phrase={p} />
          ))}
        </div>
      </section>

      {book.tips.map((tip) => (
        <TipSection key={tip.title} tip={tip} />
      ))}
    </div>
  );
}

/** Duolingo's unit guidebook page (/guidebook/:unitId). */
export function Guidebook({ unitId }: { unitId: number }) {
  const { data, error, reload } = useResource(useCallback(() => api.guidebook(unitId), [unitId]));
  if (error) return <ErrorScreen error={error} onRetry={reload} />;
  if (!data) return <LoadingScreen />;
  return (
    <div className="px-4 sm:px-6 min-[1100px]:!px-0">
      <GuidebookBody book={data} />
    </div>
  );
}
