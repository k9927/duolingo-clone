"use client";

import { Fragment, useCallback } from "react";
import { StatusAvatar } from "@/components/leaderboard/Status";
import { useUser } from "@/components/providers/UserProvider";
import { DuoImg } from "@/components/ui/DuoImg";
import { ErrorScreen, LoadingScreen } from "@/components/ui/LoadingScreen";
import { api } from "@/lib/api";
import { DUO } from "@/lib/duoAssets";
import { useResource } from "@/lib/hooks";

/** Leagues above Bronze, shown locked beside the current badge. */
const LOCKED_LEAGUES = 3;

export default function LeaderboardPage() {
  const { data: board, error, reload } = useResource(useCallback(() => api.leaderboard("week"), []));
  const { me } = useUser();

  if (error) return <ErrorScreen error={error} onRetry={reload} />;
  if (!board || !me) return <LoadingScreen />;

  const daysLeft = Math.round((Date.parse(board.week_end) - Date.parse(me.today)) / 86_400_000) + 1;
  const n = board.entries.length;
  // Statuses change on the right panel without refetching the board.
  const status = (entry: (typeof board.entries)[number]) => (entry.is_me ? me.status : entry.status);

  return (
    <div className="px-4 pt-6 min-[1100px]:!px-0">
      <div className="flex flex-col items-center border-b-2 border-line pb-6 text-center">
        <div className="mb-6 flex items-center gap-6">
          <DuoImg src={DUO.leagues.bronze} width={80} height={89} alt="Bronze League" />
          {Array.from({ length: LOCKED_LEAGUES }, (_, i) => (
            <DuoImg key={i} src={DUO.leagues.locked} width={54} height={60} alt="Locked league" />
          ))}
        </div>
        <h1 className="text-2xl font-bold">{board.league} League</h1>
        <p className="mt-3 text-[17px] font-medium">Top {board.promotion_spots} advance to the next league</p>
        <p className="mt-1 text-[15px] font-bold text-bee">
          {daysLeft} day{daysLeft === 1 ? "" : "s"}
        </p>
      </div>

      <ol className="py-4">
        {board.entries.map((e) => (
          <Fragment key={e.user_id}>
            <li className={`flex h-16 items-center gap-4 rounded-2xl px-4 ${e.is_me ? "bg-surface-2" : "hover:bg-surface-2"}`}>
              <span className="flex w-9 shrink-0 justify-center">
                {e.rank <= 3 ? (
                  <DuoImg src={DUO.leagues.medals[e.rank - 1]} width={30} height={31} alt={`Rank ${e.rank}`} />
                ) : (
                  <span className={`text-[17px] font-bold ${e.rank <= board.promotion_spots ? "text-feather" : "text-faint"}`}>{e.rank}</span>
                )}
              </span>
              <StatusAvatar name={e.display_name} color={e.avatar_color} status={status(e)} size={48} own={e.is_me} />
              <span className={`min-w-0 flex-1 truncate text-[17px] font-bold ${e.is_me ? "text-macaw" : ""}`}>
                {e.display_name}
                {e.is_me && " (you)"}
              </span>
              <span className="text-[17px] font-medium">{e.xp} XP</span>
            </li>
            {e.rank === board.promotion_spots && e.rank < n && <ZoneDivider label="Promotion zone" color="var(--owl)" arrow="up" />}
            {board.demotion_spots > 0 && e.rank === n - board.demotion_spots && (
              <ZoneDivider label="Demotion zone" color="var(--cardinal)" arrow="down" />
            )}
          </Fragment>
        ))}
      </ol>
    </div>
  );
}

function ZoneDivider({ label, color, arrow }: { label: string; color: string; arrow: "up" | "down" }) {
  return (
    <li className="my-2 flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-wide" style={{ color }}>
      <span>{arrow === "up" ? "▲" : "▼"}</span>
      {label}
      <span>{arrow === "up" ? "▲" : "▼"}</span>
    </li>
  );
}
