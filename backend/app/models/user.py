from .. import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Profile(db.Model):
    __tablename__ = 'profiles'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    full_name = db.Column(db.String(100))
    skills = db.Column(db.Text) # Comma-separated or JSON
    marks_10th = db.Column(db.Float)
    marks_12th = db.Column(db.Float)
    marks_degree = db.Column(db.Float)
    interests = db.Column(db.Text)
    bio = db.Column(db.Text)
