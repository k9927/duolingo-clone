"""Per-learner clock.

Every time-dependent rule (hearts regeneration, streaks, daily goal) reads time
through here, so the learner's `day_offset` can simulate future days for testing.
"""

from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.models import User, utcnow


def user_now(user: User) -> datetime:
    """Naive-UTC "now" as seen by this learner (real time + simulated day offset)."""
    return utcnow() + timedelta(days=user.day_offset or 0)


def _zone(user: User) -> ZoneInfo:
    try:
        return ZoneInfo(user.timezone)
    except (ZoneInfoNotFoundError, ValueError):
        return ZoneInfo("UTC")


def to_local_date(user: User, moment: datetime) -> date:
    return moment.replace(tzinfo=timezone.utc).astimezone(_zone(user)).date()


def user_today(user: User) -> date:
    """The learner's current local calendar day."""
    return to_local_date(user, user_now(user))


def week_start(day: date) -> date:
    """Monday of the week containing `day` (leagues reset weekly)."""
    return day - timedelta(days=day.weekday())


def is_valid_timezone(name: str) -> bool:
    try:
        ZoneInfo(name)
        return True
    except (ZoneInfoNotFoundError, ValueError):
        return False
