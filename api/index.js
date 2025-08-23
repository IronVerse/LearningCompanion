import express from "express";
import QuestionGeneratorAgent from "./agents/QuestionGeneratorAgent.js";
import ReportParserAgent from "./agents/ReportParserAgent.js";
import multer from "multer";
import ReportAnalysisAgent from "./agents/ReportAnalysisAgent.js";


const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());

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

    res.json({...result, ...improvementAreas});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", async(req, res) => {
  const questions = await QuestionGeneratorAgent.generate("Physical Science", 11, "Mixed Topics", 30);

  res.json(JSON.parse(questions));
});
// app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));