"""Database schema.

Content hierarchy:   Course 1─* Unit 1─* Skill 1─* Lesson 1─* Exercise
Learner state:       User 1─* SkillProgress, LessonSession, XpEvent, UserAchievement
Lesson attempts:     LessonSession 1─* AnswerAttempt
Gamification:        Achievement (one row per tier) *─* User via UserAchievement
"""

from __future__ import annotations

import enum
from datetime import date, datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    """Naive UTC timestamp (SQLite has no timezone-aware datetime type)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class ExerciseType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRANSLATE = "translate"
    MATCH_PAIRS = "match_pairs"
    FILL_BLANK = "fill_blank"
    TYPE_ANSWER = "type_answer"
    LISTEN = "listen"


class SessionKind(str, enum.Enum):
    LESSON = "lesson"
    PRACTICE = "practice"
    LEGENDARY = "legendary"
    UNIT_TEST = "unit_test"  # "Jump here?" test that skips ahead to a later unit


class SessionStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    ABANDONED = "abandoned"


# --------------------------------------------------------------------------- content


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(16), unique=True)  # e.g. "es-en"
    title: Mapped[str] = mapped_column(String(80))
    learning_language: Mapped[str] = mapped_column(String(8))  # BCP-47, used for TTS
    learning_language_name: Mapped[str] = mapped_column(String(40))
    from_language: Mapped[str] = mapped_column(String(8))
    flag: Mapped[str] = mapped_column(String(8))

    units: Mapped[list[Unit]] = relationship(
        back_populates="course", order_by="Unit.position", cascade="all, delete-orphan"
    )


class Unit(Base):
    __tablename__ = "units"
    __table_args__ = (UniqueConstraint("course_id", "position"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    section: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(String(255))
    color: Mapped[str] = mapped_column(String(16))
    # {"phrases": [{"text", "translation"}], "tips": [{"title", "body", "table"?, "examples"?}]}
    guidebook: Mapped[dict] = mapped_column(JSON, default=dict)

    course: Mapped[Course] = relationship(back_populates="units")
    skills: Mapped[list[Skill]] = relationship(
        back_populates="unit", order_by="Skill.position", cascade="all, delete-orphan"
    )


class Skill(Base):
    __tablename__ = "skills"
    __table_args__ = (UniqueConstraint("unit_id", "position"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(80))
    icon: Mapped[str] = mapped_column(String(16))

    unit: Mapped[Unit] = relationship(back_populates="skills")
    lessons: Mapped[list[Lesson]] = relationship(
        back_populates="skill", order_by="Lesson.position", cascade="all, delete-orphan"
    )


class Lesson(Base):
    __tablename__ = "lessons"
    __table_args__ = (UniqueConstraint("skill_id", "position"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)

    skill: Mapped[Skill] = relationship(back_populates="lessons")
    exercises: Mapped[list[Exercise]] = relationship(
        back_populates="lesson", order_by="Exercise.position", cascade="all, delete-orphan"
    )


class Exercise(Base):
    __tablename__ = "exercises"
    __table_args__ = (UniqueConstraint("lesson_id", "position"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    type: Mapped[ExerciseType] = mapped_column(Enum(ExerciseType, native_enum=False, length=32))
    prompt: Mapped[str] = mapped_column(String(255))
    # Shape depends on `type`; this is what the client renders.
    data: Mapped[dict] = mapped_column(JSON)
    # Answer key; never sent to the client.
    solution: Mapped[dict] = mapped_column(JSON)

    lesson: Mapped[Lesson] = relationship(back_populates="exercises")


# --------------------------------------------------------------------------- learner


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(40), unique=True)
    display_name: Mapped[str] = mapped_column(String(80))
    avatar_color: Mapped[str] = mapped_column(String(16), default="#1CB0F6")
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    current_course_id: Mapped[int | None] = mapped_column(ForeignKey("courses.id", ondelete="SET NULL"))

    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    gems: Mapped[int] = mapped_column(Integer, default=0)

    hearts: Mapped[int] = mapped_column(Integer, default=5)
    # Reference point for lazy heart regeneration.
    hearts_updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_streak_date: Mapped[date | None] = mapped_column(Date)
    streak_freezes: Mapped[int] = mapped_column(Integer, default=0)

    daily_goal_xp: Mapped[int] = mapped_column(Integer, default=20)
    timezone: Mapped[str] = mapped_column(String(64), default="UTC")
    sound_effects: Mapped[bool] = mapped_column(Boolean, default=True)
    animations: Mapped[bool] = mapped_column(Boolean, default=True)
    motivational_messages: Mapped[bool] = mapped_column(Boolean, default=True)
    listening_exercises: Mapped[bool] = mapped_column(Boolean, default=True)
    theme: Mapped[str] = mapped_column(String(8), default="system")  # light | dark | system
    # Leaderboard status emoji (one of schemas.StatusCode), or None.
    status: Mapped[str | None] = mapped_column(String(16), default=None)

    # Simulated clock: days added to "now" for this learner (streak/hearts testing).
    day_offset: Mapped[int] = mapped_column(Integer, default=0)

    current_course: Mapped[Course | None] = relationship()
    skill_progress: Mapped[list[SkillProgress]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class SkillProgress(Base):
    __tablename__ = "skill_progress"
    __table_args__ = (UniqueConstraint("user_id", "skill_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True)
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0)
    is_legendary: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    user: Mapped[User] = relationship(back_populates="skill_progress")
    skill: Mapped[Skill] = relationship()


class LessonSession(Base):
    """One attempt at a lesson, a practice round or a legendary challenge."""

    __tablename__ = "lesson_sessions"
    __table_args__ = (Index("ix_lesson_sessions_user_status", "user_id", "status"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    kind: Mapped[SessionKind] = mapped_column(Enum(SessionKind, native_enum=False, length=16))
    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus, native_enum=False, length=16), default=SessionStatus.IN_PROGRESS
    )
    skill_id: Mapped[int | None] = mapped_column(ForeignKey("skills.id", ondelete="SET NULL"))
    # Only set for kind == lesson.
    lesson_id: Mapped[int | None] = mapped_column(ForeignKey("lessons.id", ondelete="SET NULL"))
    # Ordered exercises served in this session (practice/legendary mix several lessons).
    exercise_ids: Mapped[list[int]] = mapped_column(JSON)
    mistakes: Mapped[int] = mapped_column(Integer, default=0)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime)

    lesson: Mapped[Lesson | None] = relationship()
    skill: Mapped[Skill | None] = relationship()
    attempts: Mapped[list[AnswerAttempt]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="AnswerAttempt.id"
    )


class AnswerAttempt(Base):
    __tablename__ = "answer_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("lesson_sessions.id", ondelete="CASCADE"), index=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id", ondelete="CASCADE"))
    submitted: Mapped[dict] = mapped_column(JSON)
    is_correct: Mapped[bool] = mapped_column(Boolean)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    session: Mapped[LessonSession] = relationship(back_populates="attempts")


class XpEvent(Base):
    """Ledger of XP gains. Powers daily goal, weekly leaderboard and XP history."""

    __tablename__ = "xp_events"
    __table_args__ = (Index("ix_xp_events_user_date", "user_id", "activity_date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    session_id: Mapped[int | None] = mapped_column(ForeignKey("lesson_sessions.id", ondelete="SET NULL"))
    amount: Mapped[int] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(24))
    # The learner's local calendar day the XP counts towards.
    activity_date: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Achievement(Base):
    """One tier of an achievement family, e.g. Wildfire level 2 = 7-day streak."""

    __tablename__ = "achievements"
    __table_args__ = (UniqueConstraint("code", "level"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(32))
    level: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(60))
    description: Mapped[str] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(String(16))
    color: Mapped[str] = mapped_column(String(16))
    metric: Mapped[str] = mapped_column(String(32))
    threshold: Mapped[int] = mapped_column(Integer)
    gem_reward: Mapped[int] = mapped_column(Integer, default=0)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id", ondelete="CASCADE"))
    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    achievement: Mapped[Achievement] = relationship()
