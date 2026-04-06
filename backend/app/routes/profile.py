from flask import Blueprint, request, jsonify
from ..models.user import Profile
from ..utils.helpers import token_required
from .. import db

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/get', methods=['GET'])
@token_required
def get_profile(user_id):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    
    return jsonify({
        "full_name": profile.full_name,
        "skills": profile.skills,
        "marks_10th": profile.marks_10th,
        "marks_12th": profile.marks_12th,
        "marks_degree": profile.marks_degree,
        "interests": profile.interests,
        "bio": profile.bio
    }), 200

@profile_bp.route('/update', methods=['POST'])
@token_required
def update_profile(user_id):
    data = request.get_json()
    profile = Profile.query.filter_by(user_id=user_id).first()
    
    profile.full_name = data.get('full_name', profile.full_name)
    profile.skills = data.get('skills', profile.skills)
    profile.marks_10th = data.get('marks_10th', profile.marks_10th)
    profile.marks_12th = data.get('marks_12th', profile.marks_12th)
    profile.marks_degree = data.get('marks_degree', profile.marks_degree)
    profile.interests = data.get('interests', profile.interests)
    profile.bio = data.get('bio', profile.bio)

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200
