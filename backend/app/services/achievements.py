"""Tiered achievements (Wildfire, Sage, Scholar, ...) evaluated after every session."""

from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (
    Achievement,
    Lesson,
    LessonSession,
    SessionKind,
    SessionStatus,
    SkillProgress,
    User,
    UserAchievement,
)


def metric_values(db: Session, user: User) -> dict[str, int]:
    completed_lessons = select(func.count(LessonSession.id)).where(
        LessonSession.user_id == user.id,
        LessonSession.kind == SessionKind.LESSON,
        LessonSession.status == SessionStatus.COMPLETED,
    )
    lessons_per_skill = (
        select(Lesson.skill_id, func.count(Lesson.id).label("total")).group_by(Lesson.skill_id).subquery()
    )
    skills_completed = (
        select(func.count(SkillProgress.id))
        .join(lessons_per_skill, lessons_per_skill.c.skill_id == SkillProgress.skill_id)
        .where(SkillProgress.user_id == user.id, SkillProgress.lessons_completed >= lessons_per_skill.c.total)
    )
    legendary = select(func.count(SkillProgress.id)).where(
        SkillProgress.user_id == user.id, SkillProgress.is_legendary.is_(True)
    )
    return {
        "streak": user.longest_streak,
        "total_xp": user.total_xp,
        "lessons_completed": db.scalar(completed_lessons) or 0,
        "perfect_lessons": db.scalar(completed_lessons.where(LessonSession.mistakes == 0)) or 0,
        "skills_completed": db.scalar(skills_completed) or 0,
        "legendary_skills": db.scalar(legendary) or 0,
    }


def _unlocked_ids(db: Session, user: User) -> set[int]:
    return set(db.scalars(select(UserAchievement.achievement_id).where(UserAchievement.user_id == user.id)))


def evaluate(db: Session, user: User) -> list[Achievement]:
    """Unlock every tier whose threshold is met; grants gem rewards. Returns new unlocks."""
    values = metric_values(db, user)
    unlocked = _unlocked_ids(db, user)
    new: list[Achievement] = []
    for achievement in db.scalars(select(Achievement).order_by(Achievement.code, Achievement.level)):
        if achievement.id in unlocked:
            continue
        if values.get(achievement.metric, 0) >= achievement.threshold:
            db.add(UserAchievement(user_id=user.id, achievement_id=achievement.id))
            user.gems += achievement.gem_reward
            new.append(achievement)
    db.flush()
    return new


@dataclass
class AchievementSummary:
    code: str
    title: str
    icon: str
    color: str
    level: int  # highest unlocked tier (0 = none)
    max_level: int
    value: int
    goal: int  # threshold of the next tier (or the last one when maxed)
    description: str


def summarize(db: Session, user: User) -> list[AchievementSummary]:
    values = metric_values(db, user)
    unlocked = _unlocked_ids(db, user)
    families: dict[str, list[Achievement]] = {}
    for a in db.scalars(select(Achievement).order_by(Achievement.id)):
        families.setdefault(a.code, []).append(a)

    summaries = []
    for code, tiers in families.items():
        tiers.sort(key=lambda a: a.level)
        level = max((a.level for a in tiers if a.id in unlocked), default=0)
        next_tier = next((a for a in tiers if a.level == level + 1), tiers[-1])
        summaries.append(
            AchievementSummary(
                code=code,
                title=tiers[0].title,
                icon=next_tier.icon,
                color=next_tier.color,
                level=level,
                max_level=len(tiers),
                value=values.get(tiers[0].metric, 0),
                goal=next_tier.threshold,
                description=next_tier.description,
            )
        )
    return summaries
