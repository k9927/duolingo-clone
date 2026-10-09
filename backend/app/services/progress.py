"""Learning-path progression: which skills are completed, active or locked.

Skills unlock strictly in order across the whole course: every skill before the
first unfinished one is completed, that one is active, everything after is locked.
"""

from dataclasses import dataclass
from typing import Literal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Course, Skill, SkillProgress, Unit, User

SkillStateName = Literal["locked", "active", "completed", "legendary"]


@dataclass
class SkillState:
    skill: Skill
    state: SkillStateName
    lessons_completed: int
    lessons_total: int


def load_course(db: Session, course_id: int) -> Course | None:
    return db.scalar(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.units).selectinload(Unit.skills).selectinload(Skill.lessons))
    )


def ordered_skills(course: Course) -> list[Skill]:
    return [skill for unit in course.units for skill in unit.skills]


def progress_by_skill(db: Session, user: User) -> dict[int, SkillProgress]:
    rows = db.scalars(select(SkillProgress).where(SkillProgress.user_id == user.id))
    return {p.skill_id: p for p in rows}


def compute_skill_states(db: Session, user: User, course: Course) -> list[SkillState]:
    progress = progress_by_skill(db, user)
    states: list[SkillState] = []
    active_found = False
    for skill in ordered_skills(course):
        p = progress.get(skill.id)
        done = p.lessons_completed if p else 0
        total = len(skill.lessons)
        state: SkillStateName
        if done >= total:
            state = "legendary" if p and p.is_legendary else "completed"
        elif not active_found:
            state, active_found = "active", True
        else:
            state = "locked"
        states.append(SkillState(skill, state, min(done, total), total))
    return states


def skill_state(db: Session, user: User, skill: Skill) -> SkillState:
    course = load_course(db, skill.unit.course_id)
    assert course is not None
    return next(s for s in compute_skill_states(db, user, course) if s.skill.id == skill.id)


def get_or_create_progress(db: Session, user: User, skill_id: int) -> SkillProgress:
    p = db.scalar(
        select(SkillProgress).where(SkillProgress.user_id == user.id, SkillProgress.skill_id == skill_id)
    )
    if p is None:
        p = SkillProgress(user_id=user.id, skill_id=skill_id, lessons_completed=0)
        db.add(p)
        db.flush()
    return p
