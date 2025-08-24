// api/controllers/reportController.js
// Controller for handling report uploads and analysis.  It expects a
// multipart/form-data request with a file field named "report" and a
// userId in the request body.  The controller delegates parsing and
// analysis to the ReportService, then returns the parsed report and
// analysis details.

import asyncHandler from '../utils/asyncHandler.js';
import ReportService from '../services/reportService.js';

/**
 * POST /api/report
 *
 * Handle uploading of a learner's report card.  The request should
 * include a multipart file called "report" and a JSON body field
 * "userId" indicating who the report belongs to.  The service
 * processes the file, analyzes it and records subject-level
 * performance in the database.
 */
export const uploadReport = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId in request body' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Report file is required' });
  }
  const result = await ReportService.processReport(userId, req.file);
  return res.json(result);
});

export default { uploadReport };