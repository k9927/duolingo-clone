"""Daily streak rules.

- Earning XP on a new local day extends the streak (+1 if the previous active day
  was yesterday, otherwise it restarts at 1).
- If one or more days were missed, equipped streak freezes cover them one-for-one;
  otherwise the streak drops to 0 (checked lazily whenever the user is loaded).
"""

from dataclasses import dataclass
from datetime import date, timedelta

from app.models import User


@dataclass
class StreakUpdate:
    streak: int
    extended: bool


def sync_streak(user: User, today: date) -> int:
    """Apply missed days. Returns how many streak freezes were consumed."""
    last = user.last_streak_date
    if last is None or user.streak == 0:
        return 0
    missed = (today - last).days - 1
    if missed <= 0:
        return 0
    if user.streak_freezes >= missed:
        user.streak_freezes -= missed
        # Frozen days keep the streak alive without growing it.
        user.last_streak_date = today - timedelta(days=1)
        return missed
    user.streak = 0
    return 0


def record_activity(user: User, today: date) -> StreakUpdate:
    sync_streak(user, today)
    if user.last_streak_date == today and user.streak > 0:
        return StreakUpdate(streak=user.streak, extended=False)
    if user.last_streak_date == today - timedelta(days=1) and user.streak > 0:
        user.streak += 1
    else:
        user.streak = 1
    user.last_streak_date = today
    user.longest_streak = max(user.longest_streak, user.streak)
    return StreakUpdate(streak=user.streak, extended=True)


def extended_today(user: User, today: date) -> bool:
    return user.streak > 0 and user.last_streak_date == today
