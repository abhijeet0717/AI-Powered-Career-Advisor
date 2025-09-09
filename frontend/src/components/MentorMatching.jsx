import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, Star, BookOpen, Clock, Target, Handshake, Mail } from 'lucide-react';
import { apiService } from '../services/api';

const MentorMatching = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [topN, setTopN] = useState(3);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const response = await apiService.getMentorFields();
      setFields(response.data.fields);
      setSelectedField(response.data.fields[0] || '');
    } catch (err) {
      setError('Failed to load mentor fields');
    }
  };

  const handleMatchMentors = async () => {
    if (!selectedField) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.matchMentors(selectedField, topN);
      setMentors(response.data.mentors);
    } catch (err) {
      setError('Failed to match mentors');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#48bb78';
    if (score >= 0.6) return '#ed8936';
    return '#e53e3e';
  };

  const formatScore = (score) => {
    return (score * 100).toFixed(1);
  };

  return (
    <div className="mentor-matching">
      <h2><GraduationCap size={32} className="inline-icon" /> Find Your Perfect Mentor</h2>
      <p className="subtitle">Connect with experienced mentors in your field of interest</p>
      
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
        <label>Number of Mentors: {topN}</label>
        <input
          type="range"
          min="1"
          max="10"
          value={topN}
          onChange={(e) => setTopN(parseInt(e.target.value))}
          className="slider"
        />
        <div className="range-labels">
          <span>1</span>
          <span>10</span>
        </div>
      </div>

      <button 
        onClick={handleMatchMentors}
        disabled={loading || !selectedField}
        className="btn-primary"
      >
        {loading ? 'Finding Mentors...' : <><Search size={16} /> Find Mentors</>}
      </button>

      {error && <div className="error">{error}</div>}

      {mentors.length > 0 && (
        <div className="mentors-result">
          <h3><Star size={24} /> Top {mentors.length} Mentor Matches</h3>
          
          <div className="mentors-grid">
            {mentors.map((mentor, index) => (
              <div key={index} className="mentor-card">
                <div className="mentor-header">
                  <h4>{mentor.professor_name}</h4>
                  <span className="mentor-code">{mentor.professor_code}</span>
                  <div 
                    className="match-score"
                    style={{ backgroundColor: getScoreColor(mentor.final_score) }}
                  >
                    {formatScore(mentor.final_score)}%
                  </div>
                </div>
                
                <div className="mentor-details">
                  <div className="detail-row">
                    <span className="label"><BookOpen size={16} /> Field:</span>
                    <span>{mentor.field_of_expertise}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label"><Clock size={16} /> Experience:</span>
                    <span>{mentor.years_of_experience} years</span>
                  </div>
                  <div className="detail-row">
                    <span className="label"><Star size={16} /> Feedback:</span>
                    <span>{mentor.feedback_rating}/10</span>
                  </div>
                  <div className="detail-row">
                    <span className="label"><Target size={16} /> Mentee Performance:</span>
                    <span>{mentor.past_mentee_performance}/10</span>
                  </div>
                  <div className="detail-row">
                    <span className="label"><Handshake size={16} /> Behavior:</span>
                    <span>{mentor.behavior_rating}/10</span>
                  </div>
                  <div className="detail-row">
                    <span className="label"><Mail size={16} /> Contact:</span>
                    <span className="contact-email">{mentor.contact_email}</span>
                  </div>
                </div>
                
                <button 
                  className="btn-secondary"
                  onClick={() => window.open(`mailto:${mentor.contact_email}?subject=Mentorship Inquiry&body=Hello ${mentor.professor_name}, I am interested in mentorship in ${mentor.field_of_expertise}.`)}
                >
                  <Mail size={16} /> Contact Mentor
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {mentors.length === 0 && !loading && !error && selectedField && (
        <div className="no-results">
          <p>No mentors found for the selected field. Try a different field.</p>
        </div>
      )}
    </div>
  );
};

export default MentorMatching;
