"""Pydantic request/response models (the public API contract)."""

from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --------------------------------------------------------------------------- user


class CourseSummary(ORM):
    id: int
    code: str
    title: str
    learning_language: str
    learning_language_name: str
    flag: str


class UserSettings(ORM):
    daily_goal_xp: int
    sound_effects: bool
    animations: bool
    motivational_messages: bool
    listening_exercises: bool
    theme: Literal["light", "dark", "system"]
    timezone: str


class Me(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_color: str
    joined_at: datetime
    course: CourseSummary | None

    total_xp: int
    gems: int
    hearts: int
    max_hearts: int
    next_heart_at: datetime | None
    heart_regen_minutes: int
    heart_refill_cost: int

    streak: int
    streak_extended_today: bool
    longest_streak: int
    streak_freezes: int

    today: date
    now: datetime
    day_offset: int
    xp_today: int
    lessons_today: int
    settings: UserSettings
    status: str | None


class SettingsUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=40)
    daily_goal_xp: Literal[10, 20, 30, 50] | None = None
    sound_effects: bool | None = None
    animations: bool | None = None
    motivational_messages: bool | None = None
    listening_exercises: bool | None = None
    theme: Literal["light", "dark", "system"] | None = None
    timezone: str | None = None


class AchievementOut(BaseModel):
    code: str
    title: str
    icon: str
    color: str
    level: int
    max_level: int
    value: int
    goal: int
    description: str


class XpDay(BaseModel):
    date: date
    xp: int


class Profile(BaseModel):
    me: Me
    league: str
    skills_completed: int
    lessons_completed: int
    perfect_lessons: int
    achievements: list[AchievementOut]
    xp_history: list[XpDay]


# --------------------------------------------------------------------------- path


class SkillNode(BaseModel):
    id: int
    title: str
    icon: str
    position: int
    state: Literal["locked", "active", "completed", "legendary"]
    lessons_completed: int
    lessons_total: int


class UnitOut(BaseModel):
    id: int
    position: int
    section: int
    title: str
    description: str
    color: str
    completed: bool
    skills: list[SkillNode]


class PathOut(BaseModel):
    course: CourseSummary
    units: list[UnitOut]


class Phrase(BaseModel):
    text: str
    translation: str


class TipTable(BaseModel):
    headers: list[str]
    rows: list[list[str]]


class Tip(BaseModel):
    title: str
    # **double asterisks** mark words shown in bold.
    body: str
    table: TipTable | None = None
    examples: list[Phrase] = []


class Guidebook(BaseModel):
    unit_id: int
    number: int
    title: str
    description: str
    color: str
    tips: list[Tip]
    phrases: list[Phrase]


# --------------------------------------------------------------------------- sessions


class StartSession(BaseModel):
    kind: Literal["lesson", "practice", "legendary", "unit_test"]
    skill_id: int | None = None


class HintToken(BaseModel):
    text: str
    # None for spaces and punctuation; a word without known meanings gets [].
    hints: list[str] | None = None
    tts: str | None = None


class HintedText(BaseModel):
    lang: str
    tokens: list[HintToken]


class ExerciseOut(ORM):
    id: int
    type: str
    prompt: str
    data: dict[str, Any]
    # Word-by-word hover hints for the sentences in `data`, keyed by field name.
    hints: dict[str, HintedText] = {}


class SessionOut(BaseModel):
    id: int
    kind: str
    skill_id: int | None
    skill_title: str | None
    unit_position: int | None
    lesson_position: int | None
    lessons_total: int | None
    language: str
    exercises: list[ExerciseOut]
    hearts: int
    time_limit_seconds: int | None
    max_mistakes: int | None


class AnswerIn(BaseModel):
    exercise_id: int
    answer: dict[str, Any]


class AnswerOut(BaseModel):
    correct: bool
    solution: str
    note: str | None
    hearts: int
    mistakes: int
    out_of_hearts: bool
    session_status: str


class XpLine(BaseModel):
    label: str
    amount: int


class UnlockedAchievement(BaseModel):
    code: str
    level: int
    title: str
    description: str
    icon: str
    color: str
    gem_reward: int


class CompleteOut(BaseModel):
    xp_earned: int
    xp_breakdown: list[XpLine]
    accuracy: int
    duration_seconds: int
    mistakes: int
    streak: int
    streak_extended: bool
    xp_today: int
    daily_goal_xp: int
    daily_goal_reached: bool
    gems_earned: int
    heart_gained: bool
    skill_completed: bool
    new_achievements: list[UnlockedAchievement]
    me: Me


# --------------------------------------------------------------------------- leaderboard / shop


# Duolingo's leaderboard status emojis, in picker order.
StatusCode = Literal[
    "sunglasses", "party", "muscle", "eyes", "popcorn", "flag",
    "angry", "hundred", "poop", "trophy", "dumpster", "cat",
]


class StatusUpdate(BaseModel):
    status: StatusCode | None


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    display_name: str
    avatar_color: str
    status: str | None
    xp: int
    is_me: bool


class LeaderboardOut(BaseModel):
    league: str
    period: Literal["week", "all"]
    week_start: date
    week_end: date
    promotion_spots: int
    demotion_spots: int
    entries: list[LeaderboardEntry]


class ShopItem(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    price: int
    available: bool
    owned: int | None = None
    reason: str | None = None


class PurchaseIn(BaseModel):
    item_id: Literal["heart_refill", "streak_freeze"]


class TimeTravelIn(BaseModel):
    days: int = Field(default=1, ge=-30, le=30)


class SetHeartsIn(BaseModel):
    hearts: int = Field(ge=0, le=5)


class ErrorOut(BaseModel):
    code: str
    message: str
