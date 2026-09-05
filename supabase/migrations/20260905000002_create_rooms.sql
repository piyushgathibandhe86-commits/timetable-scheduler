-- Migration 002: rooms
-- Order: second, per SCHEMA.md §9 (no foreign key dependencies)
-- SCHEMA.md §3 > rooms

CREATE TABLE IF NOT EXISTS public.rooms (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  type       text        NOT NULL,
  capacity   integer,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Uniqueness: room names must be unique across the college (SCHEMA.md §3)
  CONSTRAINT rooms_name_unique UNIQUE (name),

  -- Type must be one of the two defined values (SCHEMA.md §3, RULES.md §47)
  -- Hard constraint: lab subjects may only be placed in lab rooms (TRD.md §5)
  CONSTRAINT rooms_type_check CHECK (type IN ('lecture', 'lab')),

  -- Capacity must be positive if provided
  CONSTRAINT rooms_capacity_check CHECK (capacity IS NULL OR capacity > 0)
);

COMMENT ON TABLE  public.rooms          IS 'Physical rooms available for scheduling. type drives the lab-room hard constraint in the scheduling engine.';
COMMENT ON COLUMN public.rooms.type     IS 'lecture or lab. A lab subject (subjects.type=lab) may ONLY be placed in a lab room — hard constraint per TRD.md §5.';
COMMENT ON COLUMN public.rooms.capacity IS 'Optional seating capacity. Not used by the scheduling engine in v1 but available for future soft-constraint use.';
