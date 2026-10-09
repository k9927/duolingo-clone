"use client";

import { SettingsSection, SettingsTitle, useSettingsAction } from "@/components/settings/SettingsUI";
import { useUser } from "@/components/providers/UserProvider";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

/** Demo-only controls for testing streaks and hearts without waiting (not part of Duolingo). */
export default function DemoToolsPage() {
  const { me } = useUser();
  const { run, busy } = useSettingsAction();
  if (!me) return null;

  return (
    <div className="px-4 pb-10 pt-6 min-[1100px]:!px-0">
      <SettingsTitle>Demo tools</SettingsTitle>
      <p className="mt-3 text-[17px] font-medium text-muted">
        Test the time-based mechanics without waiting. Learner date: <span className="font-bold text-ink">{me.today}</span>
        {me.day_offset !== 0 && ` (${me.day_offset > 0 ? "+" : ""}${me.day_offset} days)`} · Timezone {me.settings.timezone}
      </p>

      <SettingsSection title="Time travel">
        <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-2">
          <Button variant="outline" disabled={busy} onClick={() => run(() => api.timeTravel(1), "Jumped to the next day")}>
            Simulate next day
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => run(() => api.timeTravel(-1), "Went back one day")}>
            Go back one day
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Hearts & progress">
        <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-2">
          <Button variant="outline" textColor="var(--cardinal)" disabled={busy} onClick={() => run(() => api.setHearts(0), "Hearts emptied")}>
            Empty hearts
          </Button>
          <Button
            variant="outline"
            textColor="var(--cardinal)"
            disabled={busy}
            onClick={() => confirm("Reset all progress back to the seeded demo data?") && run(() => api.reset(), "Demo data reset")}
          >
            Reset demo data
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}
