-- Migration 003: teachers
-- Order: third, per SCHEMA.md §9 (no foreign key dependencies)
-- SCHEMA.md §3 > teachers

CREATE TABLE IF NOT EXISTS public.teachers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  email      text        UNIQUE,          -- nullable: not all teachers need login accounts
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.teachers       IS 'Teaching staff. A teacher record exists independently of a login account — not all teachers need app access.';
COMMENT ON COLUMN public.teachers.email IS 'Optional. Only needed if the teacher will log in. Linked to users.teacher_id when a login account exists.';
