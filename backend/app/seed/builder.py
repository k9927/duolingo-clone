"""Turns the vocabulary/sentence lists in content.py into concrete exercises.

Each lesson gets a deterministic mix of every exercise type, rotating through
the skill's material so consecutive lessons introduce different words.
"""

import json
import random
import re
from pathlib import Path

from app.models import ExerciseType

# Official Duolingo lessons + per-word illustrations/audio (see duolingo_lessons.json).
DUOLINGO = json.loads((Path(__file__).with_name("duolingo_lessons.json")).read_text(encoding="utf-8"))
WORD_ART: dict[str, dict] = DUOLINGO["words"]


def _bare(word: str) -> str:
    """'el agua' -> 'agua' (Duolingo's picture cards use the bare noun)."""
    return re.sub(r"^(el|la|los|las|un|una)\s+", "", word)


def _card(es: str, emoji: str) -> dict:
    art = WORD_ART.get(_bare(es))
    card = {"text": es, "image": art["image"] if art else emoji}
    if art:
        card["tts"] = art["tts"]
    return card


def static_lessons(name: str) -> list[list[dict]]:
    """Ready-made lessons; exercise dicts already in this app's format."""
    assert name == "duolingo"
    return [
        [{**ex, "type": ExerciseType(ex["type"])} for ex in lesson]
        for lesson in DUOLINGO["lessons"]
    ]

_TOKEN = re.compile(r"[\w']+", re.UNICODE)


def tokenize(sentence: str) -> list[str]:
    """Word-bank tiles: words without punctuation, sentence-initial word lowercased (except "I")."""
    tokens = _TOKEN.findall(sentence)
    if tokens and tokens[0] != "I":
        tokens[0] = tokens[0].lower()
    return tokens


def _alternatives(text: str) -> list[str]:
    return [t.strip() for t in text.split("|")]


def _distractors(rng: random.Random, answer: list[str], others: list[str], count: int) -> list[str]:
    used = {t.lower() for t in answer}
    pool = sorted({t for s in others for t in tokenize(s) if t.lower() not in used})
    return rng.sample(pool, min(count, len(pool)))


def _word_bank(rng: random.Random, sentence: str, others: list[str]) -> list[str]:
    answer = tokenize(sentence)
    tiles = answer + _distractors(rng, answer, others, 3 if len(answer) < 4 else 4)
    rng.shuffle(tiles)
    return tiles


def _choices(rng: random.Random, correct: dict, pool: list[dict], count: int) -> tuple[list[dict], str]:
    options = [correct] + rng.sample([p for p in pool if p is not correct], count - 1)
    rng.shuffle(options)
    labelled = [{"id": chr(ord("a") + i), **o} for i, o in enumerate(options)]
    correct_id = next(c["id"] for c in labelled if c["text"] == correct["text"])
    return labelled, correct_id


def build_lesson(skill: dict, lesson_index: int, seed: int) -> list[dict]:
    """Returns exercise dicts: {type, prompt, data, solution}."""
    rng = random.Random(seed)
    words, sentences, blanks = skill["words"], skill["sentences"], skill["blanks"]
    n_words, n_sent = len(words), len(sentences)
    es_sentences = [es for es, _ in sentences]
    en_sentences = [_alternatives(en)[0] for _, en in sentences]

    def word(i: int):
        return words[(2 * lesson_index + i) % n_words]

    def sentence(i: int):
        es, en = sentences[(lesson_index + i) % n_sent]
        return es, _alternatives(en)

    exercises: list[dict] = []

    # 1. Image multiple choice: "Which one of these is “the bread”?"
    es, en, emoji = word(0)
    word_cards = [_card(w_es, w_emoji) for w_es, _, w_emoji in words]
    target = next(c for c in word_cards if c["text"] == es)
    choices, correct_id = _choices(rng, target, word_cards, 3)
    exercises.append(
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": f"Which one of these is “{en}”?",
            "data": {"choices": choices, "variant": "image"},
            "solution": {"choice_id": correct_id},
        }
    )

    # 2. Select the correct meaning of a sentence (text choices)
    es, en_alts = sentence(3)
    meaning_cards = [{"text": s} for s in en_sentences]
    target = next(c for c in meaning_cards if c["text"] == en_alts[0])
    choices, correct_id = _choices(rng, target, meaning_cards, 3)
    exercises.append(
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "Select the correct meaning",
            "data": {"choices": choices, "variant": "text", "sentence": es},
            "solution": {"choice_id": correct_id},
        }
    )

    # 3. Translate Spanish -> English with a word bank
    es, en_alts = sentence(0)
    exercises.append(
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Write this in English",
            "data": {"sentence": es, "sentence_lang": "es", "words": _word_bank(rng, en_alts[0], en_sentences)},
            "solution": {"accepted": en_alts},
        }
    )

    # 4. Match pairs
    pair_words = rng.sample(words, 5)
    exercises.append(
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Select the matching pairs",
            "data": {"pairs": [{"id": f"p{i + 1}", "left": es, "right": en} for i, (es, en, _) in enumerate(pair_words)]},
            "solution": {},
        }
    )

    # 5. Fill in the blank
    before, answer, after, translation, distractors = blanks[lesson_index % len(blanks)]
    tiles = [answer, *distractors]
    rng.shuffle(tiles)
    exercises.append(
        {
            "type": ExerciseType.FILL_BLANK,
            "prompt": "Fill in the blank",
            "data": {"before": before, "after": after, "translation": translation, "choices": tiles},
            "solution": {"answer": answer},
        }
    )

    # 6. Listen and tap what you hear (Spanish word bank)
    es, _ = sentence(1)
    exercises.append(
        {
            "type": ExerciseType.LISTEN,
            "prompt": "Tap what you hear",
            "data": {"audio_text": es, "words": _word_bank(rng, es, es_sentences)},
            "solution": {"accepted": [es]},
        }
    )

    # 7. Translate English -> Spanish with a word bank
    es, en_alts = sentence(2)
    exercises.append(
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Write this in Spanish",
            "data": {"sentence": en_alts[0], "sentence_lang": "en", "words": _word_bank(rng, es, es_sentences)},
            "solution": {"accepted": [es]},
        }
    )

    # 8. Type the answer
    es, en, _ = word(1)
    exercises.append(
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "Type this in Spanish",
            "data": {"sentence": en, "sentence_lang": "en"},
            "solution": {"accepted": [es]},
        }
    )

    return exercises
