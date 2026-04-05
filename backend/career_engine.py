import json
import os
import re
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from config import MODEL_PATH

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROLES_PATH = os.path.join(BASE_DIR, "data", "roles_catalog.json")
REC_PATH = os.path.join(BASE_DIR, "data", "recommendations.json")

_pipeline = None
_roles = None
_recommendations = None


def _load_json(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_roles():
    global _roles
    if _roles is None:
        _roles = _load_json(ROLES_PATH)
    return _roles


def load_recommendations():
    global _recommendations
    if _recommendations is None:
        _recommendations = _load_json(REC_PATH)
    return _recommendations


def get_pipeline():
    global _pipeline
    if _pipeline is None and os.path.isfile(MODEL_PATH):
        _pipeline = joblib.load(MODEL_PATH)
    return _pipeline


def _norm_skills(text: str) -> set[str]:
    if not text:
        return set()
    parts = re.split(r"[,;/|]", text)
    return {p.strip().lower() for p in parts if p.strip()}


def _skill_jaccard(student_skills: str, required: list[str]) -> float:
    s = _norm_skills(student_skills)
    r = {x.lower() for x in required}
    if not r:
        return 0.0
    inter = len(s & r)
    union = len(s | r)
    return inter / union if union else 0.0


def _subject_overlap(student_subjects: str, preferred: list[str]) -> float:
    s = _norm_skills(student_subjects)
    p = {x.lower() for x in preferred}
    if not p:
        return 0.0
    hits = sum(1 for x in p if any(x in sub or sub in x for sub in s))
    return hits / len(p)


def _aptitude_alignment(role_domain: str, aptitude: dict[str, Any]) -> float:
    """Map domain to 0-1 alignment using quiz dimensions (0-100)."""
    if not aptitude:
        return 0.5
    d = role_domain.lower()
    scores = []
    if d in ("data",):
        scores.extend([aptitude.get("analytical", 60), aptitude.get("coding", 55), aptitude.get("logical", 60)])
    elif d in ("ai",):
        scores.extend([aptitude.get("coding", 60), aptitude.get("analytical", 60), aptitude.get("logical", 55)])
    elif d in ("web", "mobile"):
        scores.extend([aptitude.get("coding", 65), aptitude.get("creativity", 55), aptitude.get("design", 50)])
    elif d in ("design",):
        scores.extend([aptitude.get("creativity", 70), aptitude.get("design", 65), aptitude.get("communication", 60)])
    elif d in ("security", "cloud", "platform"):
        scores.extend([aptitude.get("logical", 60), aptitude.get("analytical", 58), aptitude.get("coding", 55)])
    elif d in ("business",):
        scores.extend([aptitude.get("communication", 70), aptitude.get("business", 60), aptitude.get("analytical", 55)])
    elif d in ("quality",):
        scores.extend([aptitude.get("logical", 62), aptitude.get("analytical", 58), aptitude.get("coding", 50)])
    else:
        scores.append(aptitude.get("overall", 65))
    return float(np.clip(np.mean(scores) / 100.0, 0, 1))


def _map_interest_domain(raw: str) -> str:
    low = (raw or "").lower()
    if any(k in low for k in ("data", "analytic", "bi", "excel")):
        return "Data"
    if any(k in low for k in ("ai", "ml", "deep")):
        return "AI"
    if any(k in low for k in ("design", "ui", "ux", "figma")):
        return "Design"
    if any(k in low for k in ("security", "cyber", "hack")):
        return "Security"
    if any(k in low for k in ("cloud", "aws", "azure", "devops")):
        return "Cloud"
    if any(k in low for k in ("android", "ios", "mobile")):
        return "Mobile"
    if any(k in low for k in ("business", "mba", "ba ")):
        return "Business"
    return "Web"


def _build_ml_frame(profile: dict[str, Any], aptitude: dict[str, Any]) -> pd.DataFrame:
    interests = (profile.get("interests") or "").split(",")
    first_interest = interests[0].strip() if interests and interests[0].strip() else "Web development"
    interest_domain = _map_interest_domain(first_interest)
    subs = (profile.get("preferred_subjects") or "").split(",")
    favorite_subject = (subs[0].strip() or "DBMS") if subs else "DBMS"
    intern = profile.get("internship_experience") or "No"
    if intern not in ("Yes", "No"):
        intern = "Yes" if str(intern).lower() in ("yes", "true", "1") else "No"
    row = {
        "branch": profile.get("branch") or "CSE",
        "cgpa": float(profile.get("cgpa") or 7.0),
        "interest_domain": interest_domain,
        "favorite_subject": favorite_subject,
        "technical_skills": profile.get("skills") or "Python,Git",
        "projects_count": _count_items(profile.get("projects_done")),
        "certifications_count": _count_items(profile.get("certifications")),
        "internship_experience": intern,
        "aptitude_score": int(aptitude.get("overall") or 70),
        "logical_score": int(aptitude.get("logical") or aptitude.get("overall") or 70),
        "analytical_score": int(aptitude.get("analytical") or aptitude.get("overall") or 70),
        "creativity_score": int(aptitude.get("creativity") or aptitude.get("overall") or 65),
        "communication_score": int(aptitude.get("communication") or profile.get("communication_score") or 70),
        "coding_score": int(aptitude.get("coding") or aptitude.get("overall") or 65),
        "preferred_work_style": profile.get("work_style") or "Analytical",
    }
    return pd.DataFrame([row])


def _count_items(field: Any) -> int:
    if field is None:
        return 0
    if isinstance(field, int):
        return field
    s = str(field).strip()
    if not s:
        return 0
    return max(1, len([x for x in re.split(r"[,;\n]", s) if x.strip()]))


def ml_probabilities(profile: dict, aptitude: dict) -> dict[str, float]:
    pipe = get_pipeline()
    if pipe is None:
        return {}
    X = _build_ml_frame(profile, aptitude)
    proba = pipe.predict_proba(X)[0]
    classes = pipe.named_steps["model"].classes_
    return {str(c): float(p) for c, p in zip(classes, proba)}


def hybrid_career_recommendations(profile: dict, aptitude: dict, top_n: int = 5) -> list[dict]:
    roles = load_roles()["careers"]
    ml_p = ml_probabilities(profile, aptitude)
    results = []
    skills_text = profile.get("skills") or ""
    subjects_text = profile.get("preferred_subjects") or ""

    for role in roles:
        name = role["role_name"]
        ml_conf = ml_p.get(name, 0.0)
        skill_part = _skill_jaccard(skills_text, role["required_skills"])
        subj_part = _subject_overlap(subjects_text, role.get("preferred_subjects", []))
        apt_part = _aptitude_alignment(role.get("domain", ""), aptitude)

        final = 0.50 * ml_conf + 0.25 * skill_part + 0.15 * apt_part + 0.10 * subj_part
        match_pct = round(100 * float(np.clip(final, 0, 1)), 1)
        results.append(
            {
                "role_name": name,
                "match_percentage": match_pct,
                "ml_confidence_pct": round(ml_conf * 100, 1) if ml_p else None,
                "breakdown": {
                    "ml_weight_50": round(ml_conf * 50, 1),
                    "skills_weight_25": round(skill_part * 25, 1),
                    "aptitude_weight_15": round(apt_part * 15, 1),
                    "subjects_weight_10": round(subj_part * 10, 1),
                },
                "domain": role.get("domain"),
                "why": _why_text(name, skill_part, apt_part, ml_conf),
            }
        )

    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return results[:top_n]


def _why_text(role: str, skill_part: float, apt_part: float, ml_conf: float) -> str:
    bits = []
    if skill_part >= 0.35:
        bits.append("Strong overlap with required skills for this role.")
    elif skill_part >= 0.15:
        bits.append("Partial skill alignment; gap analysis will highlight next steps.")
    if apt_part >= 0.72:
        bits.append("Your aptitude profile fits this domain well.")
    if ml_conf >= 0.2:
        bits.append("The trained classifier assigns meaningful confidence to this career.")
    if not bits:
        bits.append("Explore this path via the learning roadmap and projects list.")
    return " ".join(bits)


def skill_gap_analysis(profile: dict, role_name: str) -> dict:
    roles = {r["role_name"]: r for r in load_roles()["careers"]}
    role = roles.get(role_name)
    if not role:
        return {"error": "Unknown role"}
    required = role["required_skills"]
    student = _norm_skills(profile.get("skills") or "")
    missing = []
    have = []
    for req in required:
        rl = req.lower()
        matched = any(rl in s or s in rl for s in student)
        if matched:
            have.append(req)
        else:
            missing.append(req)
    readiness = round(100 * len(have) / len(required), 1) if required else 0
    priority = missing
    return {
        "role_name": role_name,
        "readiness_score": readiness,
        "missing_skills": missing,
        "existing_skills_matched": have,
        "priority_learning_order": priority,
    }


def learning_roadmap(role_name: str, level: str = "placement") -> dict:
    roles = {r["role_name"]: r for r in load_roles()["careers"]}
    role = roles.get(role_name)
    if not role:
        return {"error": "Unknown role"}
    rm = role.get("roadmap", {})
    level = level if level in rm else "placement"
    steps = []
    idx = 1
    for stage, items in rm.items():
        for it in items:
            steps.append({"step": idx, "stage": stage, "title": it})
            idx += 1
    weekly = []
    for w, chunk in enumerate(chunks(steps, 3), start=1):
        weekly.append({"week": w, "tasks": [c["title"] for c in chunk]})
    return {
        "role_name": role_name,
        "level": level,
        "highlighted_track": rm.get(level, []),
        "full_steps": steps,
        "weekly_plan": weekly[:12],
        "estimated_weeks": min(12, len(weekly)),
    }


def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def ats_score(resume_text: str, student_skills: str, role_name: str) -> dict:
    roles = {r["role_name"]: r for r in load_roles()["careers"]}
    role = roles.get(role_name)
    if not role:
        return {"error": "Unknown role"}
    text = (resume_text or "").lower()
    skills_set = _norm_skills(student_skills)
    keywords = [k.lower() for k in role.get("ats_keywords", [])]
    hits = sum(1 for k in keywords if k in text or any(k in s for s in skills_set))
    kw_score = (hits / len(keywords)) if keywords else 0.5

    sections = ["education", "experience", "project", "skill", "certif", "intern"]
    present = sum(1 for s in sections if s in text)
    completeness = present / len(sections)

    proj_hint = 1.0 if "project" in text else 0.4
    cert_hint = 1.0 if "certif" in text else 0.5

    formatting = 0.7 if len(text) > 400 else 0.45
    role_align = _skill_jaccard(student_skills, role["required_skills"])

    total = (
        0.35 * kw_score
        + 0.20 * completeness
        + 0.20 * proj_hint
        + 0.10 * cert_hint
        + 0.10 * formatting
        + 0.05 * role_align
    )
    score = int(round(100 * float(np.clip(total, 0, 1))))
    missing_kw = [k for k in role.get("ats_keywords", []) if k.lower() not in text]
    suggestions = []
    if completeness < 0.6:
        suggestions.append("Add clear sections: Education, Experience/Projects, Skills, Certifications.")
    if proj_hint < 0.8:
        suggestions.append("Describe 2–3 projects with tech stack and measurable outcomes.")
    if missing_kw[:8]:
        suggestions.append("Weave these role keywords naturally: " + ", ".join(missing_kw[:8]) + ".")
    return {
        "role_name": role_name,
        "ats_score": score,
        "missing_keywords": missing_kw[:15],
        "suggestions": suggestions,
        "weights_note": "Skills/keywords 35%, completeness 20%, projects 20%, certs 10%, formatting 10%, role alignment 5%",
    }


def job_role_matches(profile: dict, resume_text: str = "") -> list[dict]:
    roles = load_roles()["careers"]
    corpus_student = " ".join(
        [
            profile.get("skills") or "",
            profile.get("interests") or "",
            profile.get("preferred_subjects") or "",
            profile.get("projects_done") or "",
            resume_text or "",
        ]
    )
    role_docs = []
    names = []
    for r in roles:
        names.append(r["role_name"])
        role_docs.append(
            " ".join(r["required_skills"])
            + " "
            + " ".join(r.get("preferred_subjects", []))
            + " "
            + r.get("domain", "")
        )
    vec = TfidfVectorizer(max_features=200, stop_words="english")
    try:
        mat = vec.fit_transform([corpus_student] + role_docs)
        sims = cosine_similarity(mat[0:1], mat[1:]).flatten()
    except ValueError:
        sims = np.zeros(len(names))
    out = []
    for name, s in zip(names, sims):
        out.append({"role_name": name, "match_percentage": round(float(s) * 100, 1)})
    out.sort(key=lambda x: x["match_percentage"], reverse=True)
    return out


def get_courses_projects_interview(role_name: str) -> dict:
    rec = load_recommendations()
    pack = rec.get(role_name, {})
    return {
        "role_name": role_name,
        "courses": pack.get("courses", []),
        "projects": pack.get("projects", []),
        "interview_topics": pack.get("interview", []),
    }


def career_trends():
    return load_roles().get("trends_2026", [])
