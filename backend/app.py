import json
import os
from datetime import datetime

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from sqlalchemy import func
from werkzeug.utils import secure_filename

from auth_util import decode_token, hash_password, make_token, verify_password
from career_engine import (
    ats_score,
    career_trends,
    get_courses_projects_interview,
    hybrid_career_recommendations,
    job_role_matches,
    learning_roadmap,
    skill_gap_analysis,
    load_roles,
)
from config import Config, UPLOAD_FOLDER
from database import db
from models import AptitudeResult, CareerPredictionRow, ProgressTracking, Resume, SkillGapRow, Student
from resume_parser import extract_text_from_bytes, parse_resume_text

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIST = os.path.normpath(os.path.join(BASE_DIR, "..", "frontend", "dist"))
app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")
app.config.from_object(Config)
CORS(app, supports_credentials=True)
db.init_app(app)

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    return send_from_directory(FRONTEND_DIST, "index.html")


def auth_student_id() -> int | None:
    h = request.headers.get("Authorization", "")
    if not h.startswith("Bearer "):
        return None
    return decode_token(h[7:])


def student_to_profile(s: Student) -> dict:
    return {
        "name": s.name,
        "email": s.email,
        "branch": s.branch,
        "degree": s.degree,
        "year": s.year,
        "cgpa": s.cgpa,
        "interests": s.interests,
        "skills": s.skills,
        "preferred_subjects": s.preferred_subjects,
        "projects_done": s.projects_done,
        "certifications": s.certifications,
        "internship_experience": s.internship_experience,
        "communication_score": s.communication_score,
        "work_style": s.work_style,
        "career_goal": s.career_goal,
    }


def latest_aptitude_dict(student_id: int) -> dict:
    r = (
        AptitudeResult.query.filter_by(student_id=student_id)
        .order_by(AptitudeResult.created_at.desc())
        .first()
    )
    if not r:
        return {
            "overall": 70,
            "logical": 70,
            "analytical": 70,
            "creativity": 65,
            "communication": 70,
            "coding": 65,
            "design": 60,
            "business": 55,
        }
    dom = {}
    if r.domain_scores:
        try:
            dom = json.loads(r.domain_scores)
        except json.JSONDecodeError:
            dom = {}
    return {
        "overall": r.overall or 70,
        "logical": r.logical or 70,
        "problem_solving": r.problem_solving or 70,
        "creativity": r.creativity or 65,
        "communication": r.communication or 70,
        "analytical": r.analytical or 70,
        "coding": r.coding or 65,
        "leadership": r.leadership or 60,
        "teamwork": r.teamwork or 65,
        "business": r.business or 55,
        "design": r.design or 60,
        "domain_chart": dom,
    }


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = (data.get("name") or "Student").strip()
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if Student.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409
    s = Student(name=name, email=email, password_hash=hash_password(password))
    db.session.add(s)
    db.session.commit()
    token = make_token(s.id)
    return jsonify({"token": token, "student": {"id": s.id, "name": s.name, "email": s.email}})


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    s = Student.query.filter_by(email=email).first()
    if not s or not verify_password(password, s.password_hash):
        return jsonify({"error": "Invalid credentials"}), 401
    token = make_token(s.id)
    return jsonify({"token": token, "student": {"id": s.id, "name": s.name, "email": s.email}})


@app.route("/api/profile", methods=["GET"])
def get_profile():
    sid = auth_student_id()
    if not sid:
        return jsonify({"error": "Unauthorized"}), 401
    s = Student.query.get(sid)
    if not s:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"profile": student_to_profile(s), "id": s.id})


@app.route("/api/profile/<int:student_id>", methods=["GET"])
def get_profile_by_id(student_id):
    sid = auth_student_id()
    if not sid or sid != student_id:
        return jsonify({"error": "Unauthorized"}), 401
    s = Student.query.get(student_id)
    if not s:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"profile": student_to_profile(s), "id": s.id})


@app.route("/api/profile", methods=["POST", "PUT"])
def upsert_profile():
    sid = auth_student_id()
    if not sid:
        return jsonify({"error": "Unauthorized"}), 401
    s = Student.query.get(sid)
    if not s:
        return jsonify({"error": "Not found"}), 404
    data = request.get_json(force=True, silent=True) or {}
    for field in [
        "name",
        "branch",
        "degree",
        "year",
        "interests",
        "skills",
        "preferred_subjects",
        "projects_done",
        "certifications",
        "internship_experience",
        "work_style",
        "career_goal",
    ]:
        if field in data:
            setattr(s, field, data[field])
    if "cgpa" in data:
        try:
            s.cgpa = float(data["cgpa"])
        except (TypeError, ValueError):
            pass
    if "communication_score" in data:
        try:
            s.communication_score = int(data["communication_score"])
        except (TypeError, ValueError):
            pass
    db.session.commit()
    return jsonify({"ok": True, "profile": student_to_profile(s)})


@app.route("/api/aptitude/submit", methods=["POST"])
def aptitude_submit():
    sid = auth_student_id()
    if not sid:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json(force=True, silent=True) or {}

    def g(key, default=70):
        try:
            return int(data.get(key, default))
        except (TypeError, ValueError):
            return default

    logical = g("logical")
    problem_solving = g("problem_solving")
    creativity = g("creativity")
    communication = g("communication")
    analytical = g("analytical")
    coding = g("coding")
    leadership = g("leadership")
    teamwork = g("teamwork")
    business = g("business")
    design = g("design")
    vals = [
        logical,
        problem_solving,
        creativity,
        communication,
        analytical,
        coding,
        leadership,
        teamwork,
        business,
        design,
    ]
    overall = int(round(sum(vals) / len(vals)))
    domain_scores = {
        "Analytical": int(round((logical + problem_solving + analytical) / 3)),
        "Creative": int(round((creativity + design) / 2)),
        "Communication": int(round((communication + teamwork + leadership) / 3)),
        "Technical": int(round((coding + analytical * 0.4 + logical * 0.4) / 1.8)),
    }
    row = AptitudeResult(
        student_id=sid,
        logical=logical,
        problem_solving=problem_solving,
        creativity=creativity,
        communication=communication,
        analytical=analytical,
        coding=coding,
        leadership=leadership,
        teamwork=teamwork,
        business=business,
        design=design,
        overall=overall,
        domain_scores=json.dumps(domain_scores),
    )
    db.session.add(row)
    db.session.commit()
    return jsonify(
        {
            "ok": True,
            "overall": overall,
            "domain_scores": domain_scores,
            "dimensions": {
                "logical": logical,
                "problem_solving": problem_solving,
                "creativity": creativity,
                "communication": communication,
                "analytical": analytical,
                "coding": coding,
                "leadership": leadership,
                "teamwork": teamwork,
                "business": business,
                "design": design,
            },
        }
    )


@app.route("/api/aptitude/result/<int:student_id>", methods=["GET"])
def aptitude_result(student_id):
    sid = auth_student_id()
    if not sid or sid != student_id:
        return jsonify({"error": "Unauthorized"}), 401
    r = (
        AptitudeResult.query.filter_by(student_id=student_id)
        .order_by(AptitudeResult.created_at.desc())
        .first()
    )
    if not r:
        return jsonify({"result": None})
    dom = json.loads(r.domain_scores) if r.domain_scores else {}
    return jsonify(
        {
            "result": {
                "overall": r.overall,
                "domain_scores": dom,
                "created_at": r.created_at.isoformat(),
            }
        }
    )


@app.route("/api/resume/upload", methods=["POST"])
def resume_upload():
    sid = auth_student_id()
    if not sid:
        return jsonify({"error": "Unauthorized"}), 401
    f = request.files.get("file")
    if not f or not f.filename:
        return jsonify({"error": "file required"}), 400
    name = secure_filename(f.filename)
    raw = f.read()
    try:
        text = extract_text_from_bytes(raw, name)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    parsed = parse_resume_text(text)
    path = os.path.join(UPLOAD_FOLDER, f"{sid}_{int(datetime.utcnow().timestamp())}_{name}")
    with open(path, "wb") as out:
        out.write(raw)
    row = Resume(
        student_id=sid,
        file_path=path,
        raw_text=text[:20000],
        extracted_name=parsed.get("extracted_name"),
        extracted_email=parsed.get("extracted_email"),
        extracted_phone=parsed.get("extracted_phone"),
        extracted_skills=parsed.get("extracted_skills"),
        extracted_projects=parsed.get("extracted_projects"),
        extracted_education=parsed.get("extracted_education"),
        extracted_links=parsed.get("extracted_links"),
    )
    db.session.add(row)
    db.session.commit()
    return jsonify({"ok": True, "resume_id": row.id, "parsed": parsed})


@app.route("/api/resume/parsed/<int:student_id>", methods=["GET"])
def resume_parsed(student_id):
    sid = auth_student_id()
    if not sid or sid != student_id:
        return jsonify({"error": "Unauthorized"}), 401
    r = Resume.query.filter_by(student_id=student_id).order_by(Resume.created_at.desc()).first()
    if not r:
        return jsonify({"resume": None})
    return jsonify(
        {
            "resume": {
                "id": r.id,
                "extracted_name": r.extracted_name,
                "extracted_email": r.extracted_email,
                "extracted_phone": r.extracted_phone,
                "extracted_skills": r.extracted_skills,
                "extracted_projects": r.extracted_projects,
                "extracted_education": r.extracted_education,
                "extracted_links": r.extracted_links,
                "ats_score": r.ats_score,
            }
        }
    )


@app.route("/api/career/predict", methods=["POST"])
def career_predict():
    sid = auth_student_id()
    if not sid:
        return jsonify({"error": "Unauthorized"}), 401
    s = Student.query.get(sid)
    if not s:
        return jsonify({"error": "Not found"}), 404
    profile = student_to_profile(s)
    apt = latest_aptitude_dict(sid)
    recs = hybrid_career_recommendations(profile, apt, top_n=5)
    CareerPredictionRow.query.filter_by(student_id=sid).delete()
    for i, item in enumerate(recs, start=1):
        db.session.add(
            CareerPredictionRow(
                student_id=sid,
                role_name=item["role_name"],
                match_percentage=item["match_percentage"],
                rank=i,
            )
        )
    db.session.commit()
    return jsonify({"recommendations": recs})


@app.route("/api/skill-gap/analyze", methods=["POST"])
def skill_gap():
    sid = auth_student_id()
    if not sid:
        return jsonify({"error": "Unauthorized"}), 401
    s = Student.query.get(sid)
    data = request.get_json(force=True, silent=True) or {}
    role_name = data.get("role_name")
    if not role_name:
        return jsonify({"error": "role_name required"}), 400
    profile = student_to_profile(s)
    result = skill_gap_analysis(profile, role_name)
    if "error" in result:
        return jsonify(result), 400
    SkillGapRow.query.filter_by(student_id=sid, role_name=role_name).delete()
    db.session.add(
        SkillGapRow(
            student_id=sid,
            role_name=role_name,
            existing_skills=", ".join(result.get("existing_skills_matched", [])),
            missing_skills=", ".join(result.get("missing_skills", [])),
            readiness_score=result.get("readiness_score"),
        )
    )
    db.session.commit()
    return jsonify(result)


@app.route("/api/roadmap", methods=["POST"])
def roadmap():
    data = request.get_json(force=True, silent=True) or {}
    role_name = data.get("role_name")
    level = data.get("level", "placement")
    if not role_name:
        return jsonify({"error": "role_name required"}), 400
    return jsonify(learning_roadmap(role_name, level))


@app.route("/api/ats/score", methods=["POST"])
def ats():
    sid = auth_student_id()
    if not sid:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json(force=True, silent=True) or {}
    role_name = data.get("role_name")
    if not role_name:
        return jsonify({"error": "role_name required"}), 400
    s = Student.query.get(sid)
    r = Resume.query.filter_by(student_id=sid).order_by(Resume.created_at.desc()).first()
    text = (r.raw_text if r else "") or ""
    skills = (s.skills or "") + " " + (r.extracted_skills if r else "")
    result = ats_score(text, skills, role_name)
    if r and "ats_score" in result:
        r.ats_score = result["ats_score"]
        db.session.commit()
    return jsonify(result)


@app.route("/api/job-match", methods=["POST"])
def job_match():
    sid = auth_student_id()
    if not sid:
        return jsonify({"error": "Unauthorized"}), 401
    s = Student.query.get(sid)
    r = Resume.query.filter_by(student_id=sid).order_by(Resume.created_at.desc()).first()
    resume_text = r.raw_text if r else ""
    matches = job_role_matches(student_to_profile(s), resume_text)
    return jsonify({"matches": matches})


@app.route("/api/courses/<path:role>", methods=["GET"])
def courses(role):
    pack = get_courses_projects_interview(role)
    return jsonify({"courses": pack.get("courses", [])})


@app.route("/api/projects/<path:role>", methods=["GET"])
def projects(role):
    pack = get_courses_projects_interview(role)
    return jsonify({"projects": pack.get("projects", [])})


@app.route("/api/interview/<path:role>", methods=["GET"])
def interview(role):
    pack = get_courses_projects_interview(role)
    return jsonify({"topics": pack.get("interview_topics", [])})


@app.route("/api/progress/update", methods=["POST"])
def progress_update():
    sid = auth_student_id()
    if not sid:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json(force=True, silent=True) or {}
    p = ProgressTracking.query.filter_by(student_id=sid).first()
    if not p:
        p = ProgressTracking(student_id=sid)
        db.session.add(p)
    if "completed_skills" in data:
        p.completed_skills = data["completed_skills"]
    if "completed_courses" in data:
        p.completed_courses = data["completed_courses"]
    if "completed_projects" in data:
        p.completed_projects = data["completed_projects"]
    if "readiness_score" in data:
        try:
            p.readiness_score = float(data["readiness_score"])
        except (TypeError, ValueError):
            pass
    db.session.commit()
    return jsonify({"ok": True})


@app.route("/api/progress/<int:student_id>", methods=["GET"])
def progress_get(student_id):
    sid = auth_student_id()
    if not sid or sid != student_id:
        return jsonify({"error": "Unauthorized"}), 401
    p = ProgressTracking.query.filter_by(student_id=student_id).first()
    if not p:
        return jsonify(
            {
                "progress": {
                    "completed_skills": "",
                    "completed_courses": "",
                    "completed_projects": "",
                    "readiness_score": None,
                }
            }
        )
    return jsonify(
        {
            "progress": {
                "completed_skills": p.completed_skills,
                "completed_courses": p.completed_courses,
                "completed_projects": p.completed_projects,
                "readiness_score": p.readiness_score,
                "updated_at": p.updated_at.isoformat() if p.updated_at else None,
            }
        }
    )


@app.route("/api/trends", methods=["GET"])
def trends():
    return jsonify({"trends": career_trends()})


@app.route("/api/roles", methods=["GET"])
def roles_list():
    return jsonify({"roles": [r["role_name"] for r in load_roles()["careers"]]})


@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json(force=True, silent=True) or {}
    q = (data.get("message") or "").lower()
    if not q:
        return jsonify({"reply": "Ask me about careers, skills, resumes, or roadmaps."})
    if "data analyst" in q and ("skill" in q or "need" in q):
        return jsonify(
            {
                "reply": "Data Analysts typically need SQL, Excel, visualization (Power BI/Tableau), statistics, and Python/Pandas. "
                "Build dashboards and cleaning projects to demonstrate impact."
            }
        )
    if "cloud" in q and ("engineer" in q or "become" in q):
        return jsonify(
            {
                "reply": "Start with a cloud provider (AWS/Azure), learn networking & IAM, then containers and IaC (Terraform). "
                "Certifications plus a multi-tier deployment project help a lot."
            }
        )
    if "resume" in q or "ats" in q:
        return jsonify(
            {
                "reply": "Use clear section headers, quantify impact, mirror keywords from your target role, and keep formatting simple for ATS parsers."
            }
        )
    if "best" in q and "career" in q:
        return jsonify(
            {
                "reply": "Complete your profile and aptitude test, then run Career Prediction. The hybrid model blends ML with your skills and interests."
            }
        )
    if "roadmap" in q or "path" in q:
        return jsonify(
            {
                "reply": "Pick a recommended role and open the Learning Roadmap page for staged steps and a weekly plan."
            }
        )
    return jsonify(
        {
            "reply": "I can help with role fit, skill gaps, resumes, and roadmaps. Try: 'What skills for data analyst?' or 'How to improve my resume?'"
        }
    )


@app.route("/api/admin/summary", methods=["GET"])
def admin_summary():
    # Lightweight demo analytics (protect in production)
    key = request.headers.get("X-Admin-Key", "")
    if key != os.environ.get("ADMIN_KEY", "demo-admin"):
        return jsonify({"error": "Forbidden"}), 403
    n_students = Student.query.count()
    top = (
        db.session.query(CareerPredictionRow.role_name, func.count(CareerPredictionRow.id))
        .group_by(CareerPredictionRow.role_name)
        .all()
    )
    top_sorted = sorted(top, key=lambda x: -x[1])[:8]
    return jsonify(
        {
            "students": n_students,
            "predictions_by_role": [{"role": a, "count": b} for a, b in top_sorted],
        }
    )


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
