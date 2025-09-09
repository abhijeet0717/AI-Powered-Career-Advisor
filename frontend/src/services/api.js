import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Health check
  checkHealth: () => api.get('/health'),
  
  // Get available fields for skill recommendations
  getAvailableFields: () => api.get('/available-fields'),
  
  // Get mentor fields
  getMentorFields: () => api.get('/mentor-fields'),
  
  // Get skill recommendations
  getSkillRecommendations: (fieldOfInterest, userSkills) => 
    api.post('/recommend-skills', {
      field_of_interest: fieldOfInterest,
      user_skills: userSkills
    }),
  
  // Match mentors
  matchMentors: (fieldOfInterest, topN = 3) => 
    api.post('/match-mentors', {
      field_of_interest: fieldOfInterest,
      top_n: topN
    }),
  
  // Predict placement tier
  predictPlacement: (data) => api.post('/predict-placement', {
    coding_profile_rating: parseFloat(data.coding),
    grades: parseFloat(data.grades),
    major_projects: parseInt(data.majorProjects),
    mini_projects: parseInt(data.miniProjects),
    internship: parseInt(data.internship),
    hackathon: parseInt(data.hackathon),
    communication_skill_rating: parseFloat(data.communication),
    workshops_certifications: parseInt(data.certifications),
    attendance: parseFloat(data.attendance),
    field: data.field,
    skills: data.skills
  })
};

export default api;
