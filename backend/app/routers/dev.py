"""Developer tools so reviewers can test time-based mechanics without waiting.

- time-travel moves the learner's clock by N days (streaks, heart regen)
- set-hearts forces a heart count (e.g. 0 to see the out-of-hearts flow)
- reset restores the original seeded database
"""

from fastapi import APIRouter

from app import schemas
from app.database import engine
from app.deps import DB, CurrentUser
from app.seed.seed import reset_database
from app.services import hearts, streak
from app.services.clock import user_now, user_today
from app.services.users import build_me

router = APIRouter(prefix="/api/dev", tags=["dev tools"])


@router.post("/time-travel", response_model=schemas.Me)
def time_travel(body: schemas.TimeTravelIn, db: DB, user: CurrentUser):
    user.day_offset += body.days
    # Re-apply the time-based rules on the new clock so the response is current.
    hearts.sync_hearts(user)
    streak.sync_streak(user, user_today(user))
    db.commit()
    return build_me(db, user)


@router.post("/set-hearts", response_model=schemas.Me)
def set_hearts(body: schemas.SetHeartsIn, db: DB, user: CurrentUser):
    user.hearts = body.hearts
    user.hearts_updated_at = user_now(user)
    db.commit()
    return build_me(db, user)


@router.post("/reset", status_code=204)
def reset(db: DB):
    db.close()
    reset_database(engine)
