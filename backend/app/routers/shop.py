from fastapi import APIRouter

from app import schemas
from app.config import settings
from app.deps import DB, CurrentUser
from app.models import User
from app.services import hearts
from app.services.errors import DomainError
from app.services.users import build_me

router = APIRouter(prefix="/api/shop", tags=["shop"])


def _items(user: User) -> list[schemas.ShopItem]:
    hearts_full = user.hearts >= settings.max_hearts
    freezes_maxed = user.streak_freezes >= settings.max_streak_freezes
    return [
        schemas.ShopItem(
            id="heart_refill",
            title="Refill Hearts",
            description="Get full hearts so you can worry less about making mistakes in a lesson",
            icon="heart",
            price=settings.heart_refill_gem_cost,
            available=not hearts_full,
            reason="FULL" if hearts_full else None,
        ),
        schemas.ShopItem(
            id="streak_freeze",
            title="Streak Freeze",
            description="Streak Freeze allows your streak to remain in place for one full day of inactivity.",
            icon="freeze",
            price=settings.streak_freeze_gem_cost,
            available=not freezes_maxed,
            owned=user.streak_freezes,
            reason="EQUIPPED" if freezes_maxed else None,
        ),
    ]


@router.get("/items", response_model=list[schemas.ShopItem])
def list_items(user: CurrentUser):
    return _items(user)


@router.post("/purchase", response_model=schemas.Me)
def purchase(body: schemas.PurchaseIn, db: DB, user: CurrentUser):
    if body.item_id == "heart_refill":
        hearts.refill_with_gems(user)
    else:
        if user.streak_freezes >= settings.max_streak_freezes:
            raise DomainError("max_freezes", "You already have the maximum number of streak freezes.")
        if user.gems < settings.streak_freeze_gem_cost:
            raise DomainError("not_enough_gems", "You don't have enough gems.")
        user.gems -= settings.streak_freeze_gem_cost
        user.streak_freezes += 1
    db.commit()
    return build_me(db, user)
