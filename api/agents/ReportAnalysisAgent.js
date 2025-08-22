import client from "../services/OpenAIClient.js";

class ReportAnalysisAgent {
  static instance;

  constructor() {
    if (ReportAnalysisAgent.instance) {
      return ReportAnalysisAgent.instance;
    }
    this.model = "gpt-4o-mini"; // structured reasoning
    ReportAnalysisAgent.instance = this;
  }

  async analyze(reportJson) {
    const prompt = `
    Here is a student performance report in JSON:
    ${reportJson}

    Analyze and identify top 3 areas of improvement.
    Output as JSON with { weaknesses: [...], recommendations: [...] }.
    `;
    const response = await client.chat.completions.create({
      model: this.model,
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content;
  }
}

export default new ReportAnalysisAgent();
