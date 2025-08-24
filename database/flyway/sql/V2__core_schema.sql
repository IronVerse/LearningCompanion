-- V2__core_schema.sql
-- Core catalogs and question bank (immutable content).

-- Enumerated types
DO $$ BEGIN
  CREATE TYPE question_type AS ENUM ('mc_single','mc_multi','numeric','short_text');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  user_id       BIGSERIAL PRIMARY KEY,
  given_name    TEXT,
  family_name   TEXT,
  email         CITEXT UNIQUE,
  grade_level   TEXT
);

-- Subject & topic (skill) catalogs
CREATE TABLE IF NOT EXISTS subjects (
  subject_id    BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
  topic_id      BIGSERIAL PRIMARY KEY,
  subject_id    BIGINT NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  field         TEXT
);

-- Question bank
CREATE TABLE IF NOT EXISTS questions (
  question_id     BIGSERIAL PRIMARY KEY,
  stem_markdown   TEXT NOT NULL,
  question_kind   question_type NOT NULL,
  solution_text   TEXT,
  explanation_md  TEXT
);

CREATE TABLE IF NOT EXISTS options (
  option_id       BIGSERIAL PRIMARY KEY,
  question_id     BIGINT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  body_markdown   TEXT NOT NULL,
  is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
  feedback_md     TEXT
);

-- Many-to-many: questions ↔ topics(skills)
CREATE TABLE IF NOT EXISTS question_topics (
  question_id     BIGINT REFERENCES questions(question_id) ON DELETE CASCADE,
  topic_id        BIGINT REFERENCES topics(topic_id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, topic_id)
);
