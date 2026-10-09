"""Request dependencies.

Authentication is intentionally simplified (see README): every request acts as
the default seeded learner unless an `X-User-Id` header picks another user.
"""

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User
from app.services import hearts, streak
from app.services.clock import user_today
from app.services.errors import NotFound

DB = Annotated[Session, Depends(get_db)]


def get_current_user(db: DB, x_user_id: Annotated[int | None, Header()] = None) -> User:
    if x_user_id is not None:
        user = db.get(User, x_user_id)
    else:
        user = db.scalar(select(User).where(User.username == settings.default_username))
    if user is None:
        raise NotFound("User")
    # Lazily apply time-based rules before anything reads the user.
    hearts.sync_hearts(user)
    streak.sync_streak(user, user_today(user))
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
