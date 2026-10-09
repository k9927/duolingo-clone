"""Content for the Sounds tab: Spanish sounds with an example word each, and the
"Select what you hear" questions its lesson is made of.

The questions live in a small course of their own (code `SOUNDS_COURSE_CODE`) so they are
ordinary exercises with server-side grading, but that course never appears in the
course list or on the learning path.
"""

import random

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Course, Exercise, ExerciseType, Lesson, Skill, Unit

SOUNDS_COURSE_CODE = "es-sounds"

# (symbol, example word); the same list the Sounds tab shows.
VOWELS = [
    ("a", "casa"), ("e", "mesa"), ("i", "sí"), ("o", "oso"), ("u", "uno"),
    ("ai", "aire"), ("ei", "rey"), ("oi", "hoy"), ("au", "auto"),
]  # fmt: skip
CONSONANTS = [
    ("b", "bebé"), ("c", "casa"), ("ch", "chico"), ("d", "dedo"), ("f", "foto"), ("g", "gato"),
    ("h", "hola"), ("j", "jugo"), ("l", "luna"), ("ll", "llave"), ("m", "mamá"), ("n", "nube"),
    ("ñ", "niño"), ("p", "papá"), ("qu", "queso"), ("r", "pero"), ("rr", "perro"), ("s", "sol"),
    ("t", "té"), ("v", "vaca"), ("x", "taxi"), ("y", "yo"), ("z", "zapato"),
]  # fmt: skip

# Words that sound alike, offered together so the learner has to listen closely.
SIMILAR = {
    "pero": ["perro"], "perro": ["pero"], "casa": ["mesa", "gato"], "mesa": ["casa"],
    "sí": ["té", "yo"], "té": ["sí"], "oso": ["uno"], "uno": ["oso"], "hoy": ["rey", "yo"],
    "rey": ["hoy"], "yo": ["hoy"], "mamá": ["papá"], "papá": ["mamá"], "nube": ["luna"],
    "niño": ["chico"], "chico": ["niño"], "dedo": ["foto"], "auto": ["foto"], "vaca": ["casa"],
}  # fmt: skip


def sound_exercises(seed: int = 7) -> list[dict]:
    """One "Select what you hear" question per example word, with three word choices."""
    rng = random.Random(seed)
    words = list(dict.fromkeys(word for _, word in VOWELS + CONSONANTS))
    exercises = []
    for symbol, word in VOWELS + CONSONANTS:
        similar = [w for w in SIMILAR.get(word, []) if w != word]
        others = [w for w in words if w != word and w not in similar]
        distractors = (similar + rng.sample(others, 2))[:2]
        options = [word, *distractors]
        rng.shuffle(options)
        choices = [{"id": chr(ord("a") + i), "text": w} for i, w in enumerate(options)]
        exercises.append(
            {
                "type": ExerciseType.MULTIPLE_CHOICE,
                "prompt": "Select what you hear",
                "data": {"variant": "audio", "audio_text": word, "sound": symbol, "choices": choices},
                "solution": {"choice_id": next(c["id"] for c in choices if c["text"] == word)},
            }
        )
    return exercises


def ensure_sounds_course(db: Session) -> Course:
    """Creates the hidden sounds course if this database doesn't have it yet."""
    course = db.scalar(select(Course).where(Course.code == SOUNDS_COURSE_CODE))
    if course is not None:
        return course
    course = Course(
        code=SOUNDS_COURSE_CODE,
        title="Spanish sounds",
        learning_language="es",
        learning_language_name="Spanish",
        from_language="en",
        flag="🇪🇸",
    )
    lesson = Lesson(position=1)
    for position, ex in enumerate(sound_exercises(), start=1):
        lesson.exercises.append(Exercise(position=position, **ex))
    skill = Skill(position=1, title="Sounds", icon="🔊", lessons=[lesson])
    course.units.append(
        Unit(position=1, section=1, title="Sounds", description="Spanish sounds", color="#1CB0F6", skills=[skill])
    )
    db.add(course)
    db.flush()
    return course
