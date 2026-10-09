// Mirrors backend/app/schemas.py

export type Theme = "light" | "dark" | "system";

export interface CourseSummary {
  id: number;
  code: string;
  title: string;
  learning_language: string;
  learning_language_name: string;
  flag: string;
}

export interface Me {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  joined_at: string;
  course: CourseSummary | null;
  total_xp: number;
  gems: number;
  hearts: number;
  max_hearts: number;
  next_heart_at: string | null;
  heart_regen_minutes: number;
  heart_refill_cost: number;
  streak: number;
  streak_extended_today: boolean;
  longest_streak: number;
  streak_freezes: number;
  today: string;
  now: string;
  day_offset: number;
  xp_today: number;
  lessons_today: number;
  status: StatusCode | null;
  settings: {
    daily_goal_xp: number;
    sound_effects: boolean;
    animations: boolean;
    motivational_messages: boolean;
    listening_exercises: boolean;
    theme: Theme;
    timezone: string;
  };
}

export interface Achievement {
  code: string;
  title: string;
  icon: string;
  color: string;
  level: number;
  max_level: number;
  value: number;
  goal: number;
  description: string;
}

export interface Profile {
  me: Me;
  league: string;
  skills_completed: number;
  lessons_completed: number;
  perfect_lessons: number;
  achievements: Achievement[];
  xp_history: { date: string; xp: number }[];
}

export type SkillState = "locked" | "active" | "completed" | "legendary";

export interface SkillNode {
  id: number;
  title: string;
  icon: string;
  position: number;
  state: SkillState;
  lessons_completed: number;
  lessons_total: number;
}

export interface UnitData {
  id: number;
  position: number;
  section: number;
  title: string;
  description: string;
  color: string;
  completed: boolean;
  skills: SkillNode[];
}

export interface PathData {
  course: CourseSummary;
  units: UnitData[];
}

export interface Phrase {
  text: string;
  translation: string;
}

export interface GuidebookTip {
  title: string;
  /** `**double asterisks**` mark bold words. */
  body: string;
  table: { headers: string[]; rows: string[][] } | null;
  examples: Phrase[];
}

export interface Guidebook {
  unit_id: number;
  /** Unit number within the course ("Unit 1 Guidebook"). */
  number: number;
  title: string;
  description: string;
  color: string;
  tips: GuidebookTip[];
  phrases: Phrase[];
}

// ---------------------------------------------------------------- exercises

export interface Choice {
  id: string;
  text: string;
  /** Emoji, or a URL to Duolingo's illustration. */
  image?: string;
  /** Recorded pronunciation (Duolingo voice audio). */
  tts?: string;
}

/** One piece of an exercise sentence: a word/phrase with hover hints, or plain spacing/punctuation. */
export interface HintToken {
  text: string;
  hints?: string[] | null;
  /** A sentence showing how the word is used, with its translation. */
  example?: { text: string; translation: string } | null;
  tts?: string | null;
}

export interface HintedText {
  lang: string;
  tokens: HintToken[];
}

export type Exercise = {
  /** Hover hints for the sentences in `data`, keyed by field name ("sentence", "before", "after"). */
  hints?: Record<string, HintedText>;
} & (
  | {
      id: number;
      type: "multiple_choice";
      prompt: string;
      data: { choices: Choice[]; variant: "image" | "text"; sentence?: string; new_word?: boolean; character?: string };
    }
  | {
      id: number;
      type: "translate";
      prompt: string;
      data: { sentence: string; sentence_lang: string; words: string[]; tts?: string | null; character?: string | null };
    }
  | {
      id: number;
      type: "listen";
      prompt: string;
      data: { audio_text: string; words: string[] };
    }
  | {
      id: number;
      type: "match_pairs";
      prompt: string;
      data: { pairs: { id: string; left: string; right: string; tts?: string }[] };
    }
  | {
      id: number;
      type: "fill_blank";
      prompt: string;
      data: { before: string; after: string; translation: string; choices: string[] };
    }
  | {
      id: number;
      type: "type_answer";
      prompt: string;
      data: { sentence: string; sentence_lang: string };
    }
);

export type Answer = Record<string, unknown>;

export type SessionKind = "lesson" | "practice" | "legendary" | "unit_test";

export interface LessonSession {
  id: number;
  kind: SessionKind;
  skill_id: number | null;
  skill_title: string | null;
  /** Unit number of the session's skill (the unit being jumped to, for unit tests). */
  unit_position: number | null;
  lesson_position: number | null;
  lessons_total: number | null;
  language: string;
  exercises: Exercise[];
  hearts: number;
  time_limit_seconds: number | null;
  max_mistakes: number | null;
}

export interface AnswerResult {
  correct: boolean;
  solution: string;
  note: string | null;
  hearts: number;
  mistakes: number;
  out_of_hearts: boolean;
  session_status: string;
}

export interface UnlockedAchievement {
  code: string;
  level: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  gem_reward: number;
}

export interface CompleteResult {
  xp_earned: number;
  xp_breakdown: { label: string; amount: number }[];
  accuracy: number;
  duration_seconds: number;
  mistakes: number;
  streak: number;
  streak_extended: boolean;
  xp_today: number;
  daily_goal_xp: number;
  daily_goal_reached: boolean;
  gems_earned: number;
  heart_gained: boolean;
  skill_completed: boolean;
  new_achievements: UnlockedAchievement[];
  me: Me;
}

// ---------------------------------------------------------------- leaderboard / shop

/** Leaderboard status emojis, in Duolingo's picker order. */
export const STATUS_CODES = [
  "sunglasses", "party", "muscle", "eyes", "popcorn", "flag",
  "angry", "hundred", "poop", "trophy", "dumpster", "cat",
] as const;
export type StatusCode = (typeof STATUS_CODES)[number];

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  display_name: string;
  avatar_color: string;
  status: StatusCode | null;
  xp: number;
  is_me: boolean;
}

export interface Leaderboard {
  league: string;
  period: "week" | "all";
  week_start: string;
  week_end: string;
  promotion_spots: number;
  demotion_spots: number;
  entries: LeaderboardEntry[];
}

export interface ShopItem {
  id: "heart_refill" | "streak_freeze";
  title: string;
  description: string;
  icon: string;
  price: number;
  available: boolean;
  owned: number | null;
  reason: string | null;
}
