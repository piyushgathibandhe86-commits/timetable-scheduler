import { requireAdmin } from '@/lib/auth';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminLayout>{children}</AdminLayout>;
}
