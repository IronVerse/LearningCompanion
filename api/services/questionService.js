// api/services/questionService.js
// Business logic for generating and persisting questions.  This
// service communicates with the QuestionGeneratorAgent to obtain
// questions, performs deduplication against the question bank,
// inserts new questions and their options into the database, and
// checks whether a particular user has already attempted a given
// question.  It returns structured data that can be passed
// directly to clients.

import { query } from '../db/pool.js';
import QuestionGeneratorAgent from '../agents/QuestionGeneratorAgent.js';

/**
 * Helper to fetch all options for a given question ID.  Each option
 * object returned contains the optionId, the display text and
 * whether it is the correct answer.  Exposing `isCorrect` can be
 * useful for internal purposes; clients may choose to omit it when
 * presenting questions to learners.
 *
 * @param {number} questionId
 * @returns {Promise<Array<{optionId:number,text:string,isCorrect:boolean}>>}
 */
async function fetchOptions(questionId) {
  const res = await query(
    'SELECT option_id AS "optionId", body_markdown AS "text", is_correct AS "isCorrect" FROM options WHERE question_id = $1 ORDER BY option_id',
    [questionId]
  );
  return res.rows;
}

class QuestionService {
  /**
   * Generate questions via the QuestionGeneratorAgent for a specific subject,
   * grade and topic.  Each generated question is checked against the
   * existing question bank; if it does not already exist it is
   * inserted along with its options.  The method then checks
   * whether the user has already attempted each question and
   * annotates the returned objects accordingly.
   *
   * @param {string} subject - The subject for which to generate questions
   * @param {string|number} grade - The grade level
   * @param {string} topic - The topic or focus area
   * @param {number} count - How many questions to generate
   * @param {number} userId - The ID of the user requesting questions
   * @returns {Promise<Array<{questionId:number,stem:string,options:Array<{optionId:number,text:string,isCorrect:boolean}>,attempted:boolean}>>}
   */
  async generateQuestions(subject, grade, topic, count, userId) {
    // Call the agent to generate question objects.  The QuestionGeneratorAgent already
    // returns a parsed JavaScript object or array representing the questions, so
    // there is no need to parse JSON here.  If the returned value is a single
    // object, wrap it in an array for uniform processing.
    const generated = await QuestionGeneratorAgent.generate(subject, grade, topic, count);
    // The agent will sometimes return an object with a `questions` array when asked
    // for multiple questions.  Normalise the structure so that `items` always
    // refers to an array of question objects.  If the returned value is already
    // an array, use it as-is; if it exposes a `questions` property, use that;
    // otherwise wrap the single object in an array.
    let items;
    if (Array.isArray(generated)) {
      items = generated;
    } else if (generated && Array.isArray(generated.questions)) {
      items = generated.questions;
    } else {
      items = [generated];
    }
    const questions = items;

    // Before processing individual questions, ensure that the subject and topic exist
    // in the catalog tables.  This allows us to maintain a consistent mapping
    // between questions and skills.  Subjects are de-duplicated by name in the
    // subjects table; topics are linked to the subject by subject_id.
    let subjectId;
    const subRes = await query('SELECT subject_id FROM subjects WHERE name = $1', [subject]);
    if (subRes.rows.length > 0) {
      subjectId = subRes.rows[0].subject_id;
    } else {
      const insSub = await query('INSERT INTO subjects (name) VALUES ($1) RETURNING subject_id', [subject]);
      subjectId = insSub.rows[0].subject_id;
    }
    let topicId;
    const topicRes = await query(
      'SELECT topic_id FROM topics WHERE name = $1 AND subject_id = $2',
      [topic, subjectId]
    );
    if (topicRes.rows.length > 0) {
      topicId = topicRes.rows[0].topic_id;
    } else {
      // When creating a new topic we leave the field column null (it can be updated later)
      const insTop = await query(
        'INSERT INTO topics (subject_id, name, field) VALUES ($1, $2, NULL) RETURNING topic_id',
        [subjectId, topic]
      );
      topicId = insTop.rows[0].topic_id;
    }
    const results = [];
    for (const q of questions) {
      const stem = q.question || q.stem || q.prompt;
      if (!stem) continue; // skip invalid question definitions
      const options = Array.isArray(q.options) ? q.options : [];
      const correctAnswer = q.correctAnswer;
      // Check if this question already exists in the DB
      let questionId;
      const existing = await query(
        'SELECT question_id FROM questions WHERE stem_markdown = $1 LIMIT 1',
        [stem]
      );
      if (existing.rows.length > 0) {
        questionId = existing.rows[0].question_id;
      } else {
        // Insert new question with default type mc_single and store the correct answer in solution_text
        const ins = await query(
          'INSERT INTO questions (stem_markdown, question_kind, solution_text) VALUES ($1, $2, $3) RETURNING question_id',
          [stem, 'mc_single', correctAnswer]
        );
        questionId = ins.rows[0].question_id;
        // Insert each option; mark as correct when it matches the correctAnswer exactly (case-sensitive)
        for (const opt of options) {
          const isCorrect = opt === correctAnswer;
          await query(
            'INSERT INTO options (question_id, body_markdown, is_correct) VALUES ($1, $2, $3)',
            [questionId, opt, isCorrect]
          );
        }
      }
      // Check whether the user has already attempted this question
      let attempted = false;
      if (userId) {
        const attemptCheck = await query(
          'SELECT 1 FROM attempts WHERE user_id = $1 AND question_id = $2 LIMIT 1',
          [userId, questionId]
        );
        attempted = attemptCheck.rows.length > 0;
      }
      // Fetch options from DB so we can return optionIds as well as text
      const opts = await fetchOptions(questionId);
      // Associate the question with the resolved topic.  If this relationship already
      // exists, the ON CONFLICT clause will suppress duplicate errors.
      try {
        await query(
          'INSERT INTO question_topics (question_id, topic_id) VALUES ($1, $2) ON CONFLICT (question_id, topic_id) DO NOTHING',
          [questionId, topicId]
        );
      } catch (err) {
        console.error('Failed to insert into question_topics:', err);
      }
      results.push({ questionId, stem, options: opts, attempted });
    }
    return results;
  }
}

export default new QuestionService();