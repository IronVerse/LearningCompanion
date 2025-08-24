// frontend/src/App.jsx
import React, { useState } from 'react';
import AuthForm from '../../frontend/src/views/AuthForm.jsx';
import Dashboard from '../../frontend/src/views/Dashboard.jsx';
import AskAI from '../../frontend/src/views/AskAI.jsx';
import QuizPractice from '../../frontend/src/views/QuizPractice.jsx';
import AddSubjectModal from './components/AddSubjectModal.jsx';
import GoogleSignIn from './components/GoogleSignIn'; 
import { LogOut } from 'lucide-react';
import { registerUser } from './api/backendApi.js';

const App = () => {
  const [currentView, setCurrentView] = useState('login'); 
  const [user, setUser] = useState(null); 
  const [currentSession, setCurrentSession] = useState({
    topic: '',
    explanations: null,
    currentQuiz: null,
    userAnswer: '',
    sessionGains: 0
  });
  const [chatHistory, setChatHistory] = useState([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const BACKEND_URL = 'http://localhost:4001';

  // --- Authentication Handlers (email/password) ---
  const handleLogin = async (email, password) => {
    setAuthLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUser({
        name: 'Guest User',
        email: email,
        googleProfilePicUrl: 'https://placehold.co/40x40/FF5733/FFFFFF?text=GU'
      });
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setAuthLoading(true);
    
    try {
      setUser({
        name: userData.name,
        email: userData.email,
        googleProfilePicUrl: `https://placehold.co/40x40/33FF57/FFFFFF?text=${userData.firstName.charAt(0).toUpperCase()}`
      });

      const registerResponse = await registerUser(userData);

      if (registerResponse.isSuccess) {
        setAuthLoading(false);
        setCurrentView('dashboard');
      }
      setAuthLoading(false);
      
    } catch (error) {
      console.error('Registration error:', error);
      setAuthLoading(false);
    }
  };
  // --- End Authentication Handlers ---

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    setChatHistory([]);
    setCurrentSession({ topic: '', explanations: null, currentQuiz: null, userAnswer: '', sessionGains: 0 });
    setShowMobileSidebar(false);
  };

  if (currentView === 'login') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <AuthForm
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={authLoading}
          setUser={setUser}
          setCurrentView={setCurrentView}
          onGoogleSignIn={(googleUser) => {
            setUser({
              name: googleUser.name,
              email: googleUser.email,
              googleProfilePicUrl: googleUser.picture
            });
            setCurrentView('dashboard');
          }}
        />
      </div>
    );
  }


  if (currentView === 'dashboard') {
    return (
      <>
        <Dashboard
          user={user}
          currentSession={currentSession}
          setCurrentView={setCurrentView}
          handleLogout={handleLogout}
          setShowAddSubjectModal={setShowAddSubjectModal}
          showMobileSidebar={showMobileSidebar}
          setShowMobileSidebar={setShowMobileSidebar}
          currentView={currentView}
        />
        {showAddSubjectModal && (
          <AddSubjectModal
            onClose={() => setShowAddSubjectModal(false)}
            onAddSubject={(newSubj) => {
              setUser(prev => ({
                ...prev,
                subjects: prev.subjects ? [...prev.subjects, newSubj] : [newSubj]
              }));
            }}
            userSubjects={user?.subjects || []}
          />
        )}
      </>
    );
  }

  if (currentView === 'askAI') {
    return (
      <AskAI
        user={user}
        currentSession={currentSession}
        setCurrentSession={setCurrentSession}
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        setCurrentView={setCurrentView}
      />
    );
  }

  if (currentView === 'quizPractice') {
    return (
      <QuizPractice
        user={user}
        setUser={setUser}
        setCurrentView={setCurrentView}
      />
    );
  }

  return null; 
};

export default App;
