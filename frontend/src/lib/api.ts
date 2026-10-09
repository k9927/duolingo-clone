import type {
  Answer,
  AnswerResult,
  CompleteResult,
  Guidebook,
  Leaderboard,
  LessonSession,
  Me,
  PathData,
  Profile,
  SessionKind,
  StatusCode,
  ShopItem,
  Theme,
} from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...rest.headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "network", "Can't reach the server. Check your connection and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.code ?? "error", body.message ?? body.detail ?? "Something went wrong.");
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const post = <T>(path: string, json?: unknown) => request<T>(path, { method: "POST", json: json ?? {} });

export const api = {
  me: () => request<Me>("/api/me"),
  updateSettings: (
    body: Partial<{
      display_name: string;
      daily_goal_xp: number;
      sound_effects: boolean;
      animations: boolean;
      motivational_messages: boolean;
      listening_exercises: boolean;
      theme: Theme;
    }>,
  ) =>
    request<Me>("/api/me/settings", { method: "PATCH", json: body }),
  profile: () => request<Profile>("/api/me/profile"),
  setStatus: (status: StatusCode | null) => request<Me>("/api/me/status", { method: "PUT", json: { status } }),

  path: () => request<PathData>("/api/path"),
  guidebook: (unitId: number) => request<Guidebook>(`/api/units/${unitId}/guidebook`),

  startSession: (kind: SessionKind, skillId?: number) =>
    post<LessonSession>("/api/sessions", { kind, skill_id: skillId ?? null }),
  answer: (sessionId: number, exerciseId: number, answer: Answer) =>
    post<AnswerResult>(`/api/sessions/${sessionId}/answers`, { exercise_id: exerciseId, answer }),
  complete: (sessionId: number) => post<CompleteResult>(`/api/sessions/${sessionId}/complete`),
  abandon: (sessionId: number) => post<void>(`/api/sessions/${sessionId}/abandon`),

  leaderboard: (period: "week" | "all" = "week") => request<Leaderboard>(`/api/leaderboard?period=${period}`),

  shopItems: () => request<ShopItem[]>("/api/shop/items"),
  purchase: (itemId: ShopItem["id"]) => post<Me>("/api/shop/purchase", { item_id: itemId }),

  timeTravel: (days: number) => post<Me>("/api/dev/time-travel", { days }),
  setHearts: (hearts: number) => post<Me>("/api/dev/set-hearts", { hearts }),
  reset: () => post<void>("/api/dev/reset"),
};
