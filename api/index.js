import express from "express";
import QuestionGeneratorAgent from "./agents/QuestionGeneratorAgent.js";


const app = express();

app.use(express.json());

app.get("/", async(req, res) => {
  const questions = await QuestionGeneratorAgent.generate("Biology", 11, "Evolution", 5);
  res.json(JSON.parse(questions));
});
// app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));