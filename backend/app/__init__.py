import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')

    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    CORS(app)
    db.init_app(app)

    # Register Blueprints
    from .routes.auth import auth_bp
    from .routes.profile import profile_bp
    from .routes.career import career_bp
    from .routes.resume import resume_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(career_bp, url_prefix='/api/career')
    app.register_blueprint(resume_bp, url_prefix='/api/resume')

    @app.route('/')
    def index():
        return {"message": "Career Compass API is running!"}

    return app
