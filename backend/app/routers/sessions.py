from fastapi import APIRouter, Response

from app import schemas
from app.config import settings
from app.deps import DB, CurrentUser
from app.models import LessonSession, SessionKind
from app.services import sessions as svc
from app.services import word_hints
from app.services.errors import DomainError
from app.services.users import build_me

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def _session_out(db, user, session: LessonSession) -> schemas.SessionOut:
    skill = session.skill
    lesson = session.lesson
    course = user.current_course
    legendary = session.kind == SessionKind.LEGENDARY
    unit = skill.unit if skill else None
    language = course.learning_language if course else "es"
    exercises = [
        schemas.ExerciseOut.model_validate(e).model_copy(update={"hints": word_hints.for_exercise(e, language)})
        for e in svc.session_exercises(db, session)
    ]
    return schemas.SessionOut(
        id=session.id,
        kind=session.kind.value,
        skill_id=session.skill_id,
        skill_title=skill.title if skill else None,
        unit_position=unit.position if unit else None,
        lesson_position=lesson.position if lesson else None,
        lessons_total=len(skill.lessons) if skill else None,
        language=language,
        exercises=exercises,
        hearts=user.hearts,
        time_limit_seconds=settings.legendary_time_limit_seconds if legendary else None,
        max_mistakes=svc.max_mistakes(session.kind),
    )


@router.post("", response_model=schemas.SessionOut, status_code=201)
def start_session(body: schemas.StartSession, db: DB, user: CurrentUser):
    if body.kind not in ("practice", "sounds") and body.skill_id is None:
        raise DomainError("skill_required", "skill_id is required for this kind of session.")
    if body.kind == "lesson":
        session = svc.start_lesson(db, user, body.skill_id)
    elif body.kind == "legendary":
        session = svc.start_legendary(db, user, body.skill_id)
    elif body.kind == "sounds":
        session = svc.start_sounds(db, user)
    elif body.kind == "unit_test":
        session = svc.start_unit_test(db, user, body.skill_id)
    else:
        session = svc.start_practice(db, user, body.skill_id)
    db.commit()
    return _session_out(db, user, session)


@router.post("/{session_id}/answers", response_model=schemas.AnswerOut)
def answer(session_id: int, body: schemas.AnswerIn, db: DB, user: CurrentUser):
    session = svc.get_session(db, user, session_id)
    outcome = svc.submit_answer(db, user, session, body.exercise_id, body.answer)
    db.commit()
    return schemas.AnswerOut(
        correct=outcome.grade.correct,
        solution=outcome.grade.solution,
        note=outcome.grade.note,
        hearts=user.hearts,
        mistakes=session.mistakes,
        out_of_hearts=outcome.out_of_hearts,
        session_status=session.status.value,
    )


@router.post("/{session_id}/complete", response_model=schemas.CompleteOut)
def complete(session_id: int, db: DB, user: CurrentUser):
    session = svc.get_session(db, user, session_id)
    try:
        result = svc.complete(db, user, session)
    except DomainError:
        db.commit()  # keep a "failed" status (e.g. legendary time-out)
        raise
    db.commit()
    return schemas.CompleteOut(
        xp_earned=result.xp_earned,
        xp_breakdown=[schemas.XpLine(label=label, amount=amount) for label, amount in result.xp_breakdown],
        accuracy=result.accuracy,
        duration_seconds=result.duration_seconds,
        mistakes=session.mistakes,
        streak=result.streak.streak,
        streak_extended=result.streak.extended,
        xp_today=result.xp_today,
        daily_goal_xp=user.daily_goal_xp,
        daily_goal_reached=result.daily_goal_reached,
        gems_earned=result.gems_earned,
        heart_gained=result.heart_gained,
        skill_completed=result.skill_completed,
        new_achievements=[
            schemas.UnlockedAchievement(
                code=a.code,
                level=a.level,
                title=a.title,
                description=a.description,
                icon=a.icon,
                color=a.color,
                gem_reward=a.gem_reward,
            )
            for a in result.new_achievements
        ],
        me=build_me(db, user),
    )


@router.post("/{session_id}/abandon", status_code=204)
def abandon(session_id: int, db: DB, user: CurrentUser):
    session = svc.get_session(db, user, session_id)
    svc.abandon(db, user, session)
    db.commit()
    return Response(status_code=204)
