'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import Papa from 'papaparse';

const roomSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['lecture', 'lab']),
  capacity: z.number().int().positive().nullable().optional(),
});

export async function getRooms() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('rooms').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function createRoom(formData: FormData) {
  const supabase = await createClient();
  
  const parsed = roomSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string, 10) : null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('rooms').insert(parsed.data);
  if (error) {
    if (error.code === '23505') return { error: 'A room with this name already exists.' };
    return { error: error.message };
  }

  revalidatePath('/dashboard', 'layout');
  return { success: true };
}

export async function updateRoom(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const parsed = roomSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string, 10) : null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('rooms').update(parsed.data).eq('id', id);
  if (error) {
    if (error.code === '23505') return { error: 'A room with this name already exists.' };
    return { error: error.message };
  }

  revalidatePath('/dashboard', 'layout');
  return { success: true };
}

export async function deleteRoom(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) {
    if (error.code === '23503') return { error: 'Cannot delete room: it is currently scheduled in a timetable.' };
    return { error: error.message };
  }
  
  revalidatePath('/dashboard', 'layout');
  return { success: true };
}

export async function importRoomsCsv(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { error: 'No file provided.' };

  const text = await file.text();
  const { data, errors } = Papa.parse(text, { header: true, skipEmptyLines: true });

  if (errors.length > 0) {
    return { error: 'Invalid CSV format.' };
  }

  const rowsToInsert = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i] as Record<string, string>;
    const name = row.name?.trim();
    const type = row.type?.trim().toLowerCase();
    const capacity = row.capacity ? parseInt(row.capacity, 10) : null;

    if (!name || !type) {
      return { error: `Row ${i + 1}: Missing name or type.` };
    }
    if (type !== 'lecture' && type !== 'lab') {
      return { error: `Row ${i + 1}: Type must be lecture or lab.` };
    }

    rowsToInsert.push({ name, type, capacity });
  }

  if (rowsToInsert.length === 0) return { error: 'No data found in CSV.' };

  const supabase = await createClient();
  const { error } = await supabase.from('rooms').insert(rowsToInsert);
  
  if (error) {
    if (error.code === '23505') return { error: 'One or more rooms already exist in the database.' };
    return { error: error.message };
  }

  revalidatePath('/dashboard', 'layout');
  return { success: true, count: rowsToInsert.length };
}
