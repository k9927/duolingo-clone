from fastapi import APIRouter
from sqlalchemy import select

from app import schemas
from app.deps import DB, CurrentUser
from app.models import Course, Unit
from app.services import progress
from app.services.errors import DomainError, NotFound

router = APIRouter(prefix="/api", tags=["course"])


@router.get("/courses", response_model=list[schemas.CourseSummary])
def list_courses(db: DB):
    return db.scalars(select(Course).order_by(Course.id)).all()


@router.get("/path", response_model=schemas.PathOut)
def get_path(db: DB, user: CurrentUser):
    """The learner's current course as a path of units and skill nodes."""
    if user.current_course_id is None:
        raise DomainError("no_course", "Pick a course first.", 404)
    course = progress.load_course(db, user.current_course_id)
    if course is None:
        raise NotFound("Course")

    states = {s.skill.id: s for s in progress.compute_skill_states(db, user, course)}
    units = []
    for unit in course.units:
        nodes = [
            schemas.SkillNode(
                id=skill.id,
                title=skill.title,
                icon=skill.icon,
                position=skill.position,
                state=states[skill.id].state,
                lessons_completed=states[skill.id].lessons_completed,
                lessons_total=states[skill.id].lessons_total,
            )
            for skill in unit.skills
        ]
        units.append(
            schemas.UnitOut(
                id=unit.id,
                position=unit.position,
                section=unit.section,
                title=unit.title,
                description=unit.description,
                color=unit.color,
                completed=all(n.state in ("completed", "legendary") for n in nodes),
                skills=nodes,
            )
        )
    return schemas.PathOut(course=schemas.CourseSummary.model_validate(course), units=units)


@router.get("/units/{unit_id}/guidebook", response_model=schemas.Guidebook)
def get_guidebook(unit_id: int, db: DB):
    unit = db.get(Unit, unit_id)
    if unit is None:
        raise NotFound("Unit")
    book = unit.guidebook or {}
    return schemas.Guidebook(
        unit_id=unit.id,
        number=unit.position,
        title=unit.title,
        description=unit.description,
        color=unit.color,
        tips=book.get("tips", []),
        phrases=book.get("phrases", []),
    )
