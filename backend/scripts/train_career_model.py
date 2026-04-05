"""
Train RandomForest career classifier and save sklearn Pipeline.
Run: python scripts/train_career_model.py
"""
import os
import sys

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, StandardScaler

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE)

from ml_utils import skills_to_1d

DATA = os.path.join(BASE, "data", "training_dataset.csv")
OUT = os.path.join(BASE, "ml_artifacts", "career_rf.joblib")


def build_pipeline():
    numeric_features = [
        "cgpa",
        "projects_count",
        "certifications_count",
        "aptitude_score",
        "logical_score",
        "analytical_score",
        "creativity_score",
        "communication_score",
        "coding_score",
    ]
    categorical_features = ["branch", "interest_domain", "favorite_subject", "preferred_work_style", "internship_experience"]

    numeric_transformer = Pipeline(
        steps=[("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]
    )
    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    text_pipeline = Pipeline(
        steps=[
            ("flat", FunctionTransformer(skills_to_1d, validate=False)),
            ("cv", CountVectorizer(token_pattern=r"(?u)\b[\w+.-]+\b", max_features=80)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
            ("skills", text_pipeline, "technical_skills"),
        ]
    )

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=18,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    return Pipeline(steps=[("preprocess", preprocessor), ("model", clf)])


def main():
    if not os.path.isfile(DATA):
        print("Dataset missing. Run: python scripts/generate_dataset.py")
        sys.exit(1)
    df = pd.read_csv(DATA)
    y = df["recommended_career"]
    X = df.drop(columns=["recommended_career"])
    pipe = build_pipeline()
    pipe.fit(X, y)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    joblib.dump(pipe, OUT)
    from sklearn.model_selection import cross_val_score

    scores = cross_val_score(pipe, X, y, cv=5, n_jobs=-1)
    print(f"Saved model to {OUT}")
    print(f"CV accuracy mean: {scores.mean():.3f} (+/- {scores.std():.3f})")


if __name__ == "__main__":
    main()
