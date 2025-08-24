-- V7__seed_minimum.sql
-- Minimal seed data for demo purposes.

INSERT INTO subjects (name) VALUES ('Algebra') ON CONFLICT DO NOTHING;
INSERT INTO topics (subject_id, name, field)
SELECT s.subject_id, 'Solving 1-step equations', 'math'
FROM subjects s WHERE s.name='Algebra'
ON CONFLICT DO NOTHING;
