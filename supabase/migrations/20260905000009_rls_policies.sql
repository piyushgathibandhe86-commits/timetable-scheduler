-- Migration 009: Row-Level Security (RLS) policies
-- Order: after all tables exist (SCHEMA.md §9)
-- Per TRD.md §7: default-deny, explicit read policies per role layered in.
-- RLS is a second layer beneath the API-level auth checks — belt-and-suspenders.

-- ── Enable RLS on every table ──────────────────────────────────────────────
ALTER TABLE public.sections               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_unavailability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;

-- ── Helper: get the current user's role from public.users ─────────────────
-- Called inside RLS policies. Returns null if no session (unauthenticated).
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS 
  SELECT role FROM public.users WHERE id = auth.uid();
;

-- ── Helper: get the current user's section_id (for student scoping) ────────
CREATE OR REPLACE FUNCTION public.current_user_section_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS 
  SELECT section_id FROM public.users WHERE id = auth.uid();
;

-- ── Helper: get the current user's teacher_id (for teacher scoping) ────────
CREATE OR REPLACE FUNCTION public.current_user_teacher_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS 
  SELECT teacher_id FROM public.users WHERE id = auth.uid();
;

-- ══════════════════════════════════════════════════════════════════════════════
-- sections
-- Admin: full CRUD. Student/Teacher: read-only.
-- ══════════════════════════════════════════════════════════════════════════════
CREATE POLICY sections_admin_all ON public.sections
  FOR ALL
  TO authenticated
  USING      (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY sections_viewer_read ON public.sections
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() IN ('student', 'teacher'));

-- ══════════════════════════════════════════════════════════════════════════════
-- rooms
-- Admin: full CRUD. Student/Teacher: read-only.
-- ══════════════════════════════════════════════════════════════════════════════
CREATE POLICY rooms_admin_all ON public.rooms
  FOR ALL
  TO authenticated
  USING      (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY rooms_viewer_read ON public.rooms
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() IN ('student', 'teacher'));

-- ══════════════════════════════════════════════════════════════════════════════
-- teachers
-- Admin: full CRUD. Student/Teacher: read-only.
-- ══════════════════════════════════════════════════════════════════════════════
CREATE POLICY teachers_admin_all ON public.teachers
  FOR ALL
  TO authenticated
  USING      (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY teachers_viewer_read ON public.teachers
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() IN ('student', 'teacher'));

-- ══════════════════════════════════════════════════════════════════════════════
-- subjects
-- Admin: full CRUD. Student/Teacher: read-only.
-- ══════════════════════════════════════════════════════════════════════════════
CREATE POLICY subjects_admin_all ON public.subjects
  FOR ALL
  TO authenticated
  USING      (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY subjects_viewer_read ON public.subjects
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() IN ('student', 'teacher'));

-- ══════════════════════════════════════════════════════════════════════════════
-- timetables
-- Admin: full CRUD.
-- Student: read published timetable for their own section only (TRD.md §7).
-- Teacher: read any published timetable (they browse all sections).
-- ══════════════════════════════════════════════════════════════════════════════
CREATE POLICY timetables_admin_all ON public.timetables
  FOR ALL
  TO authenticated
  USING      (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY timetables_student_read ON public.timetables
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'student'
    AND status = 'published'
    AND section_id = public.current_user_section_id()
  );

CREATE POLICY timetables_teacher_read ON public.timetables
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'teacher'
    AND status = 'published'
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- timetable_entries
-- Admin: full CRUD.
-- Student: read entries belonging to their section's published timetable only.
-- Teacher: read entries where they are the assigned teacher (My lectures today)
--          plus all entries in any published timetable (full-section browse).
-- ══════════════════════════════════════════════════════════════════════════════
CREATE POLICY entries_admin_all ON public.timetable_entries
  FOR ALL
  TO authenticated
  USING      (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY entries_student_read ON public.timetable_entries
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'student'
    AND EXISTS (
      SELECT 1 FROM public.timetables t
      WHERE t.id = timetable_id
        AND t.status = 'published'
        AND t.section_id = public.current_user_section_id()
    )
  );

CREATE POLICY entries_teacher_read ON public.timetable_entries
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.timetables t
      WHERE t.id = timetable_id
        AND t.status = 'published'
    )
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- teacher_unavailability
-- Admin: full CRUD. Viewers: no access (scheduling concern only).
-- ══════════════════════════════════════════════════════════════════════════════
CREATE POLICY unavailability_admin_all ON public.teacher_unavailability
  FOR ALL
  TO authenticated
  USING      (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════════════════════════
-- users
-- Each user can read and update their own row only.
-- Admin can read all rows (needed for user management).
-- No user can write another user's row via RLS — only the service-role key
-- (used server-side only) can insert/update other users' rows.
-- ══════════════════════════════════════════════════════════════════════════════
CREATE POLICY users_own_row ON public.users
  FOR ALL
  TO authenticated
  USING      (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY users_admin_read_all ON public.users
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'admin');
