import { getRooms } from '@/app/actions/rooms';
import { RoomsClient } from './RoomsClient';

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  const rooms = await getRooms();
  return <RoomsClient initialData={rooms} />;
}
