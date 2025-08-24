
import React, { useState, useEffect, useRef } from 'react';
import { User, BookOpen, Send, ChevronRight, Star, Target, Loader2 } from 'lucide-react';
import { getExplanationFromBackend, getQuizFromBackend, evaluateAnswerOnBackend, getMotivationFromBackend } from '../api/backendApi';

const AskAI = ({ user, currentSession, setCurrentSession, chatHistory, setChatHistory, setCurrentView, getExplanationFromBackend, getQuizFromBackend, evaluateAnswerOnBackend, getMotivationFromBackend }) => {
  const [userQuery, setUserQuery] = useState('');
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false);
  const chatAreaRef = useRef(null);

  
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendQuery = async (queryText) => {
    if (!queryText.trim()) return;

    const newUserMessage = { type: 'user', content: queryText, timestamp: Date.now() };
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserQuery('');
    setIsLoadingAiResponse(true);

    try {
      // Simulate getting an explanation
      const explanation = await getExplanationFromBackend(queryText);
      const aiResponse = { type: 'ai', content: 'explanations', explanations: explanation, timestamp: Date.now() };
      setChatHistory(prev => [...prev, aiResponse]);
      setCurrentSession(prev => ({ ...prev, topic: queryText, explanations: explanation }));

    } catch (error) {
      console.error('Error in AskAI:', error);
      setChatHistory(prev => [...prev, { type: 'ai', content: 'Sorry, I could not process your request.', timestamp: Date.now() }]);
    } finally {
      setIsLoadingAiResponse(false);
    }
  };

  const handleGenerateQuizFromChat = async (topic) => {
    setIsLoadingAiResponse(true);
    const quizGenerationMessage = { type: 'user', content: `Generate a quiz on "${topic}"`, timestamp: Date.now() };
    setChatHistory(prev => [...prev, quizGenerationMessage]);

    try {
      const quiz = await getQuizFromBackend(topic);
      const aiQuizResponse = { type: 'ai', content: 'quiz', quiz: quiz, timestamp: Date.now() };
      setChatHistory(prev => [...prev, aiQuizResponse]);
      setCurrentSession(prev => ({ ...prev, currentQuiz: quiz }));

    } catch (error) {
      console.error('Error generating quiz from chat:', error);
      setChatHistory(prev => [...prev, { type: 'ai', content: 'Failed to generate quiz.', timestamp: Date.now() }]);
    } finally {
      setIsLoadingAiResponse(false);
    }
  };

  const handleSubmitQuizAnswerFromChat = async (userAnswer, quizQuestion, correctAnswer, points, topic) => {
    setIsLoadingAiResponse(true);
    const userAnswerMessage = { type: 'user', content: `My answer for "${quizQuestion}" is: "${userAnswer}"`, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userAnswerMessage]);

    try {
      const evaluationResult = await evaluateAnswerOnBackend(userAnswer, correctAnswer);
      const motivation = await getMotivationFromBackend(evaluationResult.isCorrect, evaluationResult.points, user?.streak || 0);

      const aiResultResponse = {
        type: 'ai',
        content: 'result',
        isCorrect: evaluationResult.isCorrect,
        points: evaluationResult.points,
        correctAnswer: correctAnswer,
        motivationMessage: motivation.message,
        timestamp: Date.now(),
      };
      setChatHistory(prev => [...prev, aiResultResponse]);

   
      setUser(prevUser => {
        if (!prevUser) return null;
        const updatedKnowledgeGains = prevUser.knowledgeGains + evaluationResult.points;
        const newStreak = evaluationResult.isCorrect ? (prevUser.streak || 0) + 1 : 0;
        const newLevel = updatedKnowledgeGains >= prevUser.level * 100 ? prevUser.level + 1 : prevUser.level;
        const updatedCompletedTopics = evaluationResult.isCorrect && !prevUser.completedTopics.includes(topic)
          ? [...prevUser.completedTopics, topic]
          : prevUser.completedTopics;

        return {
          ...prevUser,
          knowledgeGains: updatedKnowledgeGains,
          streak: newStreak,
          level: newLevel,
          completedTopics: updatedCompletedTopics,
        };
      });

      setCurrentSession(prev => ({ ...prev, sessionGains: prev.sessionGains + evaluationResult.points }));

    } catch (error) {
      console.error('Error submitting quiz answer from chat:', error);
      setChatHistory(prev => [...prev, { type: 'ai', content: 'Failed to submit quiz answer.', timestamp: Date.now() }]);
    } finally {
      setIsLoadingAiResponse(false);
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  return (
    <div className="ask-ai-page">
      <header className="ask-ai-header">
        <div className="ask-ai-header-inner">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="back-to-dashboard-btn"
          >
            <ChevronRight className="back-to-dashboard-icon" /> Back to Dashboard
          </button>
          <div className="ask-ai-profile-widget">
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

      <main className="chat-area custom-scrollbar" ref={chatAreaRef}>
        <div className="chat-area-inner">
          {chatHistory.length === 0 && !isLoadingAiResponse ? (
            <div className="empty-chat-state">
              <div className="empty-chat-icon-wrapper">
                <BookOpen className="empty-chat-icon" />
              </div>
              <h2 className="empty-chat-title">Ask LearnMate Anything!</h2>
              <p className="empty-chat-subtitle">
                I'm here to help you understand complex topics, prepare for quizzes, and achieve your learning goals.
              </p>
              <div className="empty-chat-prompts-grid">
                <button className="prompt-button" onClick={() => handleSendQuery('Explain the Pythagorean theorem simply.')}>
                  <p>Explain concepts</p>
                  <p>Get simple, clear explanations</p>
                </button>
                <button className="prompt-button" onClick={() => handleSendQuery('Give me a short quiz on World War 2.')}>
                  <p>Generate quizzes</p>
                  <p>Test your knowledge with quick quizzes</p>
                </button>
                <button className="prompt-button" onClick={() => handleSendQuery('How can I improve my math grades?')}>
                  <p>Get study tips</p>
                  <p>Receive personalized learning advice</p>
                </button>
              </div>
            </div>
          ) : (
            chatHistory.map((message, index) => (
              <div key={index} className={message.type === 'user' ? 'chat-message-user-wrapper' : 'chat-message-ai-wrapper'}>
                {message.type === 'user' ? (
                  <div className="chat-message-user">
                    {message.content}
                  </div>
                ) : (
                  <div className="chat-message-ai">
                    {message.content === 'explanations' && message.explanations ? (
                      <>
                        <h3 className="ai-message-title">Explanation for "{currentSession.topic}":</h3>
                        <div className="explanation-card explanation-card-simple">
                          <h4 className="explanation-card-title">Simple Explanation</h4>
                          <p>{message.explanations.simple}</p>
                        </div>
                        <div className="explanation-card explanation-card-analogy">
                          <h4 className="explanation-card-title">Analogy</h4>
                          <p>{message.explanations.analogy}</p>
                        </div>
                        <div className="explanation-card explanation-card-step">
                          <h4 className="explanation-card-title">Step-by-Step Breakdown</h4>
                          <p>{message.explanations.stepByStep}</p>
                        </div>
                        <button
                          onClick={() => handleGenerateQuizFromChat(currentSession.topic)}
                          className="quiz-btn-ai-chat"
                          disabled={isLoadingAiResponse}
                        >
                          <Target className="nav-icon" /> Generate a Quiz on this!
                        </button>
                      </>
                    ) : message.content === 'quiz' && message.quiz ? (
                      <>
                        <h3 className="ai-message-title">Quiz Time!</h3>
                        <p className="ai-chat-quiz-question">{message.quiz.question}</p>
                        <div className="quiz-options-wrapper">
                          {message.quiz.options.map((option, optIndex) => (
                            <button
                              key={optIndex}
                              className={`quiz-option-button ${currentSession.userAnswer === option.charAt(0) ? 'selected' : ''}`}
                              onClick={() => setCurrentSession(prev => ({ ...prev, userAnswer: option.charAt(0) }))}
                              disabled={isLoadingAiResponse}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => handleSubmitQuizAnswerFromChat(currentSession.userAnswer, message.quiz.question, message.quiz.correctAnswer, 10, currentSession.topic)}
                          className="quiz-submit-btn-ai-chat"
                          disabled={!currentSession.userAnswer || isLoadingAiResponse}
                        >
                          Submit Answer
                        </button>
                      </>
                    ) : message.content === 'result' && typeof message.isCorrect === 'boolean' ? (
                      <div className={`quiz-result-card ${message.isCorrect ? 'correct' : 'incorrect'}`}>
                        <div className="quiz-result-header">
                          <span className="quiz-result-emoji">{message.isCorrect ? '🥳' : '😔'}</span>
                          <h4 className="quiz-result-title">{message.isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}</h4>
                        </div>
                        <p className="quiz-result-text">
                          Your answer was {message.isCorrect ? 'correct' : 'incorrect'}.
                          {message.isCorrect ? ` You earned +${message.points} Knowledge Gains.` : ` The correct answer was: ${message.correctAnswer}.`}
                        </p>
                        <p className="quiz-result-motivation">{message.motivationMessage}</p>
                        <div className="quiz-result-actions">
                          <button
                            onClick={() => handleSendQuery(`Explain more about ${currentSession.topic}`)}
                            className="quiz-result-action-btn ask-q"
                            disabled={isLoadingAiResponse}
                          >
                            Ask another question
                          </button>
                          <button
                            onClick={() => handleGenerateQuizFromChat(currentSession.topic)}
                            className="quiz-result-action-btn practice-q"
                            disabled={isLoadingAiResponse}
                          >
                            Try another quiz!
                          </button>
                        </div>
                      </div>
                    ) : (
                    
                      <p>{message.content}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {isLoadingAiResponse && (
            <div className="loading-message">
              <div className="loading-card">
                <div className="loading-spinner-wrapper">
                  <div className="spinner-dot"></div>
                  <div className="spinner-dot"></div>
                  <div className="spinner-dot"></div>
                  <span className="loading-text">LearnMate is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="input-area-ai-chat">
        <div className="input-area-inner-ai-chat">
          <input
            type="text"
            placeholder="Ask LearnMate anything..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoadingAiResponse) {
                handleSendQuery(userQuery);
              }
            }}
            className="ai-chat-input"
            disabled={isLoadingAiResponse}
          />
          <button
            onClick={() => handleSendQuery(userQuery)}
            className="ai-chat-send-btn"
            disabled={!userQuery.trim() || isLoadingAiResponse}
          >
            <Send size={24} className="ai-chat-send-btn-icon" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AskAI;
