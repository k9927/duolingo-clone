"""Creates the schema and loads seed data: course content, achievements, a sample
learner with some progress and a league of rival learners.

Run manually with:  python -m app.seed.seed  [--reset]
"""

import re
import sys
from datetime import datetime, time, timedelta

from sqlalchemy import Engine, select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine as default_engine
from app.models import (
    Achievement,
    Course,
    Exercise,
    Lesson,
    LessonSession,
    SessionKind,
    SessionStatus,
    Skill,
    SkillProgress,
    Unit,
    User,
    XpEvent,
    utcnow,
)
from app.seed import content
from app.seed.builder import build_lesson, static_lessons
from app.seed.sounds import ensure_sounds_course
from app.services import achievements
from app.services.clock import user_today, week_start


def seed_course(db: Session) -> Course:
    course = Course(**content.COURSE)
    for u_pos, unit_data in enumerate(content.UNITS, start=1):
        unit = Unit(
            position=u_pos,
            section=1,
            title=unit_data["title"],
            description=unit_data["description"],
            color=unit_data["color"],
            guidebook=unit_data["guidebook"],
        )
        for s_pos, skill_data in enumerate(unit_data["skills"], start=1):
            skill = Skill(position=s_pos, title=skill_data["title"], icon=skill_data["icon"])
            prebuilt = static_lessons(skill_data["static"]) if "static" in skill_data else None
            for l_index in range(len(prebuilt) if prebuilt else content.LESSONS_PER_SKILL):
                lesson = Lesson(position=l_index + 1)
                exercises = prebuilt[l_index] if prebuilt else build_lesson(skill_data, l_index, seed=u_pos * 100 + s_pos * 10 + l_index)
                lesson.exercises = [Exercise(position=i + 1, **ex) for i, ex in enumerate(exercises)]
                skill.lessons.append(lesson)
            unit.skills.append(skill)
        course.units.append(unit)
    db.add(course)
    db.flush()
    return course


def seed_achievements(db: Session) -> None:
    for code, title, metric, icon, color, tiers, description in content.ACHIEVEMENTS:
        for level, (threshold, gems) in enumerate(tiers, start=1):
            db.add(
                Achievement(
                    code=code,
                    level=level,
                    title=title,
                    description=description.format(n=threshold, s="" if threshold == 1 else "s"),
                    icon=icon,
                    color=color,
                    metric=metric,
                    threshold=threshold,
                    gem_reward=gems,
                )
            )
    db.flush()


def _at_noon(day) -> datetime:
    return datetime.combine(day, time(12, 0))


def seed_learner(db: Session, course: Course) -> User:
    now = utcnow()
    learner = User(
        **content.LEARNER,
        current_course_id=course.id,
        timezone=settings.default_timezone,
        joined_at=now - timedelta(days=30),
        hearts=4,
        hearts_updated_at=now - timedelta(minutes=20),
        daily_goal_xp=20,
    )
    db.add(learner)
    db.flush()
    today = user_today(learner)

    # Finished: the first two skills and one lesson of the third.
    skills = [s for unit in course.units for s in unit.skills]
    lessons_done = [(skills[0], 3), (skills[1], 3), (skills[2], 1)]
    finished_lessons = [lesson for skill, n in lessons_done for lesson in skill.lessons[:n]]
    for skill, n in lessons_done:
        db.add(
            SkillProgress(
                user_id=learner.id,
                skill_id=skill.id,
                lessons_completed=n,
                completed_at=now - timedelta(days=2) if n == len(skill.lessons) else None,
            )
        )

    # History: a 4-day streak that ended yesterday, so today's first lesson extends it.
    days_ago = [6, 4, 3, 3, 2, 1, 1]
    mistakes = [0, 1, 0, 2, 0, 0, 1]
    for lesson, ago, miss in zip(finished_lessons, days_ago, mistakes):
        day = today - timedelta(days=ago)
        xp = settings.lesson_xp + (settings.perfect_lesson_bonus_xp if miss == 0 else 0)
        session = LessonSession(
            user_id=learner.id,
            kind=SessionKind.LESSON,
            status=SessionStatus.COMPLETED,
            skill_id=lesson.skill_id,
            lesson_id=lesson.id,
            exercise_ids=[e.id for e in lesson.exercises],
            mistakes=miss,
            xp_earned=xp,
            started_at=_at_noon(day) - timedelta(minutes=4),
            finished_at=_at_noon(day),
        )
        db.add(session)
        db.flush()
        db.add(XpEvent(user_id=learner.id, session_id=session.id, amount=xp, source="lesson", activity_date=day))
        learner.total_xp += xp

    learner.streak = 4
    learner.longest_streak = 4
    learner.last_streak_date = today - timedelta(days=1)
    db.flush()

    achievements.evaluate(db, learner)
    learner.gems = 500
    return learner


def seed_league(db: Session, course: Course, today) -> None:
    start = week_start(today)
    days = [start + timedelta(days=i) for i in range((today - start).days + 1)]
    for name, color, per_day, *status in content.LEAGUE_USERS:
        user = User(
            status=status[0] if status else None,
            username=re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_"),
            display_name=name,
            avatar_color=color,
            current_course_id=course.id,
            timezone=settings.default_timezone,
            joined_at=utcnow() - timedelta(days=60),
        )
        db.add(user)
        db.flush()
        week_xp = 0
        for day in days:
            amount = per_day // 2 if day == today else per_day
            if amount:
                db.add(XpEvent(user_id=user.id, amount=amount, source="lesson", activity_date=day))
                week_xp += amount
        user.total_xp = week_xp + per_day * 20
        user.streak = 3 if per_day else 0
        user.longest_streak = user.streak
        user.last_streak_date = today if per_day else None


def seed(db: Session) -> bool:
    """Loads seed data into an empty database. Returns False if data already exists."""
    if db.scalar(select(Course.id).where(Course.code == content.COURSE["code"])) is not None:
        # Databases seeded before the Sounds tab got its lesson receive its questions now.
        ensure_sounds_course(db)
        db.commit()
        return False
    course = seed_course(db)
    ensure_sounds_course(db)
    seed_achievements(db)
    learner = seed_learner(db, course)
    seed_league(db, course, user_today(learner))
    db.commit()
    return True


def init_db(engine: Engine = default_engine) -> None:
    Base.metadata.create_all(engine)
    if settings.seed_on_startup:
        with Session(engine) as db:
            seed(db)


def reset_database(engine: Engine = default_engine) -> None:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        seed(db)


if __name__ == "__main__":
    if "--reset" in sys.argv:
        reset_database()
        print("Database reset and seeded.")
    else:
        Base.metadata.create_all(default_engine)
        with Session(default_engine) as db:
            print("Seeded." if seed(db) else "Database already contains data; use --reset to start over.")
