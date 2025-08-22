import client from "../services/OpenAIClient.js";

class ReportParserAgent {
  static instance;

  constructor() {
    if (ReportParserAgent.instance) {
      return ReportParserAgent.instance;
    }
    this.model = "gpt-4.1"; // vision + structured output
    ReportParserAgent.instance = this;
  }

  async parseReport(base64File, type = "pdf") {
    const prompt = `
    Extract key student performance data from the attached ${type} file.
    Output as JSON with { subject, score, comments }.
    `;
    const response = await client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "user", content: prompt },
        { role: "user", content: [{ type: "input", file: base64File }] }
      ]
    });
    return response.choices[0].message.content;
  }
}

export default new ReportParserAgent();
