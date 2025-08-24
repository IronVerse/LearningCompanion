// api/controllers/questionController.js
// Controller for question related endpoints.  This controller accepts
// HTTP requests, validates inputs and delegates to the question
// service to handle business logic.  It uses the asyncHandler
// utility to automatically forward errors to the Express error
// handler, keeping the controller code concise.

import asyncHandler from '../utils/asyncHandler.js';
import QuestionService from '../services/questionService.js';

/**
 * POST /api/questions/next
 *
 * Generate one or more questions for a given subject, grade and topic
 * using the QuestionGeneratorAgent.  Newly generated questions are
 * persisted to the database if they don't already exist and the
 * student's past attempts are checked so they are not served a
 * question they have already answered.  The request body should
 * contain:
 *   - subject: string – e.g. "Physical Science"
 *   - grade: number or string – grade level of the student
 *   - topic: string – more specific focus within the subject
 *   - count: number (optional) – how many questions to generate (default 1)
 *   - userId: number – the user/student ID in the database
 *
 * Returns a JSON object with a `questions` array.  Each item
 * includes the questionId, the stem, a list of options and a
 * boolean flag indicating whether the user has already attempted
 * this question.
 */
export const getNextQuestions = asyncHandler(async (req, res) => {
  const { subject, grade, topic, count, userId } = req.body;
  // Basic validation of required fields
  if (!subject || !grade || !topic || !userId) {
    return res
      .status(400)
      .json({ error: 'Missing required parameters: subject, grade, topic and userId are required.' });
  }
  // Coerce count to integer with a sane default
  const num = count ? parseInt(count, 10) : 1;
  if (isNaN(num) || num <= 0) {
    return res.status(400).json({ error: 'count must be a positive integer' });
  }
  const questions = await QuestionService.generateQuestions(
    subject,
    grade,
    topic,
    num,
    userId
  );
  return res.json({ questions });
});

export default { getNextQuestions };