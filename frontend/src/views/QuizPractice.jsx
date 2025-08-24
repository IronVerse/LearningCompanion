import React, { useState } from 'react';
import { User, ChevronRight, Target, BookOpen, Loader2 } from 'lucide-react';

import { getQuizFromBackend, evaluateAnswerOnBackend, getMotivationFromBackend } from '../api/backendApi';


const QuizPractice = ({ user, setUser, setCurrentView }) => {
  const [quizTopic, setQuizTopic] = useState('');
  const [currentPracticeQuiz, setCurrentPracticeQuiz] = useState(null);
  const [selectedPracticeAnswer, setSelectedPracticeAnswer] = useState('');
  const [quizFeedback, setQuizFeedback] = useState('');
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  const generatePracticeQuiz = async () => {
    if (!quizTopic.trim()) {
      setQuizFeedback('Please enter a topic to generate a quiz.');
      return;
    }
    setIsQuizLoading(true);
    setQuizFeedback('');
    setCurrentPracticeQuiz(null);
    setSelectedPracticeAnswer('');

    try {
      const quiz = await getQuizFromBackend(quizTopic);
      setCurrentPracticeQuiz(quiz);
      setQuizFeedback('');
    } catch (error) {
      console.error('Error generating practice quiz:', error);
      setQuizFeedback('Failed to generate quiz. Please try again.');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const submitPracticeAnswer = async () => {
    if (!selectedPracticeAnswer || !currentPracticeQuiz) return;

    setIsQuizLoading(true);
    setQuizFeedback('');

    try {
      const evaluationResult = await evaluateAnswerOnBackend(selectedPracticeAnswer, currentPracticeQuiz.correctAnswer);
      const { isCorrect, points } = evaluationResult;
      const newStreak = isCorrect ? (user?.streak || 0) + 1 : 0;

      setUser(prevUser => {
        if (!prevUser) return null; 
        const updatedKnowledgeGains = prevUser.knowledgeGains + points;
        const newLevel = updatedKnowledgeGains >= prevUser.level * 100 ? prevUser.level + 1 : prevUser.level;
        const updatedCompletedTopics = isCorrect && !prevUser.completedTopics.includes(quizTopic)
          ? [...prevUser.completedTopics, quizTopic]
          : prevUser.completedTopics;

        return {
          ...prevUser,
          knowledgeGains: updatedKnowledgeGains,
          streak: newStreak,
          level: newLevel,
          completedTopics: updatedCompletedTopics,
        };
      });

      const motivationResponse = await getMotivationFromBackend(isCorrect, points, newStreak);

      if (isCorrect) {
        setQuizFeedback(`🎉 Correct! You earned +${points} Knowledge Gains. ${motivationResponse.message}`);
      } else {
        setQuizFeedback(`🤔 Incorrect. The correct answer was ${currentPracticeQuiz.correctAnswer}. You still earned +${points} for trying! ${motivationResponse.message}`);
      }
    } catch (error) {
      console.error('Error submitting practice answer:', error);
      setQuizFeedback('Failed to submit answer. Please try again.');
    } finally {
      setIsQuizLoading(false);
    }
  };

 
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  return (
    <div className="quiz-practice-page">
      <header className="quiz-practice-header">
        <div className="quiz-practice-header-inner">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="back-to-dashboard-btn"
          >
            <ChevronRight className="back-to-dashboard-icon" /> Back to Dashboard
          </button>
          <div className="ask-ai-profile-widget"> {/* Reusing ask-ai-profile-widget for consistency */}
            <span className="ask-ai-profile-text">My Profile: {user?.name || 'Guest'}</span>
            <div className="ask-ai-profile-avatar">
              {user?.googleProfilePicUrl ? (
                <img src={user.googleProfilePicUrl} alt="Profile" className="profile-image" />
              ) : (
                <span className="profile-initial">{getInitial(user?.name)}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="quiz-practice-main">
        <div className="quiz-practice-card">
          <h2 className="quiz-practice-title">
            <Target className="quiz-practice-title-icon" /> Practice Quizzes
          </h2>

          <div className="quiz-topic-input-group">
            <label htmlFor="quizTopic" className="quiz-topic-label">Topic for Quiz:</label>
            <div className="quiz-topic-input-wrapper">
              <input
                type="text"
                id="quizTopic"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="e.g., Algebra, Photosynthesis, World War II"
                className="quiz-topic-input"
                disabled={isQuizLoading}
              />
              <button
                onClick={generatePracticeQuiz}
                disabled={!quizTopic.trim() || isQuizLoading}
                className="generate-quiz-btn"
              >
                {isQuizLoading ? <Loader2 className="generate-quiz-btn-spinner animate-spin" /> : null} Generate Quiz
              </button>
            </div>
            {quizFeedback && (
              <p className={`quiz-feedback ${quizFeedback.includes('Correct') ? 'success' : quizFeedback.includes('Incorrect') ? 'error' : 'info'}`}>
                {quizFeedback}
              </p>
            )}
          </div>

          {currentPracticeQuiz && (
            <div className="practice-quiz-display">
              <h3 className="practice-quiz-question-title">Question:</h3>
              <p className="practice-quiz-question-text">{currentPracticeQuiz.question}</p>
              
              <div className="practice-quiz-options">
                {currentPracticeQuiz.options.map((option, index) => (
                  <button
                    key={index}
                    className={`practice-quiz-option-btn ${
                      selectedPracticeAnswer === option.charAt(0) ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedPracticeAnswer(option.charAt(0))}
                    disabled={isQuizLoading || quizFeedback.includes('Correct') || quizFeedback.includes('Incorrect')}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              <button
                onClick={submitPracticeAnswer}
                disabled={!selectedPracticeAnswer || isQuizLoading || quizFeedback.includes('Correct') || quizFeedback.includes('Incorrect')}
                className="submit-practice-quiz-btn"
              >
                {isQuizLoading ? <Loader2 className="generate-quiz-btn-spinner animate-spin" /> : null} Submit Answer
              </button>
            </div>
          )}
          {!currentPracticeQuiz && !isQuizLoading && quizTopic.trim() && !quizFeedback && (
              <div className="empty-quiz-state">
                <BookOpen className="empty-quiz-state-icon"/>
                <p className="empty-quiz-state-title">Enter a topic and click "Generate Quiz" to start!</p>
              </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizPractice;
