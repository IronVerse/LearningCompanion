// api/controllers/answerController.js
// Controller for grading answered questions.  This endpoint accepts
// an array of question/option pairs representing the user's
// selections, delegates to the answer service for evaluation,
// persists attempts and returns only the incorrect questions with
// feedback/explanations.

import asyncHandler from '../utils/asyncHandler.js';
import AnswerService from '../services/answerService.js';

/**
 * POST /api/questions/grade
 *
 * Grade a batch of student answers.  The request body should contain:
 *   - userId: number – the ID of the user submitting answers
 *   - answers: Array<{ questionId:number, optionId:number }> – the student's selected option for each question
 *
 * The service evaluates each response using the AnswerEvaluatorAgent,
 * records an attempt and returns a list of questions that were
 * answered incorrectly along with feedback/hints for each.
 */
export const gradeAnswers = asyncHandler(async (req, res) => {
  const { userId, answers } = req.body;
  if (!userId || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Missing required parameters: userId and answers array are required.' });
  }
  const result = await AnswerService.gradeAnswers(userId, answers);
  return res.json(result);
});

export default { gradeAnswers };