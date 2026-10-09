"""Splits exercise sentences into tokens with hover hints, like Duolingo's word hints.

A sentence becomes a list of tokens covering the whole text: words or phrases carry
their meaning in the lesson, an example sentence showing the word in use (and Duolingo's
recorded audio when the seed has one), while spaces and punctuation are plain tokens, so
the client can render the sentence exactly as written.
"""

import re

from app.models import Exercise, ExerciseType
from app.seed.builder import WORD_ART
from app.seed.hints import HINTS

WORD = re.compile(r"[^\W\d_]+(?:'[^\W\d_]+)?")
MAX_PHRASE = 3


def segment(text: str, lang: str) -> list[dict]:
    hints = HINTS.get(lang, {})
    words = list(WORD.finditer(text))
    tokens: list[dict] = []
    pos = i = 0
    while i < len(words):
        # Longest phrase starting here whose words are separated by spaces only.
        for n in range(min(MAX_PHRASE, len(words) - i), 0, -1):
            group = words[i : i + n]
            if any(text[a.end() : b.start()].strip() for a, b in zip(group, group[1:])):
                continue
            key = " ".join(m.group().lower() for m in group)
            if n == 1 or key in hints:
                break
        start, end = group[0].start(), group[-1].end()
        if start > pos:
            tokens.append({"text": text[pos:start]})
        token: dict = {"text": text[start:end], "hints": []}
        if key in hints:
            meanings, example, translation = hints[key]
            token["hints"] = meanings
            # An example identical to the sentence being shown would teach nothing new.
            if example.strip("¿?¡!. ").lower() != text.strip("¿?¡!. ").lower():
                token["example"] = {"text": example, "translation": translation}
        art = WORD_ART.get(key) if lang == "es" else None
        if art:
            token["tts"] = art["tts"]
        tokens.append(token)
        pos, i = end, i + n
    if pos < len(text):
        tokens.append({"text": text[pos:]})
    return tokens


def _guess_lang(text: str, course_lang: str) -> str:
    """Multiple-choice sentences carry no language; pick the dictionary that knows more of the words."""
    words = [m.group().lower() for m in WORD.finditer(text)]
    known = {lang: sum(w in d for w in words) for lang, d in HINTS.items()}
    return max(known, key=lambda lang: (known[lang], lang == course_lang))


def for_exercise(exercise: Exercise, course_lang: str) -> dict[str, dict]:
    """Hinted versions of the sentences an exercise shows, keyed by the `data` field they replace."""
    data = exercise.data
    fields: dict[str, str] = {}
    if exercise.type in (ExerciseType.TRANSLATE, ExerciseType.TYPE_ANSWER):
        fields["sentence"] = data["sentence_lang"]
    elif exercise.type == ExerciseType.MULTIPLE_CHOICE and data.get("sentence"):
        fields["sentence"] = _guess_lang(data["sentence"], course_lang)
    elif exercise.type == ExerciseType.FILL_BLANK:
        fields = {"before": course_lang, "after": course_lang}
    return {f: {"lang": lang, "tokens": segment(data[f], lang)} for f, lang in fields.items() if data.get(f)}
