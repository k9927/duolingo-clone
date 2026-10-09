"use client";

import { SettingsSection, SettingsSelect, SettingsTitle, ToggleRow, useSettingsAction } from "@/components/settings/SettingsUI";
import { useUser } from "@/components/providers/UserProvider";
import { api } from "@/lib/api";
import type { Theme } from "@/lib/types";

const THEMES: { value: Theme; label: string }[] = [
  { value: "system", label: "System default" },
  { value: "dark", label: "On" },
  { value: "light", label: "Off" },
];

/** Settings → Preferences, laid out like Duolingo's. */
export default function PreferencesPage() {
  const { me } = useUser();
  const { run } = useSettingsAction();
  if (!me) return null;
  const save = (body: Parameters<typeof api.updateSettings>[0]) => run(() => api.updateSettings(body));
  const s = me.settings;

  return (
    <div className="px-4 pb-10 pt-6 min-[1100px]:!px-0">
      <SettingsTitle>Preferences</SettingsTitle>

      <SettingsSection title="Lesson experience">
        <ToggleRow label="Sound effects" checked={s.sound_effects} onChange={(v) => save({ sound_effects: v })} />
        <ToggleRow label="Animations" checked={s.animations} onChange={(v) => save({ animations: v })} />
        <ToggleRow label="Motivational messages" checked={s.motivational_messages} onChange={(v) => save({ motivational_messages: v })} />
        <ToggleRow label="Listening exercises" checked={s.listening_exercises} onChange={(v) => save({ listening_exercises: v })} />
      </SettingsSection>

      <SettingsSection title="Appearance">
        <SettingsSelect label="Dark mode" value={s.theme} options={THEMES} onChange={(theme) => save({ theme })} />
      </SettingsSection>
    </div>
  );
}
