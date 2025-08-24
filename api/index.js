import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import 'dotenv/config';

import { HttpError } from './utils/errors.js';
import asyncHandler from './utils/asyncHandler.js';

import { login, logout, me } from './controllers/authController.js';
import { health } from './controllers/healthController.js';
import { getNextQuestions } from './controllers/questionController.js';
import { gradeAnswers } from './controllers/answerController.js';
import { uploadReport } from './controllers/reportController.js';
import { generateResource } from './controllers/learningResourceController.js';
import { storeUser } from './controllers/userController.js';

import QuestionGeneratorAgent from "./agents/QuestionGeneratorAgent.js";
import ReportParserAgent from "./agents/ReportParserAgent.js";
import ReportAnalysisAgent from "./agents/ReportAnalysisAgent.js";
import { initDb } from "./config/db.js";
import { getInitialQuiz } from "./controllers/quizController.js";
import { register } from "./controllers/authController.js";

await initDb();
const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.get("/initial-quiz", getInitialQuiz);

app.post("/register", upload.single("reportCard"), register);

app.get("/initial-quiz", getInitialQuiz);

app.post("/register", upload.single("reportCard"), register);

app.post("/report", upload.single("report"), async (req, res) => {
  try {
    const { originalname, mimetype, path, buffer } = req.file;
    console.log(req.file)
    let type;
    console.log(mimetype)
    if (mimetype === "application/pdf") type = "pdf";
    else if (mimetype.startsWith("image/")) type = "image";
    else return res.status(400).json({ error: "Unsupported file type" });

    const result = await ReportParserAgent.parseReport({ path, type, filename: originalname });
    const improvementAreas = await ReportAnalysisAgent.analyze(result);
    const firstQuestions = await QuestionGeneratorAgent.generate(improvementAreas.weaknesses[0], 12, 'Mixed Topics', 10)
    const secondQuestions = await QuestionGeneratorAgent.generate(improvementAreas.weaknesses[1], 12, 'Mixed Topics', 10)
    const thirdQuestions = await QuestionGeneratorAgent.generate(improvementAreas.weaknesses[2], 12, 'Mixed Topics', 10)

    res.json({...result, ...improvementAreas, firstQuestions, secondQuestions, thirdQuestions});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.get("/", async(req, res) => {
//   const questions = await QuestionGeneratorAgent.generate("Physical Science", 11, "Mixed Topics", 30);

//   res.json(JSON.parse(questions));
// });
// app.use("/api", routes);

app.get('/health', asyncHandler(health));

app.post('/api/auth/google', login);
app.post('/api/logout', logout);
app.get('/api/me', me);

app.post('/api/questions/next', getNextQuestions);
app.post('/api/questions/grade', gradeAnswers);

app.post('/api/report', upload.single('report'), uploadReport);

app.post('/api/resources', generateResource);

app.post('/api/users', storeUser);

// Not found
app.use((req, res, next) => next(new HttpError(404, 'Not found')));

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const payload = { error: { message: err.message || 'Internal Server Error' } };
  if (err.details) payload.error.details = err.details;
  if (process.env.NODE_ENV !== 'production') {
    payload.error.stack = err.stack;
  }
  res.status(status).json(payload);
});

app.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT}`));
