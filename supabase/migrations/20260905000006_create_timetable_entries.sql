-- Migration 006: timetable_entries
-- Order: sixth, per SCHEMA.md §9 (depends on timetables, subjects, teachers, rooms)
-- SCHEMA.md §3 > timetable_entries
-- This is the core scheduled-class record — one row per placed class.

CREATE TABLE IF NOT EXISTS public.timetable_entries (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id uuid        NOT NULL REFERENCES public.timetables(id)  ON DELETE CASCADE,
  subject_id   uuid        NOT NULL REFERENCES public.subjects(id)    ON DELETE RESTRICT,
  teacher_id   uuid        NOT NULL REFERENCES public.teachers(id)    ON DELETE RESTRICT,
  room_id      uuid        NOT NULL REFERENCES public.rooms(id)       ON DELETE RESTRICT,
  day          smallint    NOT NULL,
  period       smallint    NOT NULL,
  is_locked    boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),

  -- Day must be 1-6 (Mon-Sat per SCHEMA.md §3 — college may use Sat)
  CONSTRAINT entries_day_check CHECK (day BETWEEN 1 AND 6),

  -- Period must be 1-8 (fixed default per Phase 0 decision — typical college day)
  -- Resolve: TRACKER.md open question 1 resolved as fixed defaults (8 periods/day max)
  CONSTRAINT entries_period_check CHECK (period BETWEEN 1 AND 8),

  -- ── Hard constraint safety net (SCHEMA.md §6, TRD.md §8) ────────────────
  -- These DB-level constraints are the last resort beneath the app-level
  -- conflict checker (engine HashMap). They protect against race conditions.

  -- Hard constraint 1: a teacher cannot teach two classes in the same period
  -- (scoped per timetable — cross-timetable teacher conflicts caught by the engine)
  CONSTRAINT uniq_teacher_slot UNIQUE (teacher_id, day, period, timetable_id),

  -- Hard constraint 2: a room cannot host two classes simultaneously
  CONSTRAINT uniq_room_slot    UNIQUE (room_id, day, period, timetable_id),

  -- Hard constraint 3: a section cannot have two subjects in the same period
  CONSTRAINT uniq_section_slot UNIQUE (timetable_id, day, period)

  -- ON DELETE notes (RULES.md §43):
  --   timetable_id: CASCADE — deleting a timetable removes all its entries (intentional)
  --   subject_id, teacher_id, room_id: RESTRICT — cannot delete master data that
  --   is referenced by existing entries; application shows a user-facing error
  --   per APP_FLOW.md §6 before reaching this constraint.
);

-- ── Indexes (SCHEMA.md §5) ────────────────────────────────────────────────
-- Conflict lookups in the engine and manual-edit API filter on these constantly.

-- Teacher conflict lookup (TRD.md §5 HashMap checks)
CREATE INDEX IF NOT EXISTS idx_entries_teacher_slot
  ON public.timetable_entries (teacher_id, day, period);

-- Room conflict lookup
CREATE INDEX IF NOT EXISTS idx_entries_room_slot
  ON public.timetable_entries (room_id, day, period);

-- Full grid fetch for a section's timetable
CREATE INDEX IF NOT EXISTS idx_entries_timetable_id
  ON public.timetable_entries (timetable_id);

COMMENT ON TABLE  public.timetable_entries           IS 'One row per scheduled class. The three UNIQUE constraints are the DB-level hard-constraint safety net beneath the engine.';
COMMENT ON COLUMN public.timetable_entries.teacher_id IS 'Denormalized from subjects.teacher_id to allow per-entry substitute assignment without altering the subject record (SCHEMA.md §4).';
COMMENT ON COLUMN public.timetable_entries.room_id    IS 'Denormalized for the same reason — an entry can use an alternate room without changing the subject default.';
COMMENT ON COLUMN public.timetable_entries.is_locked  IS 'true = manually placed; treated as a pre-filled hard constraint in Keep-manual regeneration mode (TRD.md §5). NOT the same as a published timetable being non-editable — that comes from timetables.status.';
