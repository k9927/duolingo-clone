"""End-to-end tests of the lesson loop through the HTTP API."""

from app.models import Exercise


def correct_answer(ex: Exercise) -> dict:
    match ex.type.value:
        case "multiple_choice":
            return {"choice_id": ex.solution["choice_id"]}
        case "translate" | "listen":
            return {"tokens": ex.solution["accepted"][0].replace(",", "").replace(".", "").split()}
        case "fill_blank":
            return {"choice": ex.solution["answer"]}
        case "type_answer":
            return {"text": ex.solution["accepted"][0]}
        case "match_pairs":
            return {"matches": [{"left": p["id"], "right": p["id"]} for p in ex.data["pairs"]]}
    raise AssertionError(ex.type)


def active_skill(client) -> dict:
    path = client.get("/api/path").json()
    return next(s for u in path["units"] for s in u["skills"] if s["state"] == "active")


def play(client, db, session: dict, wrong_first: bool = False):
    for i, ex_out in enumerate(session["exercises"]):
        ex = db.get(Exercise, ex_out["id"])
        if wrong_first and i == 0:
            res = client.post(
                f"/api/sessions/{session['id']}/answers",
                json={"exercise_id": ex.id, "answer": {"choice_id": "zzz", "tokens": ["x"], "text": "x", "choice": "x"}},
            ).json()
            assert res["correct"] is False
        res = client.post(
            f"/api/sessions/{session['id']}/answers", json={"exercise_id": ex.id, "answer": correct_answer(ex)}
        )
        assert res.json()["correct"], (ex.type, res.json())
    return client.post(f"/api/sessions/{session['id']}/complete")


def test_seeded_state(client):
    me = client.get("/api/me").json()
    assert me["streak"] == 4 and not me["streak_extended_today"]
    assert me["hearts"] == 4
    path = client.get("/api/path").json()
    states = [s["state"] for u in path["units"] for s in u["skills"]]
    assert states[:3] == ["completed", "completed", "active"]
    assert set(states[3:]) == {"locked"}


def test_exercises_hide_solutions(client):
    session = client.post("/api/sessions", json={"kind": "lesson", "skill_id": active_skill(client)["id"]}).json()
    assert all("solution" not in ex for ex in session["exercises"])
    assert {ex["type"] for ex in session["exercises"]} >= {
        "multiple_choice", "translate", "match_pairs", "fill_blank", "type_answer",
    }


def test_full_lesson_awards_xp_extends_streak_and_progress(client, db):
    skill = active_skill(client)
    before = client.get("/api/me").json()
    session = client.post("/api/sessions", json={"kind": "lesson", "skill_id": skill["id"]}).json()
    result = play(client, db, session).json()

    assert result["xp_earned"] == 15  # lesson + perfect bonus
    assert result["streak"] == 5 and result["streak_extended"]
    assert result["me"]["total_xp"] == before["total_xp"] + 15
    assert any(a["code"] == "sage" for a in result["new_achievements"])  # crossed 100 XP
    assert active_skill(client)["lessons_completed"] == skill["lessons_completed"] + 1


def test_mistake_costs_heart_and_blocks_completion_until_fixed(client, db):
    skill = active_skill(client)
    session = client.post("/api/sessions", json={"kind": "lesson", "skill_id": skill["id"]}).json()
    first = session["exercises"][0]
    res = client.post(
        f"/api/sessions/{session['id']}/answers", json={"exercise_id": first["id"], "answer": {"choice_id": "nope"}}
    ).json()
    assert res["correct"] is False and res["hearts"] == 3

    early = client.post(f"/api/sessions/{session['id']}/complete")
    assert early.status_code == 409

    result = play(client, db, session).json()
    assert result["xp_earned"] == 10  # no perfect bonus


def test_out_of_hearts_blocks_lessons_and_practice_restores(client, db):
    client.post("/api/dev/set-hearts", json={"hearts": 0})
    blocked = client.post("/api/sessions", json={"kind": "lesson", "skill_id": active_skill(client)["id"]})
    assert blocked.status_code == 403 and blocked.json()["code"] == "out_of_hearts"

    practice = client.post("/api/sessions", json={"kind": "practice"}).json()
    result = play(client, db, practice).json()
    assert result["heart_gained"] and result["me"]["hearts"] == 1


def test_refill_hearts_with_gems(client):
    client.post("/api/dev/set-hearts", json={"hearts": 1})
    me = client.post("/api/shop/purchase", json={"item_id": "heart_refill"}).json()
    assert me["hearts"] == 5 and me["gems"] == 500 - 350
    again = client.post("/api/shop/purchase", json={"item_id": "heart_refill"})
    assert again.status_code == 400 and again.json()["code"] == "hearts_full"


def test_locked_skill_cannot_start(client):
    path = client.get("/api/path").json()
    locked = next(s for u in path["units"] for s in u["skills"] if s["state"] == "locked")
    res = client.post("/api/sessions", json={"kind": "lesson", "skill_id": locked["id"]})
    assert res.status_code == 403


def test_time_travel_breaks_streak(client):
    client.post("/api/dev/time-travel", json={"days": 2})
    assert client.get("/api/me").json()["streak"] == 0


def test_legendary_marks_skill(client, db):
    path = client.get("/api/path").json()
    done = path["units"][0]["skills"][0]
    session = client.post("/api/sessions", json={"kind": "legendary", "skill_id": done["id"]}).json()
    assert session["time_limit_seconds"]
    result = play(client, db, session).json()
    assert result["xp_earned"] == 40
    path = client.get("/api/path").json()
    assert path["units"][0]["skills"][0]["state"] == "legendary"


def test_leaderboard_ranks_learner(client):
    board = client.get("/api/leaderboard").json()
    xps = [e["xp"] for e in board["entries"]]
    assert xps == sorted(xps, reverse=True)
    assert sum(e["is_me"] for e in board["entries"]) == 1


def test_profile_lists_achievements(client):
    profile = client.get("/api/me/profile").json()
    codes = {a["code"]: a for a in profile["achievements"]}
    assert codes["wildfire"]["level"] == 1
    assert len(profile["xp_history"]) == 7


def test_reaching_daily_goal_opens_gem_chest_once(client, db):
    first = play(client, db, client.post("/api/sessions", json={"kind": "lesson", "skill_id": active_skill(client)["id"]}).json()).json()
    assert not first["daily_goal_reached"] and first["gems_earned"] == 0  # 15 of 20 XP

    second = play(client, db, client.post("/api/sessions", json={"kind": "lesson", "skill_id": active_skill(client)["id"]}).json()).json()
    assert second["daily_goal_reached"] and second["gems_earned"] == 5

    third = play(client, db, client.post("/api/sessions", json={"kind": "lesson", "skill_id": active_skill(client)["id"]}).json()).json()
    assert not third["daily_goal_reached"] and third["gems_earned"] == 0


def test_guidebook_has_phrases_and_structured_tips(client):
    unit_id = client.get("/api/path").json()["units"][0]["id"]
    book = client.get(f"/api/units/{unit_id}/guidebook").json()
    assert book["number"] == 1 and len(book["phrases"]) == 5
    tip = book["tips"][0]
    assert tip["title"] and "**" in tip["body"] and tip["table"]["headers"] and tip["examples"]


def _unit_start(client, index: int) -> dict:
    return client.get("/api/path").json()["units"][index]["skills"][0]


def test_unit_test_jumps_ahead_and_completes_earlier_units(client, db):
    target = _unit_start(client, 2)  # Unit 3, locked
    assert target["state"] == "locked"
    session = client.post("/api/sessions", json={"kind": "unit_test", "skill_id": target["id"]}).json()
    assert session["max_mistakes"] == 3 and session["unit_position"] == 3
    result = play(client, db, session).json()
    assert result["xp_earned"] == 20

    units = client.get("/api/path").json()["units"]
    assert all(s["state"] in ("completed", "legendary") for u in units[:2] for s in u["skills"])
    assert units[2]["skills"][0]["state"] == "active"


def test_unit_test_fails_after_three_mistakes(client, db):
    session = client.post("/api/sessions", json={"kind": "unit_test", "skill_id": _unit_start(client, 1)["id"]}).json()
    wrong = {"choice_id": "zzz", "tokens": ["x"], "text": "x", "choice": "x", "matches": []}
    for ex in session["exercises"][:3]:
        res = client.post(f"/api/sessions/{session['id']}/answers", json={"exercise_id": ex["id"], "answer": wrong}).json()
    assert res["session_status"] == "failed"
    assert _unit_start(client, 1)["state"] == "locked"


def test_unit_test_only_for_locked_unit_starts(client):
    first = _unit_start(client, 0)
    res = client.post("/api/sessions", json={"kind": "unit_test", "skill_id": first["id"]})
    assert res.status_code == 400 and res.json()["code"] == "not_a_unit_start"


def test_status_shows_on_leaderboard_and_can_be_cleared(client):
    assert client.put("/api/me/status", json={"status": "poop"}).json()["status"] == "poop"
    me = next(e for e in client.get("/api/leaderboard").json()["entries"] if e["is_me"])
    assert me["status"] == "poop"
    assert client.put("/api/me/status", json={"status": None}).json()["status"] is None
    assert client.put("/api/me/status", json={"status": "not-an-emoji"}).status_code == 422


def test_turning_off_listening_exercises_skips_them(client, db):
    skill = active_skill(client)
    with_listen = client.post("/api/sessions", json={"kind": "lesson", "skill_id": skill["id"]}).json()
    client.post(f"/api/sessions/{with_listen['id']}/abandon")
    assert any(e["type"] == "listen" for e in with_listen["exercises"])

    me = client.patch("/api/me/settings", json={"listening_exercises": False}).json()
    assert me["settings"]["listening_exercises"] is False
    session = client.post("/api/sessions", json={"kind": "lesson", "skill_id": skill["id"]}).json()
    assert session["exercises"] and all(e["type"] != "listen" for e in session["exercises"])
    assert play(client, db, session).status_code == 200


def test_streak_freezes_are_bought_with_gems_and_capped(client):
    first = client.post("/api/shop/purchase", json={"item_id": "streak_freeze"}).json()
    assert first["streak_freezes"] == 1 and first["gems"] == 500 - 200
    second = client.post("/api/shop/purchase", json={"item_id": "streak_freeze"}).json()
    assert second["streak_freezes"] == 2 and second["gems"] == 100
    items = {i["id"]: i for i in client.get("/api/shop/items").json()}
    assert not items["streak_freeze"]["available"] and items["streak_freeze"]["reason"] == "EQUIPPED"
    assert client.post("/api/shop/purchase", json={"item_id": "streak_freeze"}).status_code == 400


def test_time_travel_response_applies_heart_regen_and_streak_break(client):
    client.post("/api/dev/set-hearts", json={"hearts": 0})
    me = client.post("/api/dev/time-travel", json={"days": 1}).json()
    assert me["hearts"] == 5  # a day is far longer than 5 regeneration periods
    assert me["streak"] == 0  # the seeded streak ended yesterday, so a skipped day breaks it


def test_session_exercises_carry_word_hints(client):
    skill = active_skill(client)
    session = client.post("/api/sessions", json={"kind": "lesson", "skill_id": skill["id"]}).json()
    hinted = [ex for ex in session["exercises"] if ex["hints"]]
    assert hinted
    for ex in hinted:
        for field, h in ex["hints"].items():
            # Tokens cover the sentence exactly, so the client can render it as written.
            assert "".join(t["text"] for t in h["tokens"]) == ex["data"][field]
            assert h["lang"] in ("es", "en")


def test_word_hints_group_phrases_and_attach_audio():
    from app.services.word_hints import segment

    tokens = segment("Buenas noches, mamá.", "es")
    assert [t["text"] for t in tokens] == ["Buenas noches", ", ", "mamá", "."]
    assert tokens[0]["hints"][0] == "good night"
    assert "hints" not in tokens[1]
    assert tokens[2]["tts"].startswith("https://")
    assert segment("I have a dog.", "en")[0] == {"text": "I have", "hints": ["tengo"]}
