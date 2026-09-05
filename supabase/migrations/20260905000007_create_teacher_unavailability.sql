-- Migration 007: teacher_unavailability
-- Order: seventh, per SCHEMA.md §9 (depends on teachers)
-- SCHEMA.md §3 > teacher_unavailability
-- Included now rather than deferred — costs nothing and the engine's
-- constraint-processing step already needs a slot-availability check (SCHEMA.md §3 note).

CREATE TABLE IF NOT EXISTS public.teacher_unavailability (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid        NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  day        smallint    NOT NULL,
  period     smallint    NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Same day/period bounds as timetable_entries for consistency
  CONSTRAINT unavailability_day_check    CHECK (day    BETWEEN 1 AND 6),
  CONSTRAINT unavailability_period_check CHECK (period BETWEEN 1 AND 8),

  -- A teacher cannot declare the same slot unavailable twice
  CONSTRAINT uniq_teacher_unavailability UNIQUE (teacher_id, day, period)
);

-- Index: constraint-processing lookup during scheduling engine run (SCHEMA.md §5)
CREATE INDEX IF NOT EXISTS idx_unavailability_teacher_slot
  ON public.teacher_unavailability (teacher_id, day, period);

COMMENT ON TABLE public.teacher_unavailability IS 'Slots where a teacher is declared unavailable. The scheduling engine treats these as hard constraints — never places a class here (TRD.md §5, RULES.md).';
