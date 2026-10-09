"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, type ApiError } from "@/lib/api";
import { toApiError } from "@/lib/hooks";
import { setSoundEnabled } from "@/lib/sounds";
import type { Me, Theme } from "@/lib/types";

interface UserContextValue {
  me: Me | null;
  error: ApiError | null;
  /** Server clock minus local clock, so countdowns respect the simulated day offset. */
  clockSkewMs: number;
  setMe: (me: Me) => void;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // storage unavailable (private mode); the theme still applies for this visit
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [me, setMeState] = useState<Me | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [clockSkewMs, setClockSkewMs] = useState(0);

  const setMe = useCallback((next: Me) => {
    setMeState(next);
    setClockSkewMs(Date.parse(next.now + "Z") - Date.now());
    setError(null);
  }, []);

  const refresh = useCallback(
    () =>
      api.me().then(setMe, (e) => {
        setError(toApiError(e));
      }),
    [setMe],
  );

  useEffect(() => {
    api.me().then(setMe, (e) => setError(toApiError(e)));
  }, [setMe]);

  const theme = me?.settings.theme;
  useEffect(() => {
    if (!theme) return;
    applyTheme(theme);
    if (theme !== "system") return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    if (me) setSoundEnabled(me.settings.sound_effects);
  }, [me]);

  return <UserContext.Provider value={{ me, error, clockSkewMs, setMe, refresh }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
