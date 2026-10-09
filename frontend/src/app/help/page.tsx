"use client";

import Link from "next/link";
import { useState } from "react";
import { DuoImg } from "@/components/ui/DuoImg";
import { DUO } from "@/lib/duoAssets";

interface Faq {
  q: string;
  a: string;
}

// Answers describe how this clone works.
const SECTIONS: { title: string; items: Faq[] }[] = [
  {
    title: "Using Duolingo",
    items: [
      {
        q: "Why did my course change?",
        a: "It shouldn't! This app has a single course, Spanish for English speakers, so your course always stays the same. Your progress is saved on the server as you learn.",
      },
      {
        q: "What is a streak?",
        a: "Your streak counts how many days in a row you've earned XP. Finish a lesson or practice session each day to extend it. If you miss a day it resets, unless you have a Streak Freeze equipped from the Shop.",
      },
      {
        q: "What are leaderboards and leagues?",
        a: "Each week you compete with other learners in your league based on the XP you earn. The top learners at the end of the week advance to the next league. Weeks run Monday to Sunday.",
      },
      {
        q: "How do hearts work?",
        a: "You lose a heart for each mistake in a lesson. Hearts refill one at a time every hour, and you can also refill them with gems in the Shop or earn one back by completing a practice session.",
      },
      {
        q: "Does Duolingo use any open source libraries?",
        a: "This app is built with open source software including Next.js, React, Tailwind CSS, Motion and lottie-react on the frontend, and FastAPI, SQLAlchemy and Pydantic with SQLite on the backend.",
      },
    ],
  },
  {
    title: "Account Management",
    items: [
      {
        q: "How do I change my username or email address?",
        a: "You can change your name in Settings → Profile. Usernames are fixed in this demo, and sign-in uses a single learner account, so there is no email address to change.",
      },
      {
        q: "How do I change my daily goal?",
        a: "Go to Settings → Profile and choose Casual (10 XP), Regular (20 XP), Serious (30 XP) or Intense (50 XP).",
      },
      {
        q: "How do I turn off sounds, animations or listening exercises?",
        a: "Open Settings → Preferences. Each option under Lesson experience can be switched off, and Appearance lets you choose light or dark mode.",
      },
      {
        q: "How do I reset my progress?",
        a: "Open the demo tools page (/settings/demo, linked from Settings → Profile). Its Reset demo data button restores the original demo learner, and it also lets you simulate the next day to try out streaks.",
      },
    ],
  },
];

/** Duolingo-style Help Center with collapsible FAQ cards. */
export default function HelpPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b-2 border-line">
        <div className="flex h-[70px] items-center px-6 sm:px-9">
          <Link href="/learn" aria-label="Duolingo home">
            <DuoImg src={DUO.logo} width={140} height={33} alt="duolingo" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-8">
        <nav className="flex items-center gap-4 pt-7 text-[19px] font-bold uppercase tracking-[0.5px] text-macaw">
          <Link href="/help" className="hover:brightness-110">
            Help Center
          </Link>
          <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden>
            <path d="M2 2l4 4-4 4" stroke="var(--wolf)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <Link href="/learn" className="hover:brightness-110">
            Home
          </Link>
        </nav>

        <h1 className="mb-14 mt-12 text-center text-[32px] font-bold">Frequently Asked Questions</h1>

        <div className="flex flex-col gap-14">
          {SECTIONS.map((section) => (
            <section key={section.title} className="overflow-hidden rounded-2xl border-2 border-line">
              <h2 className="border-b-2 border-line px-9 py-6 text-[19px] font-bold text-macaw">{section.title}</h2>
              <div className="divide-y-2 divide-line">
                {section.items.map((item) => (
                  <FaqItem key={item.q} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function FaqItem({ item }: { item: Faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 px-9 py-6 text-left text-[19px] font-medium hover:bg-surface-2"
      >
        {item.q}
        <svg
          width="20"
          height="12"
          viewBox="0 0 20 12"
          aria-hidden
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 2l8 8 8-8" stroke="var(--wolf)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </button>
      {open && <p className="px-9 pb-6 text-[17px] font-medium leading-relaxed text-muted">{item.a}</p>}
    </div>
  );
}
