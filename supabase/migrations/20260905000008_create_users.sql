-- Migration 008: users (public profile table)
-- Order: last, per SCHEMA.md §9 (has FKs into sections and teachers)
-- SCHEMA.md §3 > users
-- Extends Supabase Auth's auth.users with role and profile data.
-- The auth.users row is created by Supabase Auth on sign-up;
-- this public.users row is created by the app immediately after.

CREATE TABLE IF NOT EXISTS public.users (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text        NOT NULL,
  full_name  text        NOT NULL,
  role       text        NOT NULL,
  section_id uuid        REFERENCES public.sections(id)  ON DELETE SET NULL,
  teacher_id uuid        REFERENCES public.teachers(id)  ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Email must be unique across all users
  CONSTRAINT users_email_unique UNIQUE (email),

  -- Role must be one of the three defined values (TRD.md §7, SCHEMA.md §3)
  CONSTRAINT users_role_check CHECK (role IN ('admin', 'student', 'teacher'))

  -- section_id / teacher_id conditional-null rules (SCHEMA.md §7):
  --   student: section_id must be non-null (set at first login per APP_FLOW.md §4)
  --   teacher: teacher_id must be non-null
  --   admin:   both are null
  -- These are enforced at the application layer (not expressible as a single
  -- SQL CHECK without role-conditional logic). The DB allows nulls; the API
  -- layer enforces the per-role requirement.
);

-- Indexes for resolving a logged-in viewer's scope (SCHEMA.md §5)
CREATE INDEX IF NOT EXISTS idx_users_section_id  ON public.users (section_id);
CREATE INDEX IF NOT EXISTS idx_users_teacher_id  ON public.users (teacher_id);

COMMENT ON TABLE  public.users            IS 'Public profile extending auth.users. Created by the app immediately after Supabase Auth sign-up.';
COMMENT ON COLUMN public.users.role       IS 'admin | student | teacher. Controls routing and permissions throughout the app.';
COMMENT ON COLUMN public.users.section_id IS 'Set for student role only — the section they self-selected at first login (APP_FLOW.md §4).';
COMMENT ON COLUMN public.users.teacher_id IS 'Set for teacher role only — links to their teachers record for the filtered My-lectures-today view.';
