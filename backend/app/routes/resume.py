from flask import Blueprint, request, jsonify
import os
import PyPDF2
from werkzeug.utils import secure_filename
from ..models.career_data import Resume
from ..utils.helpers import token_required
from .. import db

resume_bp = Blueprint('resume', __name__)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(filepath):
    text = ""
    with open(filepath, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text()
    return text

def calculate_ats_score(text, target_skills):
    # Very simple ATS score logic based on skill keywords
    # A real one would use Gemini API for deeper analysis
    found_skills = []
    score = 0
    if not target_skills:
        return 0, []
        
    for skill in target_skills.split(','):
        skill = skill.strip().lower()
        if skill in text.lower():
            found_skills.append(skill)
    
    score = (len(found_skills) / len(target_skills.split(','))) * 100
    return round(score, 2), found_skills

@resume_bp.route('/upload', methods=['POST'])
@token_required
def upload_resume(user_id):
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    target_role = request.form.get('target_role', 'Generalist')
    # Let's say we have target skills for this role
    # In real app, we would fetch role-specific skills
    target_skills = "python,sql,flask,javascript,react,ml,data,communication"

    if file and allowed_file(file.filename):
        filename = secure_filename(f"resume_{user_id}_{file.filename}")
        filepath = os.path.join(os.getcwd(), 'uploads', filename)
        file.save(filepath)

        extracted_text = extract_text_from_pdf(filepath)
        ats_score, found_skills = calculate_ats_score(extracted_text, target_skills)

        # Save to DB
        new_resume = Resume(
            user_id=user_id,
            file_path=filepath,
            extracted_text=extracted_text,
            ats_score=ats_score,
            parsed_skills=",".join(found_skills),
            job_role_match=target_role
        )
        db.session.add(new_resume)
        db.session.commit()

        return jsonify({
            "message": "Resume processed successfully",
            "ats_score": ats_score,
            "skills_found": found_skills
        }), 200

    return jsonify({"error": "Invalid file type"}), 400
