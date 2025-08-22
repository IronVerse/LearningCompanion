// services/OpenAIService.js
import OpenAI from "openai";
import { configDotenv } from "dotenv";



class OpenAIService {
  static instance;

  constructor() {
    configDotenv();
    console.log(process.env.OPENAI_API_KEY)

    if (OpenAIService.instance) {
      return OpenAIService.instance;
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    OpenAIService.instance = this;
  }

  async getResponse(prompt, model = "gpt-5") {
    const response = await this.client.responses.create({
       
      model,
      input: prompt
    });
    console.log({response})
    // normalize response to just text
    return response.output_text;
  }

  // You can add custom methods here
  async getBedtimeStory() {
    return await this.getResponse(
      "Write a one-sentence bedtime story about a unicorn."
    );
  }
}

export const OpenAiService =  new OpenAIService();
