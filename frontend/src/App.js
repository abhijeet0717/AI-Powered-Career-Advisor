import React, { useState } from 'react';
import { Target, Briefcase, GraduationCap, Lightbulb } from 'lucide-react';
import SkillRecommendation from './components/SkillRecommendation';
import MentorMatching from './components/MentorMatching';
import PlacementPredictor from './components/PlacementPredictor';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('placement');

  return (
    <div className="App">
      <header className="app-header">
        <h1><Target className="header-icon" /> AI-Powered Career Advisor</h1>
        <p>Your personalized guide to career success</p>
      </header>
      
      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'placement' ? 'active' : ''}`}
          onClick={() => setActiveTab('placement')}
        >
          <Briefcase size={20} /> Placement Predictor
        </button>  

        <button 
          className={`tab-button ${activeTab === 'mentor' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentor')}
        >
          <GraduationCap size={20} /> Mentor Matching
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <Lightbulb size={20} /> Skill Recommendations
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'skills' && <SkillRecommendation />}
        {activeTab === 'mentor' && <MentorMatching />}
        {activeTab === 'placement' && <PlacementPredictor />}
      </main>
    </div>
  );
}

export default App;
