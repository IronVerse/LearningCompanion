import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { login, logout, me } from './controllers/authController.js';

import QuestionGeneratorAgent from "./agents/QuestionGeneratorAgent.js";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.get("/", async(req, res) => {
  const questions = await QuestionGeneratorAgent.generate("Biology", 11, "Evolution", 5);
  res.json(JSON.parse(questions));
});
// app.use("/api", routes);

app.post('/api/auth/google', login);
app.post('/api/logout', logout);
app.get('/api/me', me);

app.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT}`));
