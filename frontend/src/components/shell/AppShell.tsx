"use client";

import { useEffect, useState } from "react";
import { MobileNav, Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { StatsBar } from "./StatsBar";
import { useUser } from "../providers/UserProvider";
import { ErrorScreen, LoadingScreen } from "../ui/LoadingScreen";

/** Duolingo's three-column desktop layout that collapses to top bar + bottom tabs on mobile. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { me, error, refresh } = useUser();

  // Like Duolingo's loader, stay up briefly on first load even if data arrives instantly.
  const [minShown, setMinShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinShown(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // First load: Duolingo shows only the loader, without the app chrome.
  if ((!me && !error) || !minShown) return <LoadingScreen fullScreen />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 justify-center gap-12 min-[1100px]:px-6">
        <main className="w-full min-w-0 max-w-[600px] pb-24 md:pb-10">
          <div className="sticky top-0 z-30 bg-bg px-4 py-2 min-[1100px]:hidden">
            <StatsBar />
          </div>
          {me ? (
            children
          ) : error ? (
            <ErrorScreen error={error} onRetry={refresh} />
          ) : (
            <LoadingScreen />
          )}
        </main>
        <RightPanel />
      </div>
      <MobileNav />
    </div>
  );
}
