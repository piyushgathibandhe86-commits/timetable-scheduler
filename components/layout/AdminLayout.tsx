'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, DoorOpen, Users, BookOpen, Layers, Settings, Calendar } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/rooms', label: 'Rooms', icon: DoorOpen },
  { href: '/dashboard/teachers', label: 'Teachers', icon: Users },
  { href: '/dashboard/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/dashboard/sections', label: 'Sections', icon: Layers },
  { href: '/dashboard/setup', label: 'Setup Wizard', icon: Settings },
  { href: '/dashboard/timetable', label: 'Timetable', icon: Calendar },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = navItems.find((item) => item.href === pathname)?.label || 'Dashboard';

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--surface-page)' }}>
      {/* Mobile Header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-40"
        style={{ backgroundColor: 'var(--surface-card)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="p-1">
            <Menu size={24} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {currentPage}
          </span>
        </div>
        <Link href="/logout" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Sign out
        </Link>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--surface-card)', borderRight: '1px solid var(--border)' }}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Timetable Scheduler
          </span>
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1">
            <X size={24} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                style={{
                  backgroundColor: isActive ? 'var(--accent-muted)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 hidden md:block">
          <Link
            href="/logout"
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full"
            style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-muted)' }}
          >
            Sign out
          </Link>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pt-14 md:pt-0 overflow-x-hidden">
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
