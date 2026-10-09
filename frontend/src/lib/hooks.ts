"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "./api";
import type { Me } from "./types";

export function toApiError(e: unknown): ApiError {
  return e instanceof ApiError ? e : new ApiError(0, "unknown", String(e));
}

/**
 * Loads data from the API whenever `fetcher` changes (wrap it in useCallback).
 * `reload()` clears the current result and fetches again.
 */
export function useResource<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<{ data: T | null; error: ApiError | null }>({ data: null, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetcher().then(
      (data) => !cancelled && setState({ data, error: null }),
      (e) => !cancelled && setState({ data: null, error: toApiError(e) }),
    );
    return () => {
      cancelled = true;
    };
  }, [fetcher, version]);

  const reload = useCallback(() => {
    setState({ data: null, error: null });
    setVersion((v) => v + 1);
  }, []);

  return { ...state, reload };
}

/** Ticks every `intervalMs`, returning the current timestamp. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

/** Human-readable time until the next heart regenerates, or null when full. */
export function useNextHeartIn(me: Me | null, clockSkewMs: number): string | null {
  const now = useNow(15000);
  if (!me?.next_heart_at) return null;
  return formatDuration(Date.parse(me.next_heart_at + "Z") - (now + clockSkewMs));
}

export interface Quest {
  id: string;
  title: string;
  value: number;
  goal: number;
  kind: "xp";
}

/** Duolingo starts learners on a single daily quest: reach the daily XP goal. */
export function dailyQuests(me: Me): Quest[] {
  return [{ id: "xp", title: `Earn ${me.settings.daily_goal_xp} XP`, value: me.xp_today, goal: me.settings.daily_goal_xp, kind: "xp" }];
}
