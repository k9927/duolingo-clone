"use client";

import Link from "next/link";
import { useState } from "react";
import { SettingsSection, SettingsTitle, useSettingsAction } from "@/components/settings/SettingsUI";
import { useUser } from "@/components/providers/UserProvider";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

const GOALS = [
  { xp: 10, label: "Casual" },
  { xp: 20, label: "Regular" },
  { xp: 30, label: "Serious" },
  { xp: 50, label: "Intense" },
];

const input =
  "h-[52px] w-full rounded-2xl border-2 border-line bg-surface-2 px-4 text-[17px] font-medium outline-none focus:border-sel-line disabled:text-faint";

/** Settings → Profile: name (editable), username, and the daily XP goal. */
export default function ProfileSettingsPage() {
  const { me } = useUser();
  const { run, busy } = useSettingsAction();
  const [name, setName] = useState(me?.display_name ?? "");
  if (!me) return null;

  return (
    <div className="px-4 pb-10 pt-6 min-[1100px]:!px-0">
      <div className="flex items-center justify-between gap-4">
        <SettingsTitle>Profile</SettingsTitle>
        <Button
          variant="secondary"
          disabled={busy || !name.trim() || name.trim() === me.display_name}
          onClick={() => run(() => api.updateSettings({ display_name: name.trim() }), "Changes saved")}
        >
          Save changes
        </Button>
      </div>

      <SettingsSection title="Account">
        <label className="block py-3">
          <span className="mb-2 block text-[19px] font-bold">Name</span>
          <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className={input} />
        </label>
        <label className="block py-3">
          <span className="mb-2 block text-[19px] font-bold">Username</span>
          <input value={me.username} disabled className={input} />
        </label>
      </SettingsSection>

      <SettingsSection title="Daily goal">
        <div className="flex flex-col gap-2 py-3">
          {GOALS.map((g) => {
            const active = me.settings.daily_goal_xp === g.xp;
            return (
              <button
                key={g.xp}
                onClick={() => run(() => api.updateSettings({ daily_goal_xp: g.xp }), `Daily goal set to ${g.xp} XP`)}
                className={`tile flex items-center justify-between rounded-2xl px-5 py-4 text-[17px] font-bold ${
                  active ? "!border-sel-line bg-sel text-macaw" : "bg-bg hover:bg-surface-2"
                }`}
              >
                <span>{g.label}</span>
                <span className={active ? "" : "text-muted"}>{g.xp} XP per day</span>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      {/* Demo-only controls live on their own page so the settings menu matches Duolingo's. */}
      <p className="mt-8 text-[15px] font-medium text-muted">
        Testing this demo?{" "}
        <Link href="/settings/demo" className="font-bold text-macaw hover:brightness-110">
          Open demo tools
        </Link>{" "}
        to simulate the next day, empty hearts or reset progress.
      </p>
    </div>
  );
}
