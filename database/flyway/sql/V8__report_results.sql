-- V8__report_results.sql
-- This migration introduces the `report_results` table used by the
-- ReportService to persist subject-level performance extracted
-- from learner report cards.  It stores the percentage and a
-- boolean indicating whether the subject requires additional focus.

CREATE TABLE IF NOT EXISTS report_results (
  result_id    BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL,
  subject      TEXT NOT NULL,
  percentage   NUMERIC NOT NULL,
  needs_focus  BOOLEAN NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);