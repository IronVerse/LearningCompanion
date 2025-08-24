-- V6__indexes.sql
-- Helpful indexes for common queries.

CREATE INDEX IF NOT EXISTS ix_attempts_user_time    ON attempts (user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS ix_question_topics_topic ON question_topics (topic_id);
CREATE INDEX IF NOT EXISTS ix_attempts_question     ON attempts (question_id);
