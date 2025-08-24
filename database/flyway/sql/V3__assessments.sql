-- V3__assessments.sql
-- Optional grouping of questions into assessments or quizzes.

CREATE TABLE IF NOT EXISTS assessments (
  assessment_id   BIGSERIAL PRIMARY KEY,
  subject_id      BIGINT REFERENCES subjects(subject_id),
  title           TEXT
);

CREATE TABLE IF NOT EXISTS assessment_items (
  assessment_id   BIGINT REFERENCES assessments(assessment_id) ON DELETE CASCADE,
  question_id     BIGINT REFERENCES questions(question_id) ON DELETE CASCADE,
  position        INT,
  points          NUMERIC(6,2) DEFAULT 1,
  PRIMARY KEY (assessment_id, question_id)
);
