import { getRooms } from '@/app/actions/rooms';
import { getTeachers } from '@/app/actions/teachers';
import { getSections } from '@/app/actions/sections';
import { getSubjects } from '@/app/actions/subjects';
import { WizardFlow } from '@/components/setup/WizardFlow';

export const dynamic = 'force-dynamic';

export default async function SetupWizardPage() {
  const [rooms, teachers, sections, subjects] = await Promise.all([
    getRooms(),
    getTeachers(),
    getSections(),
    getSubjects(),
  ]);

  return <WizardFlow rooms={rooms} teachers={teachers} sections={sections} subjects={subjects} />;
}
