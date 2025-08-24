-- V5__mastery_calibration.sql
-- Per-user skill mastery and (optional) IRT calibration.

DO $$ BEGIN
  CREATE TYPE mastery_method AS ENUM ('BKT','Elo','manual');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS user_skill_mastery (
  user_id         BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
  topic_id        BIGINT REFERENCES topics(topic_id) ON DELETE CASCADE,
  method          mastery_method NOT NULL DEFAULT 'BKT',
  p_mastery       NUMERIC(4,3) NOT NULL DEFAULT 0.300,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS item_calibration (
  question_id     BIGINT PRIMARY KEY REFERENCES questions(question_id) ON DELETE CASCADE,
  a_discrimination NUMERIC(5,3),
  b_difficulty     NUMERIC(6,3),
  c_guess          NUMERIC(4,3)
);
