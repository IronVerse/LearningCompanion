// frontend/src/components/AuthForm.jsx
import React, { useState } from 'react';
import { BookOpen, Upload, Loader2 } from 'lucide-react';
import GoogleSignIn from '../components/GoogleSignIn.jsx'; // Import the GoogleSignIn component

const AuthForm = ({ onLogin, onRegister, isLoading, setUser, setCurrentView, onGoogleSignIn }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]); // Initialize as array
  const [learningGoal, setLearningGoal] = useState('');
  const [reportCard, setReportCard] = useState(null); // Assuming this is for file upload
  const [error, setError] = useState('');

  const grades = ['R', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const availableSubjects = [
    'Mathematics', 'Physical Sciences', 'Life Sciences', 'English Home Language',
    'Afrikaans First Additional Language', 'IsiZulu First Additional Language',
    'IsiXhosa First Additional Language', 'Sepedi First Additional Language',
    'Setswana First Additional Language', 'Geography', 'History', 'Accounting',
    'Business Studies', 'Economics', 'Computer Applications Technology (CAT)',
    'Information Technology (IT)', 'Engineering Graphics & Design (EGD)',
    'Consumer Studies', 'Visual Arts', 'Dramatic Arts', 'Music',
    'Agricultural Sciences', 'Religion Studies'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }
      onLogin(email, password); // Pass password if your onLogin expects it
    } else {
      if (!email || !password || !name || !selectedGrade || selectedSubjects.length === 0 || !learningGoal || !reportCard) {
        setError('Please fill in all registration fields, select at least one subject, and upload your Term Report.');
        return;
      }
      const userData = {
        email,
        password,
        name,
        grade: selectedGrade,
        subjects: selectedSubjects,
        learningGoal,
        reportCard, // This would need to be handled for upload to a backend
        knowledgeGains: 0,
        streak: 0,
        level: 1,
        completedTopics: [],
        dailyGoal: 50,
      };
      onRegister(userData);
    }
  };

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0] && field === 'reportCard') {
      setReportCard(e.target.files[0]);
    }
  };

  return (
    // The auth-page class will now correctly ensure full-screen background
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-section">
          <div className="logo-icon-wrapper">
            <BookOpen className="logo-icon" />
          </div>
          <h1 className="app-title">LearnMate</h1>
          <p className="app-subtitle">Your AI-powered learning companion</p>
        </div>

        <div className="auth-toggle-buttons">
          <button
            onClick={() => setIsLogin(true)}
            className={`auth-toggle-button ${isLogin ? 'active' : ''}`}
            disabled={isLoading}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`auth-toggle-button ${!isLogin ? 'active' : ''}`}
            disabled={isLoading}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <input
              type="text"
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
              required
              disabled={isLoading}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
            disabled={isLoading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
            disabled={isLoading}
          />

          {!isLogin && (
            <>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="auth-select"
                required
                disabled={isLoading}
              >
                <option value="">Select Your Grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{`Grade ${grade}`}</option>
                ))}
              </select>

              <div>
                <p className="subjects-grid-label">Select Your Subjects:</p>
                <div className="subjects-grid">
                  {availableSubjects.map(subject => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleSubjectToggle(subject)}
                      className={`subject-button ${selectedSubjects.includes(subject) ? 'selected' : ''}`}
                      disabled={isLoading}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="What are your learning goals? (e.g., 'Master Algebra', 'Understand Photosynthesis', 'Prepare for final exams')"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                className="auth-textarea"
                rows={3}
                required
                disabled={isLoading}
              ></textarea>

              <label htmlFor="reportCard" className="upload-area">
                <Upload className="upload-icon" />
                <p className="upload-text-main">
                  {reportCard ? reportCard.name : 'Upload Term Report'}
                </p>
                <p className="upload-text-sub">SVG, PNG, JPG, GIF or PDF</p>
                <input
                  id="reportCard"
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/gif,application/pdf"
                  onChange={(e) => handleFileChange(e, 'reportCard')}
                  className="hidden"
                  disabled={isLoading}
                  required
                />
              </label>
            </>
          )}

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : isLogin ? (
              'Login'
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p className="or-separator">or</p>
        <div style={{ pointerEvents: isLoading ? 'none' : 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GoogleSignIn onSignIn={onGoogleSignIn} />
        </div>

      </div>
    </div>
  );
};

export default AuthForm;
