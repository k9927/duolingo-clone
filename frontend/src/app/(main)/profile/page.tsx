"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { CourseFlag } from "@/components/icons";
import { DuoImg } from "@/components/ui/DuoImg";
import { DUO } from "@/lib/duoAssets";
import { useToast } from "@/components/providers/ToastProvider";
import { useUser } from "@/components/providers/UserProvider";
import { Button } from "@/components/ui/Button";
import { ErrorScreen, LoadingScreen } from "@/components/ui/LoadingScreen";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { api } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import type { Achievement } from "@/lib/types";

/** Achievements shown before "VIEW ALL" is pressed, like Duolingo. */
const ACHIEVEMENT_PREVIEW = 3;
const LINKEDIN_DISMISSED_KEY = "duo:linkedin-dismissed";

export default function ProfilePage() {
  const { me } = useUser();
  const toast = useToast();
  const totalXp = me?.total_xp;
  // Re-fetch whenever XP changes so stats stay in sync with the top bar.
  const { data: profile, error, reload } = useResource(useCallback(() => api.profile(), [totalXp])); // eslint-disable-line react-hooks/exhaustive-deps
  const [showAll, setShowAll] = useState(false);
  const [linkedinHidden, setLinkedinHidden] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(LINKEDIN_DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (error) return <ErrorScreen error={error} onRetry={reload} />;
  if (!profile) return <LoadingScreen />;
  const p = profile.me;
  const joined = new Date(p.joined_at + "Z").toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const soon = (title: string) => toast({ title: `${title} is coming soon` });

  const hideLinkedin = () => {
    setLinkedinHidden(true);
    try {
      localStorage.setItem(LINKEDIN_DISMISSED_KEY, "1");
    } catch {
      // Storage unavailable (private mode): the card just reappears next visit.
    }
  };

  const achievements = showAll ? profile.achievements : profile.achievements.slice(0, ACHIEVEMENT_PREVIEW);

  return (
    <div className="px-4 pb-10 pt-6 min-[1100px]:!px-0">
      {/* Banner with the "add a photo" silhouette, as shown when there's no profile picture. */}
      <div className="relative flex h-[220px] items-end justify-center overflow-hidden rounded-2xl bg-surface-2">
        <button onClick={() => soon("Profile photos")} aria-label="Add a profile photo" className="translate-y-2 transition hover:brightness-110">
          <AvatarPlaceholder />
        </button>
        <Link
          href="/settings"
          aria-label="Edit profile"
          className="tile absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bg hover:bg-surface-2"
        >
          <DuoImg src={DUO.profile.edit} width={20} height={20} />
        </Link>
      </div>

      <header className="border-b-2 border-line pb-8 pt-7">
        <h1 className="text-2xl font-bold">{p.display_name}</h1>
        <p className="text-[15px] font-medium text-faint">{p.username}</p>
        <p className="mt-2 text-[17px] font-medium">Joined {joined}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-6 text-[15px] font-bold text-macaw">
            <button onClick={() => soon("Following")} className="hover:brightness-110">
              0 Following
            </button>
            <button onClick={() => soon("Followers")} className="hover:brightness-110">
              0 Followers
            </button>
          </div>
          <span title={p.course?.title}>
            <CourseFlag code={p.course?.learning_language} size={32} />
          </span>
        </div>
      </header>

      {!linkedinHidden && (
        <section className="relative mt-8 flex items-center gap-4 rounded-2xl bg-surface-2 p-4">
          <div className="min-w-0 flex-1">
            <h2 className="max-w-[260px] text-[21px] font-bold leading-[30px]">Add your Duolingo Score to LinkedIn!</h2>
            <Button variant="secondary" full className="mt-3" onClick={() => soon("Sharing to LinkedIn")}>
              Get started
            </Button>
          </div>
          <div className="hidden shrink-0 sm:block">
            <DuoImg src={DUO.profile.linkedinDuo} width={150} height={120} />
          </div>
          <button onClick={hideLinkedin} aria-label="Dismiss" className="absolute right-4 top-4 opacity-80 hover:opacity-100">
            <DuoImg src={DUO.profile.close} width={14} height={14} />
          </button>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Statistics</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<DuoImg src={DUO.profile.streak} width={21} height={26} />} value={p.streak} label="Day streak" />
          <Stat icon={<DuoImg src={DUO.profile.xp} width={21} height={29} />} value={p.total_xp} label="Total XP" />
          <Stat
            icon={<DuoImg src={DUO.leagues.bronze} width={25} height={28} />}
            value={profile.league}
            label="Current league"
            tag="Week 1"
          />
          <Stat
            icon={<DuoImg src={DUO.profile.top3None} width={23} height={28} />}
            value={0}
            label="Top 3 finishes"
            dim
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Achievements</h2>
          {profile.achievements.length > ACHIEVEMENT_PREVIEW && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-[15px] font-bold uppercase tracking-[0.8px] text-macaw hover:brightness-110"
            >
              {showAll ? "View less" : "View all"}
            </button>
          )}
        </div>
        <div className="divide-y-2 divide-line rounded-2xl border-2 border-line">
          {achievements.map((a) => (
            <AchievementRow key={a.code} a={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label, tag, dim }: { icon: React.ReactNode; value: React.ReactNode; label: string; tag?: string; dim?: boolean }) {
  return (
    <div className="relative flex items-start gap-3 rounded-2xl border-2 border-line px-5 py-3">
      <span className="mt-0.5 flex w-7 justify-center">{icon}</span>
      <div className="min-w-0">
        <p className={`text-[19px] font-bold leading-6 ${dim ? "text-faint" : ""}`}>{value}</p>
        <p className="text-[15px] font-medium text-faint">{label}</p>
      </div>
      {tag && (
        <span className="absolute -top-3 right-3 rounded-md bg-[#CD7900] px-1.5 py-0.5 text-[11px] font-bold uppercase text-[#131F24]">
          {tag}
        </span>
      )}
    </div>
  );
}

/** Duolingo-style badge: coloured tile with artwork and "LEVEL N" printed on it. Locked badges are grey. */
function AchievementBadge({ a }: { a: Achievement }) {
  const locked = a.level === 0;
  const color = locked ? "var(--swan)" : a.color;
  const art = DUO.achievements[a.code];
  return (
    <div
      className="flex h-[92px] w-[78px] shrink-0 flex-col items-center justify-between rounded-xl pb-2 pt-3"
      style={{ background: color, boxShadow: `0 4px 0 color-mix(in srgb, ${color} 75%, black)` }}
    >
      {art ? (
        <DuoImg src={art} width={46} height={46} className={locked ? "opacity-40 grayscale" : ""} />
      ) : (
        <span className="text-4xl">{a.icon}</span>
      )}
      <span className={`text-[11px] font-bold uppercase ${locked ? "text-faint" : "text-[#131F24]"}`}>Level {a.level}</span>
    </div>
  );
}

function AchievementRow({ a }: { a: Achievement }) {
  const maxed = a.level >= a.max_level;
  return (
    <div className="flex items-start gap-5 p-5">
      <AchievementBadge a={a} />
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[19px] font-bold">{a.title}</p>
          <span className="text-[17px] font-medium text-faint">{maxed ? "Maxed!" : `${Math.min(a.value, a.goal)}/${a.goal}`}</span>
        </div>
        <ProgressBar value={maxed ? 1 : a.value / a.goal} color="var(--bee)" height={16} />
        <p className="mt-3 text-[17px] font-medium">{a.description}</p>
      </div>
    </div>
  );
}

/** Head-and-shoulders silhouette Duolingo shows when there's no profile photo. */
const SILHOUETTE = [
  // Head: rounded square with a two-lobed hair line on top.
  "M37 64C37 42 52 30 72 32C78 18 98 8 118 10C145 12 164 30 164 58V146Q164 172 138 172H63Q37 172 37 146Z",
  // Neck flaring into the shoulders, cut off by the banner.
  "M80 166H121L148 214H53Z",
];
const EARS: [number, number][] = [
  [30, 110],
  [171, 110],
];

/**
 * The outline is drawn as a wide dashed stroke, then a banner-coloured stroke
 * hides its inner part: this leaves a dashed line offset from the shape with a
 * dark gap in between, exactly like Duolingo's placeholder.
 */
function AvatarPlaceholder() {
  const shapes = (props: React.SVGProps<SVGPathElement> & React.SVGProps<SVGCircleElement>) => (
    <>
      {SILHOUETTE.map((d) => (
        <path key={d} d={d} {...props} />
      ))}
      {EARS.map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r={14} {...props} />
      ))}
    </>
  );
  return (
    <svg width="172" height="177" viewBox="0 0 200 206" aria-hidden className="block">
      {shapes({ fill: "none", stroke: "var(--macaw)", strokeWidth: 21, strokeDasharray: "14 9", strokeLinejoin: "round" })}
      {shapes({ fill: "none", stroke: "var(--polar)", strokeWidth: 13, strokeLinejoin: "round" })}
      {shapes({ fill: "var(--blue-jay)" })}
      <path d="M100 90v28M86 104h28" stroke="var(--snow)" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}
