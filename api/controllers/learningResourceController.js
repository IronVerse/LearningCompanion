// api/controllers/learningResourceController.js
// Controller to handle requests for generating learning resources.
// It expects a JSON body with at least `topic` and
// `weaknessDescription`.  Optionally it may include `userId` to
// associate the resource with a user in the database.

import asyncHandler from '../utils/asyncHandler.js';
import LearningResourceService from '../services/learningResourceService.js';

/**
 * POST /api/resources
 *
 * Generate a learning resource tailored to a student's needs.
 * Body parameters:
 *   - topic (string, required): The topic/subject area for which to generate resources.
 *   - weaknessDescription (string, required): A description of what the student struggles with.
 *   - userId (number, optional): The ID of the user to associate the resource with.
 *
 * Returns the generated resource as JSON.
 */
export const generateResource = asyncHandler(async (req, res) => {
  const { topic, weaknessDescription, userId } = req.body;
  if (!topic || !weaknessDescription) {
    return res.status(400).json({ error: 'Missing required parameters: topic and weaknessDescription are required.' });
  }
  const resource = await LearningResourceService.generateResource(userId ?? null, topic, weaknessDescription);
  return res.json(resource);
});

export default { generateResource };