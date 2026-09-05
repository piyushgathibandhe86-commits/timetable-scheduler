-- Migration 005: timetables
-- Order: fifth, per SCHEMA.md §9 (depends on sections)
-- SCHEMA.md §3 > timetables

CREATE TABLE IF NOT EXISTS public.timetables (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid        NOT NULL REFERENCES public.sections(id) ON DELETE RESTRICT,
  status     text        NOT NULL DEFAULT 'draft',
  version    integer     NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Status must be draft or published only (SCHEMA.md §7)
  -- Transitions enforced at the application layer: draft -> published -> draft
  -- (APP_FLOW.md §10). Direct DB constraint ensures no other values ever stored.
  CONSTRAINT timetables_status_check CHECK (status IN ('draft', 'published')),

  -- version must be positive
  CONSTRAINT timetables_version_check CHECK (version > 0),

  -- One active timetable per section (SCHEMA.md §4):
  -- MVP scope is a single active timetable per section at a time.
  CONSTRAINT timetables_section_unique UNIQUE (section_id)
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS 
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
 LANGUAGE plpgsql;

CREATE TRIGGER timetables_updated_at
  BEFORE UPDATE ON public.timetables
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE  public.timetables         IS 'One timetable record per section. MVP: one active timetable per section (draft or published).';
COMMENT ON COLUMN public.timetables.status  IS 'draft: editable, hidden from viewers. published: locked, visible to students/teachers. Transitions per APP_FLOW.md §10.';
COMMENT ON COLUMN public.timetables.version IS 'Increments on each publish->unpublish->publish cycle. Used for audit trail.';
