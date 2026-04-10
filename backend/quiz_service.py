"""MCQ quiz bank: reasoning + technical. Server scores by question id."""
import json
import os
import random
from typing import Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BANK_PATH = os.path.join(BASE_DIR, "data", "quiz_mcq.json")

_bank: dict[str, Any] | None = None

ALLOWED_TYPES = frozenset({"reasoning", "technical"})


def load_bank() -> dict[str, Any]:
    global _bank
    if _bank is None:
        with open(BANK_PATH, encoding="utf-8") as f:
            _bank = json.load(f)
    return _bank


def sample_quiz(quiz_type: str, n: int = 10) -> list[dict[str, Any]]:
    if quiz_type not in ALLOWED_TYPES:
        return []
    bank = load_bank()
    pool = list(bank.get(quiz_type, []))
    if not pool:
        return []
    k = min(n, len(pool))
    chosen = random.sample(pool, k) if len(pool) > k else pool[:]
    return [
        {
            "id": q["id"],
            "prompt": q["prompt"],
            "options": q["options"],
            **({"category": q["category"]} if q.get("category") else {}),
        }
        for q in chosen
    ]


def score_submission(quiz_type: str, answers: dict[str, Any]) -> dict[str, Any] | None:
    if quiz_type not in ALLOWED_TYPES:
        return None
    bank = load_bank()
    pool = {q["id"]: q for q in bank.get(quiz_type, [])}
    details = []
    correct_n = 0
    for qid, raw in answers.items():
        q = pool.get(str(qid))
        if not q:
            continue
        try:
            picked = int(raw)
        except (TypeError, ValueError):
            picked = -1
        right = int(q["correct"])
        ok = picked == right
        if ok:
            correct_n += 1
        details.append(
            {
                "id": qid,
                "correct": ok,
                "correct_index": right,
                "your_index": picked,
                "prompt": q["prompt"],
            }
        )
    total = len(details)
    if total == 0:
        return None
    pct = round(100 * correct_n / total, 1)
    return {
        "correct": correct_n,
        "total": total,
        "score_pct": pct,
        "details": details,
    }
