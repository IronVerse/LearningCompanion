import client from "../services/OpenAIClient.js";

class LearningResourceAgent {
  static instance;

  constructor() {
    if (LearningResourceAgent.instance) {
      return LearningResourceAgent.instance;
    }
    this.model = "gpt-4o"; // better for structured + creative resources
    LearningResourceAgent.instance = this;
  }

  async generate(topic, weaknessDescription) {
    const prompt = `
    The student struggles with: ${weaknessDescription}.
    Topic: ${topic}.
    Generate short learning resources:
      - Simple explanation
      - Analogy
      - 2 practice tips
    Respond in JSON with keys { explanation, analogy, tips }.
    `;
    const response = await client.chat.completions.create({
      model: this.model,
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content;
  }
}

export default new LearningResourceAgent();
