from fastapi import APIRouter

from app import schemas
from app.deps import DB, CurrentUser
from app.services import achievements, sessions
from app.services.clock import is_valid_timezone
from app.services.errors import DomainError
from app.services.users import build_me

router = APIRouter(prefix="/api/me", tags=["me"])


@router.get("", response_model=schemas.Me)
def get_me(db: DB, user: CurrentUser):
    db.commit()  # persist lazily-applied heart regeneration / streak resets
    return build_me(db, user)


@router.patch("/settings", response_model=schemas.Me)
def update_settings(body: schemas.SettingsUpdate, db: DB, user: CurrentUser):
    changes = body.model_dump(exclude_unset=True, exclude_none=True)
    if "timezone" in changes and not is_valid_timezone(changes["timezone"]):
        raise DomainError("invalid_timezone", "Unknown timezone.")
    for field, value in changes.items():
        setattr(user, field, value)
    db.commit()
    return build_me(db, user)


@router.put("/status", response_model=schemas.Me)
def set_status(body: schemas.StatusUpdate, db: DB, user: CurrentUser):
    """Set or clear (null) the emoji shown next to the learner on leaderboards."""
    user.status = body.status
    db.commit()
    return build_me(db, user)


@router.get("/profile", response_model=schemas.Profile)
def get_profile(db: DB, user: CurrentUser):
    metrics = achievements.metric_values(db, user)
    return schemas.Profile(
        me=build_me(db, user),
        league="Bronze",
        skills_completed=metrics["skills_completed"],
        lessons_completed=metrics["lessons_completed"],
        perfect_lessons=metrics["perfect_lessons"],
        achievements=[schemas.AchievementOut(**vars(a)) for a in achievements.summarize(db, user)],
        xp_history=[schemas.XpDay(date=d, xp=xp) for d, xp in sessions.daily_xp_history(db, user)],
    )
