import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
MODEL_PATH = os.path.join(BASE_DIR, "ml_artifacts", "career_rf.joblib")
DATASET_PATH = os.path.join(BASE_DIR, "data", "training_dataset.csv")
DB_PATH = os.path.join(BASE_DIR, "career_compass.db")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "ml_artifacts"), exist_ok=True)

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-change-me-career-compass")
JWT_ALG = "HS256"


class Config:
    SECRET_KEY = SECRET_KEY
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{DB_PATH}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
