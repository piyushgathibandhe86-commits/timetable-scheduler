'use client';

/**
 * Login page — DESIGN.md §7
 * Centered card (max-w-[400px]) on --surface-page background.
 * States: default | loading (spinner + "Signing in...") | error (inline red text)
 * On success: redirect to role home per APP_FLOW.md §3.
 *
 * Client Component: manages form state, calls Supabase browser client,
 * then fetches role via /api/auth/me and redirects.
 */

import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

const ROLE_HOME: Record<string, string> = {
  admin:   '/dashboard',
  student: '/my-timetable',
  teacher: '/my-lectures',
};

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Sign in via Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError || !authData.user) {
        // APP_FLOW.md §3: retain entered email, show inline error
        setError('Incorrect email or password.');
        return;
      }

      // 2. Fetch role from public.users
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      const role = profile?.role ?? 'student';
      const home = ROLE_HOME[role] ?? '/my-timetable';

      // 3. Hard redirect so middleware picks up the new session cookie
      window.location.href = home;

    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--surface-page)' }}
    >
      <div
        className="w-full rounded-lg p-8"
        style={{
          maxWidth: '400px',
          backgroundColor: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {/* App name */}
        <h1
          className="mb-2"
          style={{
            fontSize: '28px',
            fontWeight: 500,
            lineHeight: 1.3,
            color: 'var(--text-primary)',
          }}
        >
          Timetable Scheduler
        </h1>
        <p
          className="mb-8"
          style={{ fontSize: '15px', color: 'var(--text-secondary)' }}
        >
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="you@college.edu"
              style={{
                display: 'block',
                width: '100%',
                height: '40px',
                padding: '0 12px',
                fontSize: '15px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              style={{
                display: 'block',
                width: '100%',
                height: '40px',
                padding: '0 12px',
                fontSize: '15px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Error message — APP_FLOW.md §3 */}
          {error && (
            <p
              role="alert"
              style={{
                fontSize: '13px',
                color: 'var(--danger)',
                marginBottom: '16px',
                padding: '10px 12px',
                backgroundColor: 'var(--danger-muted)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {error}
            </p>
          )}

          {/* Submit — DESIGN.md §6 primary button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              height: '40px',
              fontSize: '15px',
              fontWeight: 500,
              color: '#FFFFFF',
              backgroundColor: loading ? 'var(--accent)' : 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading && (
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#FFFFFF',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  flexShrink: 0,
                }}
              />
            )}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      {/* Spinner keyframe — scoped, no external dep (DESIGN.md §6) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
