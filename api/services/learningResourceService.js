// api/services/learningResourceService.js
// Service for generating targeted learning resources for a student
// based on a topic and a description of their weaknesses.  It uses
// the LearningResourceAgent (OpenAI) to produce an explanation,
// analogy and tips, then persists the result for the given user.

import { query } from '../db/pool.js';
import LearningResourceAgent from '../agents/LearningResourceAgent.js';

class LearningResourceService {
  /**
   * Generate a learning resource tailored to a student's weakness on a
   * specific topic.  The generated content is saved to the
   * `learning_resources` table for future reference.
   *
   * @param {number|null} userId - The ID of the user requesting the resource (may be null if anonymous)
   * @param {string} topic - The subject or topic for which to generate a resource
   * @param {string} weaknessDescription - A description of what the student finds difficult
   * @returns {Promise<{ explanation:string, analogy:string, tips:any }>} The generated resource
   */
  async generateResource(userId, topic, weaknessDescription) {
    // Generate raw JSON string from the agent
    const raw = await LearningResourceAgent.generate(topic, weaknessDescription);
    let resource;
    try {
      resource = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse learning resource JSON:', raw);
      throw new Error('Invalid learning resource format returned by agent');
    }
    // Ensure table exists
    await query(`
      CREATE TABLE IF NOT EXISTS learning_resources (
        resource_id  BIGSERIAL PRIMARY KEY,
        user_id      BIGINT,
        topic        TEXT NOT NULL,
        explanation  TEXT,
        analogy      TEXT,
        tips         JSONB,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    // Persist the resource.  Tips may be a string or array; store as JSONB.
    const tipsValue = resource.tips !== undefined ? resource.tips : null;
    await query(
      'INSERT INTO learning_resources (user_id, topic, explanation, analogy, tips) VALUES ($1, $2, $3, $4, $5)',
      [userId || null, topic, resource.explanation || null, resource.analogy || null, tipsValue ? JSON.stringify(tipsValue) : null]
    );
    return resource;
  }
}

export default new LearningResourceService();