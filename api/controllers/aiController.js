import { OpenAiService } from "../services/index.js";

export const story = async(req, res) => {

  const response = await OpenAiService.getBedtimeStory();

  return res.json({
    response,
  });
};

export const getQuestions = async(req, res) => {

  const response = await OpenAiService.getResponse('Give me 10 grade 7 maths questions');

  return res.json({
    questions: response,
  })
}
