import { SettingsNav } from "@/components/settings/SettingsNav";

/** On narrow screens the right panel is hidden, so the settings menu follows the page content. */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="px-4 pb-10 min-[1100px]:hidden">
        <SettingsNav />
      </div>
    </>
  );
}
