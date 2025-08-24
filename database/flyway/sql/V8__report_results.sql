-- V8__report_results.sql
-- Stores report outcomes per subject with a proper FK to subjects.subject_id

CREATE TABLE IF NOT EXISTS report_results (
  result_id    BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id   BIGINT NOT NULL REFERENCES subjects(subject_id) ON DELETE RESTRICT,
  percentage   NUMERIC NOT NULL,
  needs_focus  BOOLEAN NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_results_user_id    ON report_results(user_id);
CREATE INDEX IF NOT EXISTS idx_report_results_subject_id ON report_results(subject_id);
CREATE INDEX IF NOT EXISTS idx_report_results_created_at ON report_results(created_at);
