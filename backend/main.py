from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Set
import pandas as pd
import numpy as np
import joblib
import os
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(title="AI Career Advisor API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the base directory
BASE_DIR = Path(__file__).parent.parent

# Load ML models and data on startup
try:
    clf = joblib.load(BASE_DIR / "placement_tier_classifier.pkl")
    scaler = joblib.load(BASE_DIR / "placement_scaler.pkl")
    mentor_df = pd.read_csv(BASE_DIR / "Enhanced_Professor_Database.csv")
except Exception as e:
    print(f"Warning: Could not load models or data: {e}")
    clf = None
    scaler = None
    mentor_df = None

# Skill mapping for tech recommendations
skill_map = {
    "Data Science": {"Python", "Pandas", "NumPy", "Scikit-learn", "SQL", "Matplotlib"},
    "Web Development": {"HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"},
    "Cybersecurity": {"Networking", "Linux", "Cryptography", "Ethical Hacking", "Python"},
    "Machine Learning": {"Python", "Scikit-learn", "TensorFlow", "Pandas", "NumPy", "Matplotlib"},
    "AI/ML": {"Python", "Scikit-learn", "TensorFlow", "Pandas", "NumPy", "Matplotlib"},
    "Mobile Development": {"Kotlin", "Java", "Flutter", "Dart", "React Native"}
}

# Pydantic models for request/response
class SkillRecommendationRequest(BaseModel):
    field_of_interest: str
    user_skills: List[str]

class SkillRecommendationResponse(BaseModel):
    field: str
    match_score: int
    skills_you_have: List[str]
    skills_to_learn: List[str]

class MentorMatchingRequest(BaseModel):
    field_of_interest: str
    top_n: Optional[int] = 3

class Mentor(BaseModel):
    professor_code: str
    professor_name: str
    field_of_expertise: str
    years_of_experience: int
    feedback_rating: float
    past_mentee_performance: float
    behavior_rating: float
    contact_email: str
    final_score: float

class PlacementPredictionRequest(BaseModel):
    coding_profile_rating: float
    grades: float
    major_projects: int
    mini_projects: int
    internship: int
    hackathon: int
    communication_skill_rating: float
    workshops_certifications: int
    attendance: float
    field: str
    skills: List[str]

class PlacementPredictionResponse(BaseModel):
    predicted_tier: str
    confidence_scores: dict

@app.get("/")
async def root():
    return {"message": "AI Career Advisor API is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": clf is not None and scaler is not None,
        "mentor_data_loaded": mentor_df is not None
    }

@app.get("/available-fields")
async def get_available_fields():
    """Get list of available fields for skill recommendations"""
    return {"fields": list(skill_map.keys())}

def recommend_skills(field_of_interest: str, user_skills: set) -> dict:
    """Core skill recommendation logic"""
    required_skills = skill_map.get(field_of_interest, set())
    
    matched_skills = user_skills & required_skills
    missing_skills = required_skills - user_skills
    total_required = len(required_skills)
    match_score = round(len(matched_skills) / total_required * 100) if total_required else 0
    
    return {
        "field": field_of_interest,
        "match_score": match_score,
        "skills_you_have": sorted(matched_skills),
        "skills_to_learn": sorted(missing_skills)
    }

@app.post("/recommend-skills", response_model=SkillRecommendationResponse)
async def get_skill_recommendations(request: SkillRecommendationRequest):
    """Get skill recommendations based on field of interest and current skills"""
    try:
        user_skills_set = set(request.user_skills)
        result = recommend_skills(request.field_of_interest, user_skills_set)
        
        return SkillRecommendationResponse(
            field=result["field"],
            match_score=result["match_score"],
            skills_you_have=result["skills_you_have"],
            skills_to_learn=result["skills_to_learn"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in skill recommendation: {str(e)}")

def match_top_mentors(field_interest: str, top_n: int = 3):
    """Core mentor matching logic"""
    if mentor_df is None:
        raise HTTPException(status_code=500, detail="Mentor data not available")
    
    relevant_profs = mentor_df[mentor_df['Field_of_Expertise'].str.lower() == field_interest.lower()].copy()
    
    if relevant_profs.empty:
        return []
    
    # Normalize ratings
    for col in ['Feedback_Rating', 'Years_of_Experience', 'Past_Mentee_Performance', 'Behavior_Rating']:
        min_val = relevant_profs[col].min()
        max_val = relevant_profs[col].max()
        relevant_profs[col + '_Norm'] = (relevant_profs[col] - min_val) / (max_val - min_val + 1e-6)
    
    # Calculate final score
    relevant_profs['Final_Score'] = (
        0.4 * relevant_profs['Feedback_Rating_Norm'] +
        0.3 * relevant_profs['Years_of_Experience_Norm'] +
        0.2 * relevant_profs['Past_Mentee_Performance_Norm'] +
        0.1 * relevant_profs['Behavior_Rating_Norm']
    )
    
    top_matches = relevant_profs.sort_values(by='Final_Score', ascending=False).head(top_n)
    
    return top_matches[[
        'Professor_Code', 'professor_name', 'Field_of_Expertise',
        'Years_of_Experience', 'Feedback_Rating', 'Past_Mentee_Performance',
        'Behavior_Rating', 'Contact_Email', 'Final_Score'
    ]].to_dict('records')

@app.post("/match-mentors")
async def get_mentor_matches(request: MentorMatchingRequest):
    """Get top mentor matches based on field of interest"""
    try:
        mentors_data = match_top_mentors(request.field_of_interest, request.top_n)
        
        mentors = []
        for mentor_data in mentors_data:
            mentor = Mentor(
                professor_code=mentor_data['Professor_Code'],
                professor_name=mentor_data['professor_name'],
                field_of_expertise=mentor_data['Field_of_Expertise'],
                years_of_experience=int(mentor_data['Years_of_Experience']),
                feedback_rating=float(mentor_data['Feedback_Rating']),
                past_mentee_performance=float(mentor_data['Past_Mentee_Performance']),
                behavior_rating=float(mentor_data['Behavior_Rating']),
                contact_email=mentor_data['Contact_Email'],
                final_score=float(mentor_data['Final_Score'])
            )
            mentors.append(mentor)
        
        return {"mentors": mentors}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in mentor matching: {str(e)}")

@app.post("/predict-placement", response_model=PlacementPredictionResponse)
async def predict_placement_tier(request: PlacementPredictionRequest):
    """Predict placement tier based on student data"""
    try:
        if clf is None or scaler is None:
            raise HTTPException(status_code=500, detail="Placement prediction models not available")
        
        # Calculate skill match score
        user_skills_set = set(request.skills)
        skill_result = recommend_skills(request.field, user_skills_set)
        skill_match_score = skill_result["match_score"]
        
        # Prepare features for prediction
        features = np.array([[
            request.coding_profile_rating,
            request.grades,
            request.major_projects,
            request.mini_projects,
            request.internship,
            request.hackathon,
            skill_match_score,
            request.communication_skill_rating,
            request.workshops_certifications,
            request.attendance
        ]])
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction = clf.predict(features_scaled)[0]
        prediction_proba = clf.predict_proba(features_scaled)[0]
        
        # Get class labels
        classes = clf.classes_
        confidence_scores = {classes[i]: float(prediction_proba[i]) for i in range(len(classes))}
        
        return PlacementPredictionResponse(
            predicted_tier=prediction,
            confidence_scores=confidence_scores
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in placement prediction: {str(e)}")

@app.get("/mentor-fields")
async def get_mentor_fields():
    """Get list of available mentor fields"""
    if mentor_df is None:
        raise HTTPException(status_code=500, detail="Mentor data not available")
    
    fields = mentor_df['Field_of_Expertise'].unique().tolist()
    return {"fields": fields}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
