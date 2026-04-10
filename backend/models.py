from datetime import datetime

from database import db


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    branch = db.Column(db.String(64))
    degree = db.Column(db.String(64))
    year = db.Column(db.String(32))
    cgpa = db.Column(db.Float)
    interests = db.Column(db.Text)
    skills = db.Column(db.Text)
    preferred_subjects = db.Column(db.Text)
    projects_done = db.Column(db.Text)
    certifications = db.Column(db.Text)
    internship_experience = db.Column(db.String(16))
    communication_score = db.Column(db.Integer)
    work_style = db.Column(db.String(64))
    career_goal = db.Column(db.String(256))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AptitudeResult(db.Model):
    __tablename__ = "aptitude_results"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    logical = db.Column(db.Integer)
    problem_solving = db.Column(db.Integer)
    creativity = db.Column(db.Integer)
    communication = db.Column(db.Integer)
    analytical = db.Column(db.Integer)
    coding = db.Column(db.Integer)
    leadership = db.Column(db.Integer)
    teamwork = db.Column(db.Integer)
    business = db.Column(db.Integer)
    design = db.Column(db.Integer)
    overall = db.Column(db.Integer)
    domain_scores = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class CareerPredictionRow(db.Model):
    __tablename__ = "career_predictions"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    role_name = db.Column(db.String(128), nullable=False)
    match_percentage = db.Column(db.Float)
    rank = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class SkillGapRow(db.Model):
    __tablename__ = "skill_gaps"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    role_name = db.Column(db.String(128), nullable=False)
    existing_skills = db.Column(db.Text)
    missing_skills = db.Column(db.Text)
    readiness_score = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    file_path = db.Column(db.String(512))
    raw_text = db.Column(db.Text)
    extracted_name = db.Column(db.String(200))
    extracted_email = db.Column(db.String(200))
    extracted_phone = db.Column(db.String(64))
    extracted_skills = db.Column(db.Text)
    extracted_projects = db.Column(db.Text)
    extracted_education = db.Column(db.Text)
    extracted_links = db.Column(db.Text)
    ats_score = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ProgressTracking(db.Model):
    __tablename__ = "progress_tracking"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), unique=True)
    completed_skills = db.Column(db.Text)
    completed_courses = db.Column(db.Text)
    completed_projects = db.Column(db.Text)
    readiness_score = db.Column(db.Float)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    quiz_type = db.Column(db.String(32), nullable=False)
    score_pct = db.Column(db.Float)
    correct = db.Column(db.Integer)
    total = db.Column(db.Integer)
    detail_json = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
