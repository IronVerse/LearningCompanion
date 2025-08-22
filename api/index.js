import express from "express";
import { 
  story,
  getQuestions,
} from "./controllers/index.js";


const app = express();

app.use(express.json());

app.get("/", getQuestions);
// app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));