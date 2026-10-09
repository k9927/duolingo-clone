"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DuoImg } from "../ui/DuoImg";
import { DUO } from "@/lib/duoAssets";
import { useUser } from "../providers/UserProvider";
import { useToast } from "../providers/ToastProvider";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { StatusCard } from "../leaderboard/Status";
import { AddFriendsCard, FollowCard } from "../profile/FriendsPanel";
import { SettingsNav } from "../settings/SettingsNav";
import { StatsBar } from "./StatsBar";
import { api } from "@/lib/api";
import { dailyQuests, type Quest } from "@/lib/hooks";

const QUEST_ICONS: Record<Quest["kind"], string> = { xp: DUO.questXp };

export function QuestIcon({ kind, size = 60 }: { kind: Quest["kind"]; size?: number }) {
  return <DuoImg src={QUEST_ICONS[kind]} width={size} height={size} alt="" />;
}

/** `large` is the Quests page size (19px title); the side panel uses 17px, as on Duolingo. */
export function QuestRow({ quest, large = false }: { quest: Quest; large?: boolean }) {
  const done = quest.value >= quest.goal;
  return (
    <div className="flex items-center gap-4">
      <QuestIcon kind={quest.kind} />
      <div className="flex-1">
        <p className={`mb-3 font-bold ${large ? "text-[19px] leading-[26px]" : "text-[17px] leading-6"}`}>{quest.title}</p>
        <div className="flex items-center">
          <div className="relative flex-1">
            <ProgressBar value={quest.value / quest.goal} color="var(--bee)" height={20} />
            <span
              className={`absolute inset-0 flex items-center justify-center text-sm font-bold tracking-[0.56px] ${quest.value > 0 ? "text-[#cd7900]" : "text-muted"}`}
            >
              {Math.min(quest.value, quest.goal)} / {quest.goal}
            </span>
          </div>
          <DuoImg src={DUO.questChest} width={35} className={`-ml-1 ${done ? "" : "opacity-90"}`} />
        </div>
      </div>
    </div>
  );
}

function LeagueCard() {
  const { me } = useUser();
  const [standing, setStanding] = useState<{ rank: number; promotion: number } | null>(null);
  const xpToday = me?.xp_today;

  useEffect(() => {
    api
      .leaderboard()
      .then((board) => {
        const rank = board.entries.find((e) => e.is_me)?.rank;
        setStanding(rank ? { rank, promotion: board.promotion_spots } : null);
      })
      .catch(() => setStanding(null));
  }, [xpToday]);

  return (
    <section className="rounded-2xl border-2 border-line p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[19px] font-extrabold leading-7">Bronze League</h3>
        <Link href="/leaderboard" className="text-[15px] font-extrabold uppercase tracking-[0.8px] text-macaw hover:brightness-110">
          View league
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <DuoImg src={DUO.leagues.bronze} width={48} height={54} alt="Bronze League" />
        <p className="text-[17px] font-semibold text-muted">
          {standing ? (
            <>
              You&apos;re ranked <span className="font-extrabold text-ink">#{standing.rank}</span>.{" "}
              {standing.rank <= standing.promotion ? "You're in the promotion zone!" : "Earn XP to move up!"}
            </>
          ) : (
            "Complete a lesson to join this week's leaderboard."
          )}
        </p>
      </div>
    </section>
  );
}

function QuestsCard() {
  const { me } = useUser();
  if (!me) return null;
  return (
    <section className="rounded-2xl border-2 border-line p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[19px] font-extrabold leading-7">Daily Quests</h3>
        <Link href="/quests" className="text-[15px] font-extrabold uppercase tracking-[0.8px] text-macaw hover:brightness-110">
          View all
        </Link>
      </div>
      <QuestRow quest={dailyQuests(me)[0]} />
    </section>
  );
}

/** "Try Super for free" upsell card (Super itself is a placeholder in this clone). */
function SuperCard() {
  const toast = useToast();
  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-line p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <DuoImg src={DUO.superBadge} width={87} height={23} alt="Super" />
          <h3 className="mt-3 text-[19px] font-extrabold">Try Super for free</h3>
          <p className="mt-2 text-[17px] font-semibold leading-snug">No ads, personalized practice, and unlimited Legendary!</p>
        </div>
        <DuoImg src={DUO.superDuo} width={120} height={112} className="-mr-2 -mt-2" />
      </div>
      <Button
        color="#3C4DFF"
        textColor="#fff"
        full
        className="mt-5"
        onClick={() => toast({ title: "Super is coming soon", body: "Subscriptions aren't available in this demo." })}
      >
        Try 1 week free
      </Button>
    </section>
  );
}

function MonthlyChallengeCard() {
  return (
    <section className="rounded-2xl border-2 border-line p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[17px] font-extrabold">Monthly challenges unlock soon!</h3>
          <p className="mt-3 font-semibold text-muted">Complete each month&apos;s challenge to earn exclusive badges</p>
        </div>
        <DuoImg src={DUO.monthlyBadge} width={80} height={99} />
      </div>
      <Button variant="outline" full href="/learn">
        Start a lesson
      </Button>
    </section>
  );
}

const FOOTER_LINKS = ["About", "Blog", "Store", "Efficacy", "Careers", "Investors", "Terms", "Privacy"];

export function RightPanel() {
  const pathname = usePathname();
  const onQuests = pathname.startsWith("/quests");
  // Like Duolingo, the leaderboard page only shows the status picker.
  const onLeaderboard = pathname.startsWith("/leaderboard");
  const onProfile = pathname.startsWith("/profile");
  const onSettings = pathname.startsWith("/settings");
  return (
    <aside className="sticky top-0 hidden w-[368px] shrink-0 flex-col gap-6 self-start py-6 min-[1100px]:flex">
      {/* Duolingo's settings pages show only the settings menu, without the stats bar. */}
      {!onSettings && <StatsBar />}
      {onSettings ? (
        <SettingsNav />
      ) : onLeaderboard ? (
        <StatusCard />
      ) : onProfile ? (
        <>
          <FollowCard />
          <AddFriendsCard />
        </>
      ) : onQuests ? (
        <MonthlyChallengeCard />
      ) : (
        <>
          <SuperCard />
          <LeagueCard />
          <QuestsCard />
        </>
      )}
      <footer className="flex flex-wrap justify-center gap-x-4 gap-y-4 px-4 text-[13px] font-bold uppercase leading-4 text-faint">
        {FOOTER_LINKS.map((label) => (
          <span key={label} className="cursor-default">
            {label}
          </span>
        ))}
      </footer>
    </aside>
  );
}
