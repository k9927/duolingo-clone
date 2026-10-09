from datetime import timedelta
from typing import Literal

from fastapi import APIRouter
from sqlalchemy import func, select

from app import schemas
from app.deps import DB, CurrentUser
from app.models import User, XpEvent
from app.services.clock import user_today, week_start

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

# Bronze is the lowest league, so nobody is demoted from it.
PROMOTION_SPOTS = 7
DEMOTION_SPOTS = 0


@router.get("", response_model=schemas.LeaderboardOut)
def get_leaderboard(db: DB, user: CurrentUser, period: Literal["week", "all"] = "week"):
    start = week_start(user_today(user))
    end = start + timedelta(days=6)

    if period == "week":
        weekly = (
            select(XpEvent.user_id, func.sum(XpEvent.amount).label("xp"))
            .where(XpEvent.activity_date >= start, XpEvent.activity_date <= end)
            .group_by(XpEvent.user_id)
            .subquery()
        )
        xp_col = func.coalesce(weekly.c.xp, 0)
        query = select(User, xp_col).outerjoin(weekly, weekly.c.user_id == User.id)
    else:
        xp_col = User.total_xp
        query = select(User, xp_col)

    rows = db.execute(query.order_by(xp_col.desc(), User.id)).all()
    entries = [
        schemas.LeaderboardEntry(
            rank=i + 1,
            user_id=u.id,
            display_name=u.display_name,
            avatar_color=u.avatar_color,
            status=u.status,
            xp=int(xp),
            is_me=u.id == user.id,
        )
        for i, (u, xp) in enumerate(rows)
    ]
    db.commit()
    return schemas.LeaderboardOut(
        league="Bronze",
        period=period,
        week_start=start,
        week_end=end,
        promotion_spots=PROMOTION_SPOTS,
        demotion_spots=DEMOTION_SPOTS,
        entries=entries,
    )
