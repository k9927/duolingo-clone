"""Server-side answer checking for every exercise type.

Expected `answer` payloads (sent by the client):
    multiple_choice  {"choice_id": "b"}
    translate/listen {"tokens": ["I", "drink", "water"]}
    fill_blank       {"choice": "bebo"}
    type_answer      {"text": "el gato"}
    match_pairs      {"matches": [{"left": "p1", "right": "p1"}, ...]}
"""

import re
import unicodedata
from dataclasses import dataclass

from app.models import Exercise, ExerciseType

_PUNCTUATION = re.compile(r"[^\w\s']", re.UNICODE)
_SPACES = re.compile(r"\s+")


@dataclass
class GradeResult:
    correct: bool
    solution: str
    note: str | None = None


def normalize(text: str) -> str:
    text = text.lower().replace("’", "'")
    text = _PUNCTUATION.sub(" ", text)
    return _SPACES.sub(" ", text).strip()


def strip_accents(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text)
    return "".join(c for c in decomposed if unicodedata.category(c) != "Mn")


def levenshtein(a: str, b: str) -> int:
    if len(a) < len(b):
        a, b = b, a
    previous = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        current = [i]
        for j, cb in enumerate(b, 1):
            current.append(min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (ca != cb)))
        previous = current
    return previous[-1]


def _check_text(given: str, accepted: list[str], lenient: bool) -> GradeResult:
    """Exact match after normalization; when `lenient`, tolerate accents and one typo."""
    solution = accepted[0]
    given_n = normalize(given)
    accepted_n = [normalize(a) for a in accepted]
    if given_n in accepted_n:
        return GradeResult(True, solution)
    if not lenient or not given_n:
        return GradeResult(False, solution)

    for original, candidate in zip(accepted, accepted_n):
        if strip_accents(given_n) == strip_accents(candidate):
            return GradeResult(True, original, "Pay attention to the accents.")
    for original, candidate in zip(accepted, accepted_n):
        if len(candidate) >= 4 and levenshtein(given_n, candidate) <= 1:
            return GradeResult(True, original, "You have a typo.")
    return GradeResult(False, solution)


def grade(exercise: Exercise, answer: dict) -> GradeResult:
    data, solution = exercise.data, exercise.solution

    match exercise.type:
        case ExerciseType.MULTIPLE_CHOICE:
            correct_id = solution["choice_id"]
            text = next((c["text"] for c in data["choices"] if c["id"] == correct_id), "")
            return GradeResult(answer.get("choice_id") == correct_id, text)

        case ExerciseType.TRANSLATE | ExerciseType.LISTEN:
            tokens = answer.get("tokens") or []
            return _check_text(" ".join(map(str, tokens)), solution["accepted"], lenient=False)

        case ExerciseType.FILL_BLANK:
            expected = solution["answer"]
            full = " ".join(p for p in (data["before"], expected, data["after"]) if p)
            full = re.sub(r"\s+([.,!?])", r"\1", full)
            return GradeResult(normalize(answer.get("choice", "")) == normalize(expected), full)

        case ExerciseType.TYPE_ANSWER:
            return _check_text(str(answer.get("text", "")), solution["accepted"], lenient=True)

        case ExerciseType.MATCH_PAIRS:
            expected = {p["id"] for p in data["pairs"]}
            matches = answer.get("matches") or []
            ok = all(m.get("left") == m.get("right") for m in matches) and {
                m.get("left") for m in matches
            } == expected
            pairs_text = ", ".join(f"{p['left']} = {p['right']}" for p in data["pairs"])
            return GradeResult(ok, pairs_text)

    raise ValueError(f"Unsupported exercise type {exercise.type}")
