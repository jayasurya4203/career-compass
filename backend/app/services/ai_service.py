import google.generativeai as genai
import os

class AIService:
    def __init__(self):
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel('gemini-pro')

    def get_career_advice(self, user_profile, query):
        prompt = f"""
        You are an expert Career Counselor. 
        User Profile: {user_profile}
        User Query: {query}
        
        Provide professional career advice, learning roadmaps, or interview tips based on the profile and query.
        Keep it concise and actionable.
        """
        response = self.model.generate_content(prompt)
        return response.text

    def generate_interview_questions(self, role):
        prompt = f"Generate 5 technical interview questions for a {role} position."
        response = self.model.generate_content(prompt)
        return response.text
