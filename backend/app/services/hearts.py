"""Hearts: lose one per mistake, regenerate one every N minutes, refill with gems.

Regeneration is computed lazily from `hearts_updated_at` whenever the user is
loaded, so no background job is needed.
"""

from datetime import datetime, timedelta

from app.config import settings
from app.models import User
from app.services.clock import user_now
from app.services.errors import DomainError

REGEN = timedelta(minutes=settings.heart_regen_minutes)


def sync_hearts(user: User, now: datetime | None = None) -> None:
    now = now or user_now(user)
    if user.hearts >= settings.max_hearts:
        user.hearts = settings.max_hearts
        user.hearts_updated_at = now
        return

    elapsed = now - user.hearts_updated_at
    gained = int(elapsed / REGEN) if elapsed > timedelta(0) else 0
    if gained <= 0:
        return
    user.hearts = min(settings.max_hearts, user.hearts + gained)
    if user.hearts >= settings.max_hearts:
        user.hearts_updated_at = now
    else:
        user.hearts_updated_at += gained * REGEN


def next_heart_at(user: User) -> datetime | None:
    if user.hearts >= settings.max_hearts:
        return None
    return user.hearts_updated_at + REGEN


def lose_heart(user: User) -> None:
    now = user_now(user)
    sync_hearts(user, now)
    if user.hearts >= settings.max_hearts:
        # The regen timer starts from the first missing heart.
        user.hearts_updated_at = now
    user.hearts = max(0, user.hearts - 1)


def gain_heart(user: User, amount: int = 1) -> bool:
    """Returns True if at least one heart was actually added."""
    sync_hearts(user)
    if user.hearts >= settings.max_hearts:
        return False
    user.hearts = min(settings.max_hearts, user.hearts + amount)
    if user.hearts >= settings.max_hearts:
        user.hearts_updated_at = user_now(user)
    return True


def refill_with_gems(user: User) -> None:
    sync_hearts(user)
    if user.hearts >= settings.max_hearts:
        raise DomainError("hearts_full", "Your hearts are already full.")
    if user.gems < settings.heart_refill_gem_cost:
        raise DomainError("not_enough_gems", "You don't have enough gems.")
    user.gems -= settings.heart_refill_gem_cost
    user.hearts = settings.max_hearts
    user.hearts_updated_at = user_now(user)
