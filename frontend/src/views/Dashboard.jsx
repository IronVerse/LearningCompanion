
import React from 'react';

import { User, BookOpen, Trophy, Zap, Star, TrendingUp, Award, CheckCircle, BarChart2, ChevronRight, X, Menu, LogOut, PlusCircle, MessageSquare, Target } from 'lucide-react';

const Dashboard = ({ user, currentSession, setCurrentView, handleLogout, setShowAddSubjectModal, showMobileSidebar, setShowMobileSidebar, currentView }) => {
  const progressPercentage = (user?.knowledgeGains ?? 0) / (user?.dailyGoal ?? 1) * 100;
  const completedTopicsToRender = user?.completedTopics || [];

 
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  return (
    <div className="dashboard-page">
     
      <aside className={`sidebar ${showMobileSidebar ? 'mobile-visible' : ''}`}>
        <div className="sidebar-header">
          <BookOpen className="sidebar-logo-icon" />
          <h1 className="sidebar-title">LearnMate</h1>
          <button onClick={() => setShowMobileSidebar(false)} className="sidebar-close-btn">
            <X size={28} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <button
            onClick={() => { setCurrentView('askAI'); setShowMobileSidebar(false); }}
            className={`nav-button ${currentView === 'askAI' ? 'active' : ''}`}
          >
            <MessageSquare className="nav-icon" /> Ask AI
          </button>
          <button
            onClick={() => { setCurrentView('quizPractice'); setShowMobileSidebar(false); }}
            className={`nav-button ${currentView === 'quizPractice' ? 'active' : ''}`}
          >
            <Target className="nav-icon" /> Quiz
          </button>
          <button
            onClick={() => { setCurrentView('dashboard'); setShowMobileSidebar(false); }}
            className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            <BarChart2 className="nav-icon" /> Dashboard
          </button>
          <button
            onClick={() => { setShowAddSubjectModal(true); setShowMobileSidebar(false); }}
            className="nav-button"
          >
            <PlusCircle className="nav-icon" /> Add Subject
          </button>
        </nav>
        <div className="sidebar-profile-info">
          <p>Welcome, <span className="font-bold">{user?.name || 'Guest'}</span>!</p>
          <p>Grade: <span className="font-semibold">{user?.grade || 'N/A'}</span></p>
          <p>Subjects: <span className="font-semibold">{user?.subjects?.join(', ') || 'N/A'}</span></p>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            <LogOut className="nav-icon" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="main-header">
          <button onClick={() => setShowMobileSidebar(true)} className="mobile-menu-btn">
            <Menu size={32} />
          </button>
          <h2 className="main-title">
            Your Progress Overview
          </h2>
          <div className="profile-widget">
            <span className="profile-widget-text">{user?.name || 'Guest'}</span>
            <div className="profile-avatar">
              {user?.googleProfilePicUrl ? (
                <img src={user.googleProfilePicUrl} alt="Profile" className="profile-image" />
              ) : (
                <span className="profile-initial">{getInitial(user?.name)}</span>
              )}
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Knowledge Gains Card */}
          <div className="dashboard-card knowledge-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Knowledge Gains</h3>
              <Award className="dashboard-card-icon" />
            </div>
            <p className="dashboard-card-value">{user?.knowledgeGains || 0} XP</p>
            <div className="progress-bar-wrapper">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="dashboard-card-subtitle">Towards your daily goal of {user?.dailyGoal || 0} XP</p>
          </div>

          {/* Streak Counter Card */}
          <div className="dashboard-card streak-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Current Streak</h3>
              <Star className="dashboard-card-icon" />
            </div>
            <p className="dashboard-card-value">{user?.streak || 0} Days</p>
            <p className="dashboard-card-subtitle">Keep up the consistent effort!</p>
          </div>

          {/* Level Card */}
          <div className="dashboard-card level-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Learner Level</h3>
              <Trophy className="dashboard-card-icon" />
            </div>
            <p className="dashboard-card-value">Level {user?.level || 1}</p>
            <p className="dashboard-card-subtitle">Unlock new challenges and achievements!</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Your Learning Path */}
          <div className="learning-path-section">
            <h3 className="section-title">Your Learning Path</h3>
            <ul className="learning-path-list">
              {completedTopicsToRender.length > 0 ? (
                completedTopicsToRender.map((topic, index) => (
                  <li key={index} className="learning-path-item">
                    <CheckCircle className="learning-path-icon" />
                    <span className="learning-path-text">{topic}</span>
                  </li>
                ))
              ) : (
                <div className="empty-state">
                  <BookOpen className="empty-state-icon" />
                  <p className="empty-state-title">No topics completed yet!</p>
                  <p className="empty-state-subtitle">Start a learning session to unlock new knowledge.</p>
                </div>
              )}
            </ul>
          </div>

          
          <div className="recent-activity-section">
            <h3 className="section-title">Recent Activity</h3>
            {currentSession.sessionGains > 0 ? (
              <div className="session-summary-card">
                <h4 className="session-summary-title">Last Session Summary:</h4>
                <p className="session-summary-text">
                  You gained <span className="font-bold">+{currentSession.sessionGains} Knowledge Gains</span>
                  in your last learning session. Keep building that momentum! 💪
                </p>
                <p className="session-summary-prompt">Ready for another challenge?</p>
              </div>
            ) : (
              <div className="empty-state">
                <TrendingUp className="recent-activity-empty-state-icon" />
                <p className="empty-state-title">No recent activity</p>
                <p className="empty-state-subtitle">Start your first session to see your progress here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
