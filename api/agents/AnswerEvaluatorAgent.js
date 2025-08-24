import client from "../services/aiService.js";

class AnswerEvaluatorAgent {
  static instance;

  constructor() {
    if (AnswerEvaluatorAgent.instance) {
      return AnswerEvaluatorAgent.instance;
    }
    this.model = "gpt-4o-mini"; // quick reasoning
    AnswerEvaluatorAgent.instance = this;
  }

  async evaluate(question, answer, correctAnswer) {
    const prompt = `
    Question: ${question}
    Student's Answer: ${answer}
    Correct Answer: ${correctAnswer}

    Evaluate if the student's answer is correct.
    If incorrect, explain why and give a helpful hint.
    Respond in JSON: { result: "correct/incorrect", feedback: "..." }.
    `;
    const response = await client.chat.completions.create({
      model: this.model,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content;
  }
}

export default new AnswerEvaluatorAgent();
