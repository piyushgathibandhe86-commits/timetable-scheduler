import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/** Role-to-home-screen mapping per APP_FLOW.md §2 */
export const ROLE_HOME = {
  admin:   '/dashboard',
  student: '/my-timetable',
  teacher: '/my-lectures',
} as const;

export type UserRole = keyof typeof ROLE_HOME;

/**
 * Returns the authenticated Supabase auth user, or null.
 * Always uses getUser() (not getSession()) — validates the token server-side.
 */
export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Returns the user's row from public.users (contains the role field).
 * Returns null if no session or no matching row yet.
 */
export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, full_name, role, section_id, teacher_id')
    .eq('id', user.id)
    .single();

  return profile;
}

/**
 * Returns the current user's role, or null if unauthenticated / no profile row.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile();
  if (!profile) return null;
  return profile.role as UserRole;
}

/**
 * Server-side guard: redirects to /login if not authenticated.
 * Use at the top of Server Components that require a session.
 */
export async function requireAuth() {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
}

/**
 * Server-side guard: redirects to role home if not admin.
 * Use in admin-only Server Components as a belt-and-suspenders check
 * (middleware already handles this, but defense-in-depth per TRD.md §7).
 */
export async function requireAdmin() {
  const user = await requireAuth();
  const role = await getUserRole();
  if (role !== 'admin') {
    redirect(ROLE_HOME[role ?? 'student']);
  }
  return user;
}
