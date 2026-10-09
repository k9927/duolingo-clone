"""Builds the learner summary returned by most endpoints."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import schemas
from app.config import settings
from app.models import User, XpEvent
from app.services import hearts, streak
from app.services.clock import user_now, user_today
from app.services.sessions import xp_on


def build_me(db: Session, user: User) -> schemas.Me:
    today = user_today(user)
    lessons_today = db.scalar(
        select(func.count(XpEvent.id)).where(XpEvent.user_id == user.id, XpEvent.activity_date == today)
    )
    course = user.current_course
    return schemas.Me(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar_color=user.avatar_color,
        joined_at=user.joined_at,
        course=schemas.CourseSummary.model_validate(course) if course else None,
        total_xp=user.total_xp,
        gems=user.gems,
        hearts=user.hearts,
        max_hearts=settings.max_hearts,
        next_heart_at=hearts.next_heart_at(user),
        heart_regen_minutes=settings.heart_regen_minutes,
        heart_refill_cost=settings.heart_refill_gem_cost,
        streak=user.streak,
        streak_extended_today=streak.extended_today(user, today),
        longest_streak=user.longest_streak,
        streak_freezes=user.streak_freezes,
        today=today,
        now=user_now(user),
        day_offset=user.day_offset,
        xp_today=xp_on(db, user, today),
        lessons_today=lessons_today or 0,
        settings=schemas.UserSettings.model_validate(user),
        status=user.status,
    )
