import { getSections } from '@/app/actions/sections';
import { SectionsClient } from './SectionsClient';

export const dynamic = 'force-dynamic';

export default async function SectionsPage() {
  const sections = await getSections();
  return <SectionsClient initialData={sections} />;
}
