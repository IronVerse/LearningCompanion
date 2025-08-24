import QuestionGeneratorAgent from "../agents/QuestionGeneratorAgent.js";
import { openDb } from "../config/db.js";
import { getSessionFromReq } from "./authController.js";

export const getInitialQuiz = async(req, res) => {

    const db = await openDb();
    const session = getSessionFromReq(req);

    const user = await db.get(`
      SELECT * FROM Users
      WHERE Email = ?
      `, session.email);

    const results = await db.all(`
    SELECT * 
    FROM Subjects 
    WHERE NeedsFocus = 1
    `);
    
    const listOfQuestions = [];
    if (Array.isArray(results) && results.length) {
      for (const subject of results) {

        const questions = await QuestionGeneratorAgent.generate(subject.Name, user.Grade, 'MIXED TOPICS', 10);
        
        const questionObject = {
          subject: subject.Name,
          ...questions,
        }

        listOfQuestions.push(questionObject);
      }
    }


  res.json(listOfQuestions);
}
