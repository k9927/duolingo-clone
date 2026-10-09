"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../providers/ToastProvider";
import { useUser } from "../providers/UserProvider";
import { Button } from "../ui/Button";
import { DuoImg } from "../ui/DuoImg";
import { ProgressBar } from "../ui/ProgressBar";
import { api, ApiError } from "@/lib/api";
import { DUO } from "@/lib/duoAssets";
import { useNextHeartIn } from "@/lib/hooks";
import type { Me } from "@/lib/types";

type PanelId = "course" | "streak" | "xp" | "gems" | "hearts";

const POPOVER_WIDTH = 400;

/** Course flag, streak, XP, gems and hearts with Duolingo-style hover popovers. */
export function StatsBar({ className = "" }: { className?: string }) {
  const { me } = useUser();
  const [open, setOpen] = useState<{ id: PanelId; caret: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  if (!me) return <div className={`h-12 ${className}`} />;

  const items: { id: PanelId; icon: React.ReactNode; value?: number; color: string }[] = [
    {
      id: "course",
      icon: <DuoImg src={DUO.flags[me.course?.learning_language ?? "es"] ?? DUO.flags.es} width={31} height={24} alt={me.course?.title} />,
      color: "",
    },
    {
      id: "streak",
      icon: <DuoImg src={me.streak_extended_today ? DUO.streakActive : DUO.streakInactive} width={23} height={28} />,
      value: me.streak,
      color: me.streak_extended_today ? "text-fox" : "text-faint",
    },
    // Not in Duolingo's own top bar, but the brief asks for total XP here.
    { id: "xp", icon: <DuoImg src={DUO.profile.xp} width={19} height={26} />, value: me.total_xp, color: "text-bee" },
    { id: "gems", icon: <DuoImg src={DUO.gem} width={22} height={28} />, value: me.gems, color: "text-macaw" },
    { id: "hearts", icon: <DuoImg src={DUO.heart} width={28} />, value: me.hearts, color: "text-cardinal" },
  ];

  /** Opens a panel with its caret pointing at the hovered item. */
  const show = (id: PanelId, target: HTMLElement) => {
    const bar = ref.current?.getBoundingClientRect();
    const item = target.getBoundingClientRect();
    if (!bar) return;
    const width = Math.min(POPOVER_WIDTH, window.innerWidth - 32);
    // Matches the panel CSS: right edge 16px past the bar (flush on narrow phones).
    const popoverLeft = bar.right - width + (window.innerWidth <= 440 ? 0 : 16);
    setOpen({ id, caret: item.left + item.width / 2 - popoverLeft });
  };

  return (
    <div ref={ref} className={`relative flex items-center justify-between gap-1 ${className}`}>
      {items.map((item) => {
        const isOpen = open?.id === item.id;
        return (
          <div
            key={item.id}
            onMouseEnter={(e) => matchMedia("(hover: hover)").matches && show(item.id, e.currentTarget)}
            onMouseLeave={() => matchMedia("(hover: hover)").matches && setOpen(null)}
          >
            <button
              onClick={(e) => (isOpen ? setOpen(null) : show(item.id, e.currentTarget.parentElement!))}
              className={`flex h-11 items-center gap-2 rounded-xl px-2.5 transition-colors ${isOpen ? "bg-surface-2" : "hover:bg-surface-2"}`}
              aria-label={item.id}
              aria-expanded={isOpen}
            >
              {item.icon}
              {item.value !== undefined && <span className={`text-[15px] font-extrabold ${item.color}`}>{item.value}</span>}
            </button>
            <AnimatePresence>
              {isOpen && open && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-[-16px] top-full z-40 pt-3 max-[440px]:right-0"
                  style={{ width: `min(${POPOVER_WIDTH}px, calc(100vw - 32px))` }}
                >
                  {/* caret */}
                  <span
                    className="absolute top-[5px] h-4 w-4 rotate-45 border-l-2 border-t-2 border-line bg-bg"
                    style={{
                      left: open.caret - 8,
                      background: item.id === "streak" ? (me.streak_extended_today ? "var(--streak-extended)" : "var(--polar)") : undefined,
                    }}
                  />
                  <div className="overflow-hidden rounded-2xl border-2 border-line bg-bg">
                    <PanelContent id={item.id} me={me} close={() => setOpen(null)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function PanelContent({ id, me, close }: { id: PanelId; me: Me; close: () => void }) {
  switch (id) {
    case "course":
      return <CoursePanel me={me} />;
    case "streak":
      return <StreakPanel me={me} close={close} />;
    case "xp":
      return <XpPanel me={me} close={close} />;
    case "gems":
      return <GemsPanel me={me} close={close} />;
    case "hearts":
      return <HeartsPanel me={me} close={close} />;
  }
}

function CoursePanel({ me }: { me: Me }) {
  return (
    <div className="p-5">
      <p className="mb-3 text-[15px] font-extrabold uppercase tracking-[0.8px] text-faint">My courses</p>
      <div className="flex items-center gap-3 rounded-xl border-2 border-sel-line bg-sel p-3">
        <DuoImg src={DUO.flags.es} width={40} height={31} />
        <span className="font-extrabold">{me.course?.title}</span>
      </div>
      <p className="mt-3 text-sm font-bold text-faint">More courses coming soon</p>
    </div>
  );
}

const WEEK_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function StreakPanel({ me, close }: { me: Me; close: () => void }) {
  const toast = useToast();
  const extended = me.streak_extended_today;
  const today = new Date(me.today + "T00:00:00");
  // Days of the current week (Sun–Sat) that are part of the current streak.
  const lastActive = new Date(today);
  if (!extended) lastActive.setDate(today.getDate() - 1);
  const isStreakDay = (d: Date) => {
    if (me.streak === 0) return false;
    const diff = Math.round((lastActive.getTime() - d.getTime()) / 86_400_000);
    return diff >= 0 && diff < me.streak;
  };
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const subtitle =
    me.streak === 0
      ? "Do a lesson today to start a new streak!"
      : extended
        ? me.streak >= me.longest_streak
          ? "You've earned your longest streak ever!"
          : "You extended your streak today. Come back tomorrow!"
        : "Do a lesson today to extend your streak!";

  return (
    <div>
      {/* Header turns orange once today's lesson is done, like Duolingo. */}
      <div className="p-6" style={{ background: extended ? "var(--streak-extended)" : "var(--polar)" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-2xl font-extrabold ${extended ? "text-white" : "text-faint"}`}>{me.streak} day streak</p>
            <p className={`mt-3 text-[17px] font-semibold ${extended ? "text-white" : ""}`}>{subtitle}</p>
          </div>
          <DuoImg src={extended ? DUO.popover.streakFlame : DUO.popover.streakFlameOff} width={64} height={77} />
        </div>
        <div className="mt-5 rounded-2xl px-4 py-3" style={{ background: "var(--snow)", border: extended ? "2px solid rgba(0,0,0,0.15)" : undefined }}>
          <div className="flex justify-between">
            {WEEK_LETTERS.map((letter, i) => {
              const day = new Date(weekStart);
              day.setDate(weekStart.getDate() + i);
              const isToday = i === today.getDay();
              const active = isStreakDay(day);
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className={`text-[15px] font-extrabold ${isToday ? "text-fox" : "text-faint"}`}>{letter}</span>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: active ? "#FFB020" : "var(--swan)" }}
                  >
                    {active && (
                      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                        <path d="m5 12.5 4.5 4.5L19 7.5" stroke="#131F24" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t-2 border-line p-6">
        <div
          className="relative flex min-h-[160px] items-center overflow-hidden rounded-2xl p-5 text-white"
          style={{ background: "#FF6F00", paddingLeft: 150 }}
        >
          <DuoImg src={DUO.popover.friendStreaks} width={150} height={150} className="absolute bottom-0 left-0" />
          <div className="w-full">
            <p className="text-[17px] font-extrabold">Friend Streaks</p>
            <p className="mt-1 text-[17px] font-semibold">0 active Friend Streaks</p>
            <Button
              variant="white"
              textColor="#FF6F00"
              full
              className="mt-4"
              onClick={() => toast({ title: "Friend Streaks are coming soon" })}
            >
              View list
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-5 rounded-2xl border-2 border-line p-5">
          <DuoImg src={DUO.popover.streakSocietyLock} width={58} height={60} className={me.streak >= 7 ? "" : "opacity-60"} />
          <div>
            <p className="text-[17px] font-extrabold">Streak Society</p>
            <p className="mt-1 text-[17px] font-semibold">
              {me.streak >= 7
                ? "You're a member! Keep your streak going to earn exclusive rewards."
                : "Reach a 7 day streak to join the Streak Society and earn exclusive rewards."}
            </p>
          </div>
        </div>

        <Button variant="secondary" full href="/profile" onClick={close}>
          View more
        </Button>
      </div>
    </div>
  );
}

function XpPanel({ me, close }: { me: Me; close: () => void }) {
  const goal = me.settings.daily_goal_xp;
  return (
    <div className="flex items-center gap-6 p-6">
      <DuoImg src={DUO.profile.xp} width={66} height={90} />
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-extrabold">{me.total_xp} XP</p>
        <p className="mt-2 text-[17px] font-semibold">
          {me.xp_today >= goal ? "Daily goal reached!" : `${me.xp_today} of ${goal} XP earned today`}
        </p>
        <ProgressBar value={me.xp_today / goal} color="var(--bee)" height={14} className="mt-3" />
        <Link href="/leaderboard" onClick={close} className="mt-3 inline-block text-[15px] font-extrabold uppercase tracking-[0.8px] text-macaw hover:brightness-110">
          View leaderboard
        </Link>
      </div>
    </div>
  );
}

function GemsPanel({ me, close }: { me: Me; close: () => void }) {
  return (
    <div className="flex items-center gap-6 p-6">
      <DuoImg src={DUO.popover.gemsChest} width={100} />
      <div>
        <p className="text-2xl font-extrabold">Gems</p>
        <p className="mt-2 text-[17px] font-semibold">You have {me.gems} gems</p>
        <Link href="/shop" onClick={close} className="mt-3 inline-block text-[15px] font-extrabold uppercase tracking-[0.8px] text-macaw hover:brightness-110">
          Go to shop
        </Link>
      </div>
    </div>
  );
}

function HeartRow({
  icon,
  label,
  addOn,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  addOn?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`tile flex h-[60px] w-full items-center gap-4 rounded-2xl bg-bg px-5 text-left ${disabled ? "cursor-default" : "hover:bg-surface-2"}`}
    >
      <span className="flex w-9 justify-center">{icon}</span>
      <span className={`flex-1 text-[15px] font-extrabold uppercase tracking-[0.8px] ${disabled ? "text-faint" : ""}`}>{label}</span>
      {addOn}
    </button>
  );
}

function HeartsPanel({ me, close }: { me: Me; close: () => void }) {
  const { setMe, clockSkewMs } = useUser();
  const toast = useToast();
  const router = useRouter();
  const nextHeartIn = useNextHeartIn(me, clockSkewMs);
  const [busy, setBusy] = useState(false);
  const full = me.hearts >= me.max_hearts;
  const canRefill = !full && me.gems >= me.heart_refill_cost;

  const refill = async () => {
    setBusy(true);
    try {
      setMe(await api.purchase("heart_refill"));
      toast({ title: "Hearts refilled!", icon: <DuoImg src={DUO.heart} width={30} />, tone: "success" });
      close();
    } catch (e) {
      toast({ title: e instanceof ApiError ? e.message : "Something went wrong", tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 text-center">
      <p className="text-2xl font-extrabold">Hearts</p>
      <div className="my-5 flex gap-2">
        {Array.from({ length: me.max_hearts }, (_, i) => (
          <DuoImg key={i} src={i < me.hearts ? DUO.popover.heartRed : DUO.popover.heartEmpty} width={32} />
        ))}
      </div>
      <p className="text-[19px] font-extrabold">{full ? "You have full hearts" : `Next heart in ${nextHeartIn}`}</p>
      <p className="mt-2 text-[17px] font-semibold">{me.hearts === 0 ? "You ran out of hearts" : "Keep on learning"}</p>

      <div className="mt-6 flex w-full flex-col gap-3">
        <HeartRow
          icon={<DuoImg src={DUO.popover.heartUnlimited} width={36} />}
          label="Unlimited hearts"
          addOn={<span className="text-[15px] font-extrabold uppercase tracking-[0.8px] text-[#CF17C9]">Free trial</span>}
          onClick={() => toast({ title: "Super is coming soon", body: "Unlimited hearts aren't available in this demo." })}
        />
        <HeartRow
          icon={<DuoImg src={canRefill ? DUO.popover.heartRefill : DUO.popover.heartRefillGray} width={36} />}
          label="Refill hearts"
          disabled={!canRefill || busy}
          addOn={
            <span className={`flex items-center gap-1 text-[15px] font-extrabold ${canRefill ? "text-macaw" : "text-faint"}`}>
              <DuoImg src={canRefill ? DUO.gem : DUO.popover.gemGray} width={canRefill ? 19 : 24} height={24} />
              {me.heart_refill_cost}
            </span>
          }
          onClick={refill}
        />
        <HeartRow
          icon={<DuoImg src={DUO.popover.heartRed} width={22} className={full ? "opacity-40 grayscale" : ""} />}
          label="Practice to earn hearts"
          disabled={full}
          onClick={() => {
            close();
            router.push("/practice");
          }}
        />
      </div>
    </div>
  );
}
