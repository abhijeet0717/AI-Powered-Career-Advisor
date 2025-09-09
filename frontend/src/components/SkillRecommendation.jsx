import React, { useState, useEffect } from 'react';
import { Rocket, Search, CheckCircle, BookOpen, PartyPopper, Lightbulb } from 'lucide-react';
import { apiService } from '../services/api';

const SkillRecommendation = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const response = await apiService.getAvailableFields();
      setFields(response.data.fields);
      setSelectedField(response.data.fields[0] || '');
    } catch (err) {
      setError('Failed to load fields');
    }
  };

  const handleGetRecommendations = async () => {
    if (!selectedField) return;
    
    setLoading(true);
    setError('');
    
    try {
      const skillsList = userSkills.split(',').map(skill => skill.trim()).filter(skill => skill);
      const response = await apiService.getSkillRecommendations(selectedField, skillsList);
      setRecommendations(response.data);
    } catch (err) {
      setError('Failed to get skill recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return '#48bb78';
    if (score >= 60) return '#ed8936';
    return '#e53e3e';
  };

  return (
    <div className="skill-recommendation">
      <h2><Rocket size={32} className="inline-icon" /> Skill Gap Analysis & Recommendations</h2>
      <p className="subtitle">Discover what skills you need to excel in your chosen field</p>
      
      <div className="form-group">
        <label>Select your Field of Interest:</label>
        <select 
          value={selectedField} 
          onChange={(e) => setSelectedField(e.target.value)}
          className="form-control"
        >
          {fields.map(field => (
            <option key={field} value={field}>{field}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Your Current Skills (comma-separated):</label>
        <textarea
          value={userSkills}
          onChange={(e) => setUserSkills(e.target.value)}
          placeholder="e.g., Python, JavaScript, React, SQL, Machine Learning..."
          className="form-control"
          rows="3"
        />
        <small className="help-text">Enter your skills separated by commas</small>
      </div>

      <button 
        onClick={handleGetRecommendations}
        disabled={loading || !selectedField}
        className="btn-primary"
      >
        {loading ? 'Analyzing...' : <><Search size={16} /> Get Skill Recommendations</>}
      </button>

      {error && <div className="error">{error}</div>}

      {recommendations && (
        <div className="recommendations-result">
          <div className="match-score-card">
            <h3>Field Match Score</h3>
            <div 
              className="score-circle"
              style={{ backgroundColor: getMatchScoreColor(recommendations.match_score) }}
            >
              {recommendations.match_score}%
            </div>
          </div>

          <div className="skills-grid">
            <div className="skills-section skills-have">
              <h4><CheckCircle size={20} /> Skills You Have ({recommendations.skills_you_have.length})</h4>
              <div className="skills-list">
                {recommendations.skills_you_have.map((skill, index) => (
                  <span key={index} className="skill-tag skill-have">{skill}</span>
                ))}
                {recommendations.skills_you_have.length === 0 && (
                  <p className="no-skills">No matching skills found</p>
                )}
              </div>
            </div>

            <div className="skills-section skills-need">
              <h4><BookOpen size={20} /> Skills to Learn ({recommendations.skills_to_learn.length})</h4>
              <div className="skills-list">
                {recommendations.skills_to_learn.map((skill, index) => (
                  <span key={index} className="skill-tag skill-need">{skill}</span>
                ))}
                {recommendations.skills_to_learn.length === 0 && (
                  <p className="congratulations"><PartyPopper size={16} /> You have all required skills!</p>
                )}
              </div>
            </div>
          </div>

          {recommendations.skills_to_learn.length > 0 && (
            <div className="learning-tips">
              <h4><Lightbulb size={20} /> Learning Tips</h4>
              <ul>
                <li>Start with the most fundamental skills first</li>
                <li>Practice with hands-on projects</li>
                <li>Join online communities and forums</li>
                <li>Consider taking structured courses or bootcamps</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillRecommendation;
