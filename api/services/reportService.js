// api/services/reportService.js
// Service for processing student report uploads.  It leverages the
// ReportParserAgent to extract structured results from the raw
// report file, then applies ReportAnalysisAgent to identify
// weaknesses.  After analysis it records each subject and its
// performance into the database along with a flag indicating
// whether that subject is among the weakest for the student.

import { query } from '../db/pool.js';
import ReportParserAgent from '../agents/ReportParserAgent.js';
import ReportAnalysisAgent from '../agents/ReportAnalysisAgent.js';

class ReportService {
  /**
   * Process an uploaded report for a given user.  The file is first
   * parsed into a structured JSON format, then analyzed to
   * identify low-performing subjects.  Results are persisted to
   * the `report_results` table.
   *
   * @param {number} userId - The ID of the user uploading the report
   * @param {Object} file - The Multer file object ({ path, mimetype, originalname })
   * @returns {Promise<{ report: Object, analysis: Object }>} The parsed report and analysis output
   */
  async processReport(userId, file) {
    const { path, mimetype, originalname } = file;
    // Determine the type for the parser (image or pdf)
    let type;
    if (mimetype === 'application/pdf') type = 'pdf';
    else if (mimetype && mimetype.startsWith('image/')) type = 'image';
    else throw new Error('Unsupported file type');
    // Parse the report into structured JSON
    const reportJson = await ReportParserAgent.parseReport({ path, type, filename: originalname });
    // Analyze to find weakest subjects
    const analysis = await ReportAnalysisAgent.analyze(reportJson);
    const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];
    // Insert each subject result
    if (Array.isArray(reportJson.subjects)) {
      for (const subj of reportJson.subjects) {
        const subjectName = subj.subject;
        // Parse percentage as numeric, falling back to score if percentage missing
        let percentage = subj.percentage;
        if (percentage === undefined || percentage === null) {
          percentage = subj.score;
        }
        // Clean numeric value
        let percentValue = null;
        if (typeof percentage === 'string') {
          // Remove any non-numeric characters (e.g. %) and parse
          const match = percentage.match(/\d+(\.\d+)?/);
          percentValue = match ? parseFloat(match[0]) : null;
        } else if (typeof percentage === 'number') {
          percentValue = percentage;
        }
        if (percentValue === null) {
          // Skip if we cannot parse a numeric percentage
          continue;
        }
        const needsFocus = weaknesses.includes(subjectName);
        await query(
          'INSERT INTO report_results (user_id, subject, percentage, needs_focus) VALUES ($1, $2, $3, $4)',
          [userId, subjectName, percentValue, needsFocus]
        );
      }
    }
    return { report: reportJson, analysis };
  }
}

export default new ReportService();