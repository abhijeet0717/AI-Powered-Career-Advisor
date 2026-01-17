import axios from "axios";

const API_BASE_URL = "https://ai-powered-career-advisor.onrender.com";
// "http://127.0.0.1:8000/"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiService = {
  // Health check
  checkHealth: () => api.get("/health"),

  // Get available fields
  getAvailableFields: () => api.get("/available-fields"),

  // Get mentor fields
  getMentorFields: () => api.get("/mentor-fields"),

  // Skill recommendations
  getSkillRecommendations: (fieldOfInterest, userSkills) =>
    api.post("/recommend-skills", {
      field_of_interest: fieldOfInterest,
      user_skills: userSkills,
    }),

  // Mentor matching
  matchMentors: (fieldOfInterest, topN = 3) =>
    api.post("/match-mentors", {
      field_of_interest: fieldOfInterest,
      top_n: topN,
    }),

  // Placement prediction
  predictPlacement: (data) =>
    api.post("/predict-placement", {
      coding_profile_rating: parseFloat(data.coding),
      grades: parseFloat(data.grades),
      major_projects: parseInt(data.majorProjects, 10),
      mini_projects: parseInt(data.miniProjects, 10),
      internship: parseInt(data.internship, 10),
      hackathon: parseInt(data.hackathon, 10),
      communication_skill_rating: parseFloat(data.communication),
      workshops_certifications: parseInt(data.certifications, 10),
      attendance: parseFloat(data.attendance),
      field: data.field,
      skills: data.skills,
    }),

  // Generate AI roadmap
  generateRoadmap: (field, currentSkills) =>
    api.post("/generate-roadmap", {
      field: field,
      current_skills: currentSkills,
    }),
};

export default api;