from .. import db
from datetime import datetime

class AptitudeScore(db.Model):
    __tablename__ = 'aptitude_scores'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    logical = db.Column(db.Float, default=0)
    verbal = db.Column(db.Float, default=0)
    quantitative = db.Column(db.Float, default=0)
    technical = db.Column(db.Float, default=0)
    overall_score = db.Column(db.Float, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class CareerPrediction(db.Model):
    __tablename__ = 'career_predictions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    predicted_role = db.Column(db.String(100))
    match_percentage = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Resume(db.Model):
    __tablename__ = 'resumes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    file_path = db.Column(db.String(255))
    extracted_text = db.Column(db.Text)
    ats_score = db.Column(db.Float)
    parsed_skills = db.Column(db.Text)
    job_role_match = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Recommendation(db.Model):
    __tablename__ = 'recommendations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.Enum('course', 'project', 'roadmap'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    link = db.Column(db.String(500))
