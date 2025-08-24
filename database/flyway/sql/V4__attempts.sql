-- V4__attempts.sql
-- Telemetry for student interactions (runtime data).

CREATE TABLE IF NOT EXISTS attempts (
  attempt_id      BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  question_id     BIGINT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  assessment_id   BIGINT REFERENCES assessments(assessment_id),
  started_at      TIMESTAMPTZ DEFAULT now(),
  submitted_at    TIMESTAMPTZ,
  time_ms         INT,
  score           NUMERIC(6,2) DEFAULT 0,
  is_correct      BOOLEAN,
  hints_used      INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS attempt_selected_options (
  attempt_id      BIGINT REFERENCES attempts(attempt_id) ON DELETE CASCADE,
  option_id       BIGINT REFERENCES options(option_id)   ON DELETE CASCADE,
  PRIMARY KEY (attempt_id, option_id)
);
