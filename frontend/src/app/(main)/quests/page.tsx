"use client";

import { TimerIcon } from "@/components/icons";
import { DuoImg } from "@/components/ui/DuoImg";
import { DUO } from "@/lib/duoAssets";
import { useUser } from "@/components/providers/UserProvider";
import { QuestRow } from "@/components/shell/RightPanel";
import { dailyQuests, useNow } from "@/lib/hooks";

/** Duolingo shows the quest reset countdown as "3 HOURS" / "40 MINUTES". */
function hoursLeft(ms: number) {
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

export default function QuestsPage() {
  const { me, clockSkewMs } = useUser();
  const now = useNow(60_000);
  if (!me) return null;

  // Time until the learner's local midnight (server clock, incl. simulated offset).
  const serverNow = new Date(now + clockSkewMs);
  const midnight = new Date(serverNow);
  midnight.setHours(24, 0, 0, 0);

  return (
    <div className="px-4 pt-6 min-[1100px]:!px-0">
      {/* Signed-in learners get Duolingo's "Welcome Back!" banner. */}
      <div className="relative mb-6 flex min-h-[252px] items-center overflow-hidden rounded-2xl bg-[#CE82FF] p-6 text-[#131f24]">
        <div className="relative z-10 max-w-[55%]">
          <h1 className="text-[25px] font-bold leading-[34px]">Welcome Back!</h1>
          <p className="mt-2 text-[17px] font-medium leading-6">Complete quests to earn rewards!</p>
        </div>
        <div className="absolute bottom-0 right-0 hidden sm:block">
          <DuoImg src={DUO.questsWelcomeBack} width={278} height={224} />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[25px] font-extrabold leading-7">Daily Quests</h2>
        <span className="flex items-center gap-1.5 text-[17px] font-extrabold uppercase text-fox">
          <TimerIcon size={20} />
          {hoursLeft(midnight.getTime() - serverNow.getTime())}
        </span>
      </div>
      <div className="divide-y-2 divide-line rounded-2xl border-2 border-line">
        {dailyQuests(me).map((q) => (
          <div key={q.id} className="p-[18px]">
            <QuestRow quest={q} large />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-8 rounded-2xl border-2 border-line bg-surface-2 px-8 py-6">
        <DuoImg src={DUO.questLocked} width={44} height={44} />
        <p className="text-[19px] font-bold leading-7 text-faint">More quests unlock soon</p>
      </div>
    </div>
  );
}
