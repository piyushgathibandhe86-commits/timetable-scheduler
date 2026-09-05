'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import Papa from 'papaparse';

const sectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export async function getSections() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('sections').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function createSection(formData: FormData) {
  const supabase = await createClient();
  
  const parsed = sectionSchema.safeParse({
    name: formData.get('name'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('sections').insert(parsed.data);
  if (error) {
    if (error.code === '23505') return { error: 'A section with this name already exists.' };
    return { error: error.message };
  }

  revalidatePath('/dashboard/sections');
  return { success: true };
}

export async function updateSection(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const parsed = sectionSchema.safeParse({
    name: formData.get('name'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('sections').update(parsed.data).eq('id', id);
  if (error) {
    if (error.code === '23505') return { error: 'A section with this name already exists.' };
    return { error: error.message };
  }

  revalidatePath('/dashboard/sections');
  return { success: true };
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('sections').delete().eq('id', id);
  if (error) {
    if (error.code === '23503') return { error: 'Cannot delete section: it has associated subjects or users.' };
    return { error: error.message };
  }
  
  revalidatePath('/dashboard/sections');
  return { success: true };
}

export async function importSectionsCsv(formData: FormData) {
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

    if (!name) {
      return { error: `Row ${i + 1}: Missing name.` };
    }

    rowsToInsert.push({ name });
  }

  if (rowsToInsert.length === 0) return { error: 'No data found in CSV.' };

  const supabase = await createClient();
  const { error } = await supabase.from('sections').insert(rowsToInsert);
  
  if (error) {
    if (error.code === '23505') return { error: 'One or more sections already exist.' };
    return { error: error.message };
  }

  revalidatePath('/dashboard/sections');
  return { success: true, count: rowsToInsert.length };
}
