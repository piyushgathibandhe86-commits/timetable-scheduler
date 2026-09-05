import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * GET /logout
 * Signs the user out via Supabase Auth, clears the session cookie,
 * and redirects to /login.
 * Per APP_FLOW.md §3 — logout clears session and returns to login screen.
 */
export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
