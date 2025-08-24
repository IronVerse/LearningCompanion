import client from "../services/aiService.js";
import { CURRICULUM_CONTEXT } from "../enums/CurriculumContext.js";

class QuestionGeneratorAgent {
  static instance;

  constructor() {
    if (QuestionGeneratorAgent.instance) {
      return QuestionGeneratorAgent.instance;
    }
    this.model = "gpt-4o-mini"; // fast + creative enough
    QuestionGeneratorAgent.instance = this;
  }

  async generate(subject, grade, topic, count = 5) {
    const prompt = `
    ${CURRICULUM_CONTEXT}

    Generate ${count} practice questions for Grade ${grade} in ${subject}.
    Topic: ${topic}.
    Respond only as JSON with keys: question, options, correctAnswer, topic.
    `;
    const response = await client.chat.completions.create({
      model: this.model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }]
    });

    const cleanedJson = response.choices[0].message.content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson);
  }
}

export default new QuestionGeneratorAgent();
