export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '16px' }}>
        Dashboard
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
        Welcome to the admin dashboard. Use the sidebar to navigate to master data setup and timetable generation.
      </p>
    </div>
  );
}
