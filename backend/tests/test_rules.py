"""Unit tests for the pure gamification rules."""

from datetime import date, timedelta

from app.config import settings
from app.models import Exercise, ExerciseType, User
from app.services import hearts, streak
from app.services.clock import user_now
from app.services.grading import grade

TODAY = date(2026, 3, 10)


def make_user(**kw) -> User:
    defaults = dict(streak=0, longest_streak=0, last_streak_date=None, streak_freezes=0, day_offset=0, hearts=5)
    defaults.update(kw)
    user = User(**defaults)
    if "hearts_updated_at" not in kw:
        user.hearts_updated_at = user_now(user)
    return user


# --------------------------------------------------------------------------- streak


def test_first_activity_starts_streak():
    user = make_user()
    update = streak.record_activity(user, TODAY)
    assert (update.streak, update.extended) == (1, True)


def test_consecutive_day_extends_streak_once_per_day():
    user = make_user(streak=4, longest_streak=4, last_streak_date=TODAY - timedelta(days=1))
    assert streak.record_activity(user, TODAY).streak == 5
    second = streak.record_activity(user, TODAY)
    assert (second.streak, second.extended) == (5, False)
    assert user.longest_streak == 5


def test_missed_day_resets_streak():
    user = make_user(streak=4, last_streak_date=TODAY - timedelta(days=2))
    streak.sync_streak(user, TODAY)
    assert user.streak == 0
    assert streak.record_activity(user, TODAY).streak == 1


def test_streak_freeze_covers_missed_day():
    user = make_user(streak=4, last_streak_date=TODAY - timedelta(days=2), streak_freezes=1)
    assert streak.sync_streak(user, TODAY) == 1
    assert user.streak == 4 and user.streak_freezes == 0
    assert streak.record_activity(user, TODAY).streak == 5


# --------------------------------------------------------------------------- hearts


def test_hearts_regenerate_over_time():
    user = make_user(hearts=2)
    user.hearts_updated_at = user_now(user) - timedelta(minutes=settings.heart_regen_minutes * 2 + 5)
    hearts.sync_hearts(user)
    assert user.hearts == 4
    assert hearts.next_heart_at(user) is not None


def test_hearts_cap_at_max():
    user = make_user(hearts=1)
    user.hearts_updated_at = user_now(user) - timedelta(days=2)
    hearts.sync_hearts(user)
    assert user.hearts == settings.max_hearts
    assert hearts.next_heart_at(user) is None


def test_lose_heart_never_negative():
    user = make_user(hearts=0)
    hearts.lose_heart(user)
    assert user.hearts == 0


# --------------------------------------------------------------------------- grading


def exercise(type_, data, solution):
    return Exercise(type=type_, prompt="", data=data, solution=solution)


def test_translate_ignores_case_and_punctuation():
    ex = exercise(ExerciseType.TRANSLATE, {}, {"accepted": ["I eat bread.", "I am eating bread."]})
    assert grade(ex, {"tokens": ["i", "am", "eating", "bread"]}).correct
    assert not grade(ex, {"tokens": ["bread", "eat", "I"]}).correct


def test_type_answer_tolerates_accents_and_typos():
    ex = exercise(ExerciseType.TYPE_ANSWER, {}, {"accepted": ["el café"]})
    assert grade(ex, {"text": "El café"}).note is None
    accent = grade(ex, {"text": "el cafe"})
    assert accent.correct and accent.note
    typo = grade(ex, {"text": "el cafée"})
    assert typo.correct and typo.note == "You have a typo."
    assert not grade(ex, {"text": "la leche"}).correct


def test_match_pairs_requires_all_pairs():
    data = {"pairs": [{"id": "p1", "left": "a", "right": "b"}, {"id": "p2", "left": "c", "right": "d"}]}
    ex = exercise(ExerciseType.MATCH_PAIRS, data, {})
    full = {"matches": [{"left": "p1", "right": "p1"}, {"left": "p2", "right": "p2"}]}
    assert grade(ex, full).correct
    assert not grade(ex, {"matches": [{"left": "p1", "right": "p1"}]}).correct


def test_fill_blank_solution_is_full_sentence():
    ex = exercise(ExerciseType.FILL_BLANK, {"before": "Yo", "after": "pan.", "choices": []}, {"answer": "como"})
    result = grade(ex, {"choice": "como"})
    assert result.correct and result.solution == "Yo como pan."
