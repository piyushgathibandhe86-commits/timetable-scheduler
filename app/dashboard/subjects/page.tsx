import { getSubjects } from '@/app/actions/subjects';
import { getSections } from '@/app/actions/sections';
import { getTeachers } from '@/app/actions/teachers';
import { SubjectsClient } from './SubjectsClient';

export const dynamic = 'force-dynamic';

export default async function SubjectsPage() {
  const [subjects, sections, teachers] = await Promise.all([
    getSubjects(),
    getSections(),
    getTeachers(),
  ]);
  
  return <SubjectsClient initialData={subjects} sections={sections} teachers={teachers} />;
}
