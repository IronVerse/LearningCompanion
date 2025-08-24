
const BACKEND_URL = 'http://localhost:4001';

export const getExplanationFromBackend = async (topic) => {
  try {
    const response = await fetch(`${BACKEND_URL}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch explanation');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching explanation:', error);
    throw error;
  }
};

export const getQuizFromBackend = async (topic) => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch quiz');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
};

export const evaluateAnswerOnBackend = async (userAnswer, correctAnswer) => {
  try {
    const response = await fetch(`${BACKEND_URL}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAnswer, correctAnswer }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to evaluate answer');
    }
    return await response.json();
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw error;
  }
};

export const getMotivationFromBackend = async (isCorrect, points, streak) => {
  try {
    const response = await fetch(`${BACKEND_URL}/motivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCorrect, points, streak }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch motivation');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching motivation:', error);
    throw error;
  }
};
