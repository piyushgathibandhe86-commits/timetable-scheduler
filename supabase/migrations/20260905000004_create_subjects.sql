-- Migration 004: subjects
-- Order: fourth, per SCHEMA.md §9 (depends on sections + teachers)
-- SCHEMA.md §3 > subjects

CREATE TABLE IF NOT EXISTS public.subjects (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  section_id   uuid        NOT NULL REFERENCES public.sections(id)  ON DELETE RESTRICT,
  teacher_id   uuid        NOT NULL REFERENCES public.teachers(id)  ON DELETE RESTRICT,
  type         text        NOT NULL,
  weekly_hours integer     NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),

  -- Type must be lecture or lab (SCHEMA.md §3)
  -- lab type triggers the hard room-type constraint in the scheduling engine
  CONSTRAINT subjects_type_check CHECK (type IN ('lecture', 'lab')),

  -- weekly_hours must be a positive integer (SCHEMA.md §7)
  CONSTRAINT subjects_weekly_hours_check CHECK (weekly_hours > 0)
);

-- Index: scheduling engine fetches all subjects for a section at generation time (SCHEMA.md §5)
CREATE INDEX IF NOT EXISTS idx_subjects_section_id ON public.subjects (section_id);

-- ON DELETE RESTRICT rationale (RULES.md §43):
-- Deleting a section or teacher that has subjects assigned must be blocked at the
-- DB level as a last resort — the application layer handles the user-facing error
-- message per APP_FLOW.md §6.

COMMENT ON TABLE  public.subjects              IS 'Subjects belonging to a section, each assigned to one teacher. type=lab enforces the lab-room hard constraint.';
COMMENT ON COLUMN public.subjects.type         IS 'lecture or lab. A lab subject may ONLY be placed in a rooms.type=lab room — hard constraint per TRD.md §5, RULES.md.';
COMMENT ON COLUMN public.subjects.weekly_hours IS 'Required periods per week. Drives most-constrained-first ordering in the scheduling engine (TRD.md §5).';
