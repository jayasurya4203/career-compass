from flask import Blueprint, request, jsonify
import pickle
import os
import numpy as np
from ..models.career_data import AptitudeScore, CareerPrediction, Recommendation
from ..utils.helpers import token_required
from .. import db

career_bp = Blueprint('career', __name__)

# Load model and encoder
MODEL_PATH = os.path.join(os.getcwd(), 'data/career_model.pkl')
LE_PATH = os.path.join(os.getcwd(), 'data/label_encoder.pkl')

def load_ml_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(LE_PATH):
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        with open(LE_PATH, 'rb') as f:
            le = pickle.load(f)
        return model, le
    return None, None

@career_bp.route('/predict', methods=['POST'])
@token_required
def predict_career(user_id):
    data = request.get_json()
    # Expecting: logical, verbal, quantitative, technical, coding, database, networking, security, ui_ux
    features = [
        data.get('logical', 0),
        data.get('verbal', 0),
        data.get('quantitative', 0),
        data.get('technical', 0),
        data.get('coding', 0),
        data.get('database', 0),
        data.get('networking', 0),
        data.get('security', 0),
        data.get('ui_ux', 0)
    ]

    # Save scores
    new_score = AptitudeScore(
        user_id=user_id,
        logical=features[0],
        verbal=features[1],
        quantitative=features[2],
        technical=features[3],
        overall_score=sum(features[:4])/4
    )
    db.session.add(new_score)
    db.session.commit()

    model, le = load_ml_model()
    if not model:
        return jsonify({"error": "ML Model not trained yet"}), 500

    prediction_idx = model.predict([features])[0]
    predicted_role = le.inverse_transform([prediction_idx])[0]
    
    # Simple match percentage (mock logic)
    match_pct = float(np.max(model.predict_proba([features])) * 100)

    # Save prediction
    new_prediction = CareerPrediction(
        user_id=user_id,
        predicted_role=predicted_role,
        match_percentage=match_pct
    )
    db.session.add(new_prediction)
    db.session.commit()

    return jsonify({
        "predicted_role": predicted_role,
        "match_percentage": match_pct
    }), 200

@career_bp.route('/recommendations', methods=['GET'])
@token_required
def get_recommendations(user_id):
    # Get latest prediction
    last_prediction = CareerPrediction.query.filter_by(user_id=user_id).order_by(CareerPrediction.timestamp.desc()).first()
    
    if not last_prediction:
        return jsonify({"message": "Take the career test first"}), 400

    role = last_prediction.predicted_role
    
    # Mock recommendations based on role
    # In a real app, these would come from a database or Gemini API
    recs = [
        {"type": "course", "title": f"Advanced {role} Roadmap", "description": "Master the core concepts.", "link": "#"},
        {"type": "project", "title": f"Build a {role} Portfolio", "description": "Real-world project implementation.", "link": "#"},
        {"type": "roadmap", "title": f"The Ultimate {role} Guide", "description": "Step by step learning path.", "link": "#"}
    ]

    return jsonify(recs), 200
