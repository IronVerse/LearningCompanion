// services/OpenAIClient.js
import OpenAI from "openai";
import { configDotenv } from "dotenv";

class OpenAIClient {
  static instance;

  constructor() {
    configDotenv();
    if (OpenAIClient.instance) {
      return OpenAIClient.instance;
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    OpenAIClient.instance = this;
  }
}

export default new OpenAIClient().client;
