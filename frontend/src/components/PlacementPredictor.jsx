import React, { useState, useEffect } from 'react';
import { Briefcase, Zap, Target, BarChart3, Lightbulb } from 'lucide-react';
import { apiService } from '../services/api';

const PlacementPredictor = () => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({
    coding: 1500,
    grades: 8.0,
    majorProjects: 2,
    miniProjects: 3,
    internship: 1,
    hackathon: 1,
    communication: 7.5,
    certifications: 2,
    attendance: 85,
    field: '',
    skills: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const response = await apiService.getAvailableFields();
      setFields(response.data.fields);
      setFormData(prev => ({ ...prev, field: response.data.fields[0] || '' }));
    } catch (err) {
      setError('Failed to load fields');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePredict = async () => {
    if (!formData.field) return;
    
    setLoading(true);
    setError('');
    
    try {
      const skillsList = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      const dataToSend = {
        ...formData,
        skills: skillsList
      };
      
      const response = await apiService.predictPlacement(dataToSend);
      setPrediction(response.data);
    } catch (err) {
      setError('Failed to predict placement');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    const tierColors = {
      'Tier 1': '#48bb78',
      'Tier 2': '#ed8936',
      'Tier 3': '#e53e3e'
    };
    return tierColors[tier] || '#718096';
  };

  const formatConfidence = (score) => {
    return (score * 100).toFixed(1);
  };

  return (
    <div className="placement-predictor">
      <h2><Briefcase size={32} className="inline-icon" /> Placement Tier Prediction</h2>
      <p className="subtitle">Get AI-powered insights into your placement prospects</p>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Field of Interest:</label>
          <select 
            value={formData.field} 
            onChange={(e) => handleInputChange('field', e.target.value)}
            className="form-control"
          >
            {fields.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Your Skills (comma-separated):</label>
          <textarea
            value={formData.skills}
            onChange={(e) => handleInputChange('skills', e.target.value)}
            placeholder="e.g., Python, JavaScript, React, SQL..."
            className="form-control"
            rows="2"
          />
        </div>

        <div className="form-group">
          <label>Coding Profile Rating: {formData.coding}</label>
          <input
            type="range"
            min="1000"
            max="2050"
            value={formData.coding}
            onChange={(e) => handleInputChange('coding', parseInt(e.target.value))}
            className="slider"
          />
          <div className="range-labels">
            <span>1000</span>
            <span>2050</span>
          </div>
        </div>

        <div className="form-group">
          <label>Grades (0–10): {formData.grades}</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={formData.grades}
            onChange={(e) => handleInputChange('grades', parseFloat(e.target.value))}
            className="slider"
          />
          <div className="range-labels">
            <span>0</span>
            <span>10</span>
          </div>
        </div>

        <div className="form-group">
          <label>Major Projects: {formData.majorProjects}</label>
          <input
            type="range"
            min="0"
            max="5"
            value={formData.majorProjects}
            onChange={(e) => handleInputChange('majorProjects', parseInt(e.target.value))}
            className="slider"
          />
          <div className="range-labels">
            <span>0</span>
            <span>5</span>
          </div>
        </div>

        <div className="form-group">
          <label>Mini Projects: {formData.miniProjects}</label>
          <input
            type="range"
            min="0"
            max="10"
            value={formData.miniProjects}
            onChange={(e) => handleInputChange('miniProjects', parseInt(e.target.value))}
            className="slider"
          />
          <div className="range-labels">
            <span>0</span>
            <span>10</span>
          </div>
        </div>

        <div className="form-group">
          <label>Internships: {formData.internship}</label>
          <input
            type="range"
            min="0"
            max="3"
            value={formData.internship}
            onChange={(e) => handleInputChange('internship', parseInt(e.target.value))}
            className="slider"
          />
          <div className="range-labels">
            <span>0</span>
            <span>3</span>
          </div>
        </div>

        <div className="form-group">
          <label>Hackathon Participation: {formData.hackathon}</label>
          <input
            type="range"
            min="0"
            max="5"
            value={formData.hackathon}
            onChange={(e) => handleInputChange('hackathon', parseInt(e.target.value))}
            className="slider"
          />
          <div className="range-labels">
            <span>0</span>
            <span>5</span>
          </div>
        </div>

        <div className="form-group">
          <label>Communication Rating: {formData.communication}</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={formData.communication}
            onChange={(e) => handleInputChange('communication', parseFloat(e.target.value))}
            className="slider"
          />
          <div className="range-labels">
            <span>0</span>
            <span>10</span>
          </div>
        </div>

        <div className="form-group">
          <label>Workshops/Certifications: {formData.certifications}</label>
          <input
            type="range"
            min="0"
            max="10"
            value={formData.certifications}
            onChange={(e) => handleInputChange('certifications', parseInt(e.target.value))}
            className="slider"
          />
          <div className="range-labels">
            <span>0</span>
            <span>10</span>
          </div>
        </div>

        <div className="form-group">
          <label>Attendance (%): {formData.attendance}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.attendance}
            onChange={(e) => handleInputChange('attendance', parseInt(e.target.value))}
            className="slider"
          />
          <div className="range-labels">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handlePredict}
        disabled={loading || !formData.field}
        className="btn-primary"
      >
        {loading ? 'Predicting...' : <><Zap size={16} /> Predict My Placement Tier</>}
      </button>

      {error && <div className="error">{error}</div>}

      {prediction && (
        <div className="prediction-result">
          <div className="prediction-header">
            <h3><Target size={24} /> Prediction Result</h3>
            <div 
              className="predicted-tier"
              style={{ backgroundColor: getTierColor(prediction.predicted_tier) }}
            >
              {prediction.predicted_tier}
            </div>
          </div>

          <div className="confidence-scores">
            <h4><BarChart3 size={20} /> Confidence Scores</h4>
            <div className="scores-grid">
              {Object.entries(prediction.confidence_scores).map(([tier, score]) => (
                <div key={tier} className="score-item">
                  <span className="tier-name">{tier}</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ 
                        width: `${formatConfidence(score)}%`,
                        backgroundColor: getTierColor(tier)
                      }}
                    ></div>
                  </div>
                  <span className="score-value">{formatConfidence(score)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="improvement-tips">
            <h4><Lightbulb size={20} /> Improvement Tips</h4>
            <ul>
              <li>Focus on building more projects to showcase your skills</li>
              <li>Participate in hackathons and coding competitions</li>
              <li>Improve your coding profile rating through consistent practice</li>
              <li>Gain relevant work experience through internships</li>
              <li>Enhance communication skills through practice and workshops</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementPredictor;
