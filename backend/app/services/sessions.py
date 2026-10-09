"""The lesson loop: start a session, answer exercises, complete or abandon it.

Rules:
- A lesson session plays the next unfinished lesson of an *active* skill and
  costs a heart per mistake; with 0 hearts no further answers are accepted until
  hearts are refilled (or the session is abandoned).
- Practice sessions replay finished material, cost no hearts and earn one back.
- Legendary sessions replay a whole finished skill against the clock with a
  limited number of mistakes.
- Unit tests ("Jump here?") quiz the units before a locked unit with a limited
  number of mistakes; passing completes everything before it.
- A session can only be completed once every exercise has a correct answer
  (the client re-queues mistakes at the end, like Duolingo).
"""

import random
from dataclasses import dataclass, field
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import (
    Achievement,
    AnswerAttempt,
    Exercise,
    ExerciseType,
    Lesson,
    LessonSession,
    SessionKind,
    SessionStatus,
    Skill,
    User,
    XpEvent,
)
from app.services import achievements, hearts, progress, streak
from app.services.clock import to_local_date, user_now, user_today
from app.services.errors import DomainError, NotFound
from app.services.grading import GradeResult, grade

# --------------------------------------------------------------------------- start


def _get_skill(db: Session, skill_id: int) -> Skill:
    skill = db.get(Skill, skill_id)
    if skill is None:
        raise NotFound("Skill")
    return skill


def _new_session(db: Session, user: User, kind: SessionKind, exercise_ids: list[int], **kw) -> LessonSession:
    if not user.listening_exercises:
        # "Listening exercises" is off in Preferences: leave out audio-only questions.
        listen = set(db.scalars(select(Exercise.id).where(Exercise.id.in_(exercise_ids), Exercise.type == ExerciseType.LISTEN)))
        exercise_ids = [i for i in exercise_ids if i not in listen] or exercise_ids
    session = LessonSession(
        user_id=user.id, kind=kind, exercise_ids=exercise_ids, started_at=user_now(user), **kw
    )
    db.add(session)
    db.flush()
    return session


def start_lesson(db: Session, user: User, skill_id: int) -> LessonSession:
    skill = _get_skill(db, skill_id)
    state = progress.skill_state(db, user, skill)
    if state.state == "locked":
        raise DomainError("skill_locked", "Complete all levels above to unlock this!", 403)
    if state.state in ("completed", "legendary"):
        raise DomainError("skill_completed", "This skill is complete. Try practice instead.", 409)

    hearts.sync_hearts(user)
    if user.hearts <= 0:
        raise DomainError("out_of_hearts", "You ran out of hearts!", 403)

    lesson = skill.lessons[state.lessons_completed]
    return _new_session(
        db,
        user,
        SessionKind.LESSON,
        [e.id for e in lesson.exercises],
        skill_id=skill.id,
        lesson_id=lesson.id,
    )


def _finished_exercise_ids(db: Session, user: User, skill_id: int | None) -> list[int]:
    """Exercises from lessons the learner has already completed."""
    course = progress.load_course(db, user.current_course_id) if user.current_course_id else None
    if course is None:
        return []
    states = progress.compute_skill_states(db, user, course)
    lesson_ids = [
        lesson.id
        for s in states
        if skill_id is None or s.skill.id == skill_id
        for lesson in s.skill.lessons[: s.lessons_completed]
    ]
    if not lesson_ids:
        return []
    return list(db.scalars(select(Exercise.id).where(Exercise.lesson_id.in_(lesson_ids))))


def start_practice(db: Session, user: User, skill_id: int | None = None) -> LessonSession:
    pool = _finished_exercise_ids(db, user, skill_id)
    if not pool:
        raise DomainError("nothing_to_practice", "Complete a lesson first to unlock practice.", 409)
    picked = random.sample(pool, min(settings.practice_exercise_count, len(pool)))
    return _new_session(db, user, SessionKind.PRACTICE, picked, skill_id=skill_id)


def start_legendary(db: Session, user: User, skill_id: int) -> LessonSession:
    skill = _get_skill(db, skill_id)
    state = progress.skill_state(db, user, skill)
    if state.state not in ("completed", "legendary"):
        raise DomainError("skill_not_completed", "Finish every level of this skill first.", 403)
    pool = [e.id for lesson in skill.lessons for e in lesson.exercises]
    picked = random.sample(pool, min(settings.legendary_exercise_count, len(pool)))
    return _new_session(db, user, SessionKind.LEGENDARY, picked, skill_id=skill.id)


def start_unit_test(db: Session, user: User, skill_id: int) -> LessonSession:
    """`skill_id` is the first skill of the unit to jump to."""
    target = _get_skill(db, skill_id)
    unit = target.unit
    if unit.skills[0].id != target.id or unit.position == 1:
        raise DomainError("not_a_unit_start", "You can only jump to the start of a later unit.")
    if progress.skill_state(db, user, target).state != "locked":
        raise DomainError("unit_already_unlocked", "You've already reached this unit.", 409)
    pool = [
        e.id
        for skill in progress.ordered_skills(unit.course)
        if skill.unit.position < unit.position
        for lesson in skill.lessons
        for e in lesson.exercises
    ]
    picked = random.sample(pool, min(settings.unit_test_exercise_count, len(pool)))
    return _new_session(db, user, SessionKind.UNIT_TEST, picked, skill_id=target.id)


def max_mistakes(kind: SessionKind) -> int | None:
    return {
        SessionKind.LEGENDARY: settings.legendary_max_mistakes,
        SessionKind.UNIT_TEST: settings.unit_test_max_mistakes,
    }.get(kind)


# --------------------------------------------------------------------------- answer


def get_session(db: Session, user: User, session_id: int) -> LessonSession:
    session = db.get(LessonSession, session_id)
    if session is None or session.user_id != user.id:
        raise NotFound("Session")
    return session


def session_exercises(db: Session, session: LessonSession) -> list[Exercise]:
    by_id = {e.id: e for e in db.scalars(select(Exercise).where(Exercise.id.in_(session.exercise_ids)))}
    return [by_id[i] for i in session.exercise_ids if i in by_id]


def _require_in_progress(session: LessonSession) -> None:
    if session.status != SessionStatus.IN_PROGRESS:
        raise DomainError("session_closed", "This session has already ended.", 409)


@dataclass
class AnswerOutcome:
    grade: GradeResult
    session: LessonSession
    out_of_hearts: bool


def submit_answer(db: Session, user: User, session: LessonSession, exercise_id: int, answer: dict) -> AnswerOutcome:
    _require_in_progress(session)
    if exercise_id not in session.exercise_ids:
        raise DomainError("exercise_not_in_session", "That exercise is not part of this session.")

    is_lesson = session.kind == SessionKind.LESSON
    if is_lesson:
        hearts.sync_hearts(user)
        if user.hearts <= 0:
            raise DomainError("out_of_hearts", "You ran out of hearts!", 403)

    exercise = db.get(Exercise, exercise_id)
    assert exercise is not None
    result = grade(exercise, answer)
    db.add(AnswerAttempt(session_id=session.id, exercise_id=exercise_id, submitted=answer, is_correct=result.correct))

    if not result.correct:
        session.mistakes += 1
        if is_lesson:
            hearts.lose_heart(user)
        else:
            limit = max_mistakes(session.kind)
            if limit is not None and session.mistakes >= limit:
                _finish(session, user, SessionStatus.FAILED)

    db.flush()
    return AnswerOutcome(result, session, out_of_hearts=is_lesson and user.hearts <= 0)


def abandon(db: Session, user: User, session: LessonSession) -> None:
    if session.status == SessionStatus.IN_PROGRESS:
        _finish(session, user, SessionStatus.ABANDONED)
        db.flush()


def _finish(session: LessonSession, user: User, status: SessionStatus) -> None:
    session.status = status
    session.finished_at = user_now(user)


# --------------------------------------------------------------------------- complete


@dataclass
class Completion:
    session: LessonSession
    xp_earned: int
    xp_breakdown: list[tuple[str, int]]
    accuracy: int
    duration_seconds: int
    streak: streak.StreakUpdate
    xp_today: int
    daily_goal_reached: bool
    heart_gained: bool
    skill_completed: bool
    gems_earned: int = 0
    new_achievements: list[Achievement] = field(default_factory=list)


def xp_on(db: Session, user: User, day: date) -> int:
    return db.scalar(
        select(func.coalesce(func.sum(XpEvent.amount), 0)).where(
            XpEvent.user_id == user.id, XpEvent.activity_date == day
        )
    )


def complete(db: Session, user: User, session: LessonSession) -> Completion:
    _require_in_progress(session)

    attempts = list(db.scalars(select(AnswerAttempt).where(AnswerAttempt.session_id == session.id)))
    solved = {a.exercise_id for a in attempts if a.is_correct}
    if not set(session.exercise_ids) <= solved:
        raise DomainError("session_incomplete", "Answer every exercise correctly before finishing.", 409)

    now = user_now(user)
    duration = int((now - session.started_at).total_seconds())
    if session.kind == SessionKind.LEGENDARY and duration > settings.legendary_time_limit_seconds + 5:
        _finish(session, user, SessionStatus.FAILED)
        db.flush()
        raise DomainError("time_up", "Time's up! Legendary challenges must be finished in time.", 409)

    # XP
    breakdown: list[tuple[str, int]] = []
    skill_completed = False
    heart_gained = False
    if session.kind == SessionKind.LESSON:
        breakdown.append(("Lesson complete", settings.lesson_xp))
        if session.mistakes == 0:
            breakdown.append(("Perfect lesson", settings.perfect_lesson_bonus_xp))
        skill_completed = _advance_skill(db, user, session)
    elif session.kind == SessionKind.PRACTICE:
        breakdown.append(("Practice complete", settings.practice_xp))
        heart_gained = hearts.gain_heart(user)
    elif session.kind == SessionKind.UNIT_TEST:
        breakdown.append(("Unit test passed", settings.unit_test_xp))
        _complete_units_before(db, user, session)
    else:
        breakdown.append(("Legendary challenge", settings.legendary_xp))
        if session.skill_id is not None:
            p = progress.get_or_create_progress(db, user, session.skill_id)
            p.is_legendary = True
    xp = sum(amount for _, amount in breakdown)

    today = to_local_date(user, now)
    xp_before = xp_on(db, user, today)
    db.add(XpEvent(user_id=user.id, session_id=session.id, amount=xp, source=session.kind.value, activity_date=today))
    user.total_xp += xp
    session.xp_earned = xp
    _finish(session, user, SessionStatus.COMPLETED)

    goal_reached = xp_before < user.daily_goal_xp <= xp_before + xp
    gems_earned = settings.daily_goal_gems if goal_reached else 0
    user.gems += gems_earned

    streak_update = streak.record_activity(user, today)
    db.flush()
    new_achievements = achievements.evaluate(db, user)

    total_attempts = len(attempts)
    accuracy = round(100 * sum(a.is_correct for a in attempts) / total_attempts) if total_attempts else 100
    return Completion(
        session=session,
        xp_earned=xp,
        xp_breakdown=breakdown,
        accuracy=accuracy,
        duration_seconds=duration,
        streak=streak_update,
        xp_today=xp_before + xp,
        daily_goal_reached=goal_reached,
        gems_earned=gems_earned,
        heart_gained=heart_gained,
        skill_completed=skill_completed,
        new_achievements=new_achievements,
    )


def _complete_units_before(db: Session, user: User, session: LessonSession) -> None:
    """Passing a unit test finishes every skill before the target unit."""
    target = db.get(Skill, session.skill_id)
    assert target is not None
    now = user_now(user)
    for skill in progress.ordered_skills(target.unit.course):
        if skill.unit.position >= target.unit.position:
            break
        p = progress.get_or_create_progress(db, user, skill.id)
        p.lessons_completed = len(skill.lessons)
        p.completed_at = p.completed_at or now


def _advance_skill(db: Session, user: User, session: LessonSession) -> bool:
    """Mark the session's lesson as done. Returns True if that finished the skill."""
    lesson = db.get(Lesson, session.lesson_id)
    assert lesson is not None
    p = progress.get_or_create_progress(db, user, lesson.skill_id)
    if lesson.position == p.lessons_completed + 1:  # positions are 1-based
        p.lessons_completed += 1
    total = len(lesson.skill.lessons)
    if p.lessons_completed >= total and p.completed_at is None:
        p.completed_at = user_now(user)
        return True
    return False


def daily_xp_history(db: Session, user: User, days: int = 7) -> list[tuple[date, int]]:
    today = user_today(user)
    start = today - timedelta(days=days - 1)
    rows = db.execute(
        select(XpEvent.activity_date, func.sum(XpEvent.amount))
        .where(XpEvent.user_id == user.id, XpEvent.activity_date >= start, XpEvent.activity_date <= today)
        .group_by(XpEvent.activity_date)
    ).all()
    totals = {d: int(x) for d, x in rows}
    return [(start + timedelta(days=i), totals.get(start + timedelta(days=i), 0)) for i in range(days)]
