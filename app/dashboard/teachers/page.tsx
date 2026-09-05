import { getTeachers } from '@/app/actions/teachers';
import { TeachersClient } from './TeachersClient';

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  const teachers = await getTeachers();
  return <TeachersClient initialData={teachers} />;
}
