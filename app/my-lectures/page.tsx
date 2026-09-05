import { requireAuth } from '@/lib/auth';

/**
 * Teacher lectures view — Phase 10 will build the full UI.
 * This stub verifies teacher role redirect works.
 */
export default async function MyLecturesPage() {
  await requireAuth();

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--surface-page)', padding: '48px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 500, color: 'var(--text-primary)' }}>
            My Lectures Today
          </h1>
          <a
            href="/logout"
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              padding: '8px 16px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Sign out
          </a>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
          Teacher lectures view — coming in Phase 10.
        </p>
      </div>
    </main>
  );
}
