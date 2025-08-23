import client from "../services/aiService.js";

class ReportAnalysisAgent {
  static instance;

  constructor() {
    if (ReportAnalysisAgent.instance) {
      return ReportAnalysisAgent.instance;
    }
    this.model = "gpt-4o"; // structured reasoning
    ReportAnalysisAgent.instance = this;
  }

  async analyze(reportJson) {
    const systemPrompt = `
    You are an expert South African school report card analyzer.
    You will receive a JSON object with a "subjects" array. Each subject has "subject", "score", and "percentage".
    Identify the 3 subjects with the lowest "percentage".
    Return strictly as JSON in the following format:
    { "weaknesses": [ "Full Subject Name 1", "Full Subject Name 2", "Full Subject Name 3" ] }
    Do NOT add explanations, code blocks, or any other text.
    Sort by percentage ascending, and include the exact "subject" strings from the input.
    `;
    const response = await client.chat.completions.create({
      model: this.model,
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(reportJson) }
      ]
    });
    const cleanedJson = response.choices[0].message.content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson);
  }
}

export default new ReportAnalysisAgent();
