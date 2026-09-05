-- Migration 001: sections
-- Order: first, per SCHEMA.md §9 (no foreign key dependencies)
-- SCHEMA.md §3 > sections

CREATE TABLE IF NOT EXISTS public.sections (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index: users table (Phase 8) will query sections by id frequently
CREATE INDEX IF NOT EXISTS idx_sections_id ON public.sections (id);

COMMENT ON TABLE  public.sections      IS 'College sections/classes (e.g. AI III-B). One timetable per section.';
COMMENT ON COLUMN public.sections.name IS 'Human-readable section name, e.g. "AI III-B".';
