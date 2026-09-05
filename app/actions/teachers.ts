'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import Papa from 'papaparse';

const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.union([z.string().email(), z.literal('')]).nullable().optional().transform(e => e === '' ? null : e),
});

export async function getTeachers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('teachers').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function createTeacher(formData: FormData) {
  const supabase = await createClient();
  
  const parsed = teacherSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('teachers').insert(parsed.data);
  if (error) {
    if (error.code === '23505') return { error: 'A teacher with this email already exists.' };
    return { error: error.message };
  }

  revalidatePath('/dashboard/teachers');
  return { success: true };
}

export async function updateTeacher(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const parsed = teacherSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('teachers').update(parsed.data).eq('id', id);
  if (error) {
    if (error.code === '23505') return { error: 'A teacher with this email already exists.' };
    return { error: error.message };
  }

  revalidatePath('/dashboard/teachers');
  return { success: true };
}

export async function deleteTeacher(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  if (error) {
    if (error.code === '23503') return { error: 'Cannot delete teacher: assigned to existing subjects or timetables.' };
    return { error: error.message };
  }
  
  revalidatePath('/dashboard/teachers');
  return { success: true };
}

export async function importTeachersCsv(formData: FormData) {
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
    const email = row.email?.trim() || null;

    if (!name) {
      return { error: `Row ${i + 1}: Missing name.` };
    }

    rowsToInsert.push({ name, email });
  }

  if (rowsToInsert.length === 0) return { error: 'No data found in CSV.' };

  const supabase = await createClient();
  const { error } = await supabase.from('teachers').insert(rowsToInsert);
  
  if (error) {
    if (error.code === '23505') return { error: 'One or more teachers already exist (duplicate email).' };
    return { error: error.message };
  }

  revalidatePath('/dashboard/teachers');
  return { success: true, count: rowsToInsert.length };
}
