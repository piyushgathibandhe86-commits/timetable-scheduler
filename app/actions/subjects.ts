'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import Papa from 'papaparse';

const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['lecture', 'lab']),
  weekly_hours: z.number().int().min(1).max(40),
  section_id: z.string().uuid('Section is required'),
  teacher_id: z.string().uuid().nullable().optional(),
});

export async function getSubjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subjects')
    .select('*, section:sections(name), teacher:teachers(name)')
    .order('name');
    
  if (error) throw new Error(error.message);
  return data;
}

export async function createSubject(formData: FormData) {
  const supabase = await createClient();
  
  const teacherVal = formData.get('teacher_id');
  
  const parsed = subjectSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    weekly_hours: parseInt(formData.get('weekly_hours') as string, 10),
    section_id: formData.get('section_id'),
    teacher_id: teacherVal ? teacherVal : null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('subjects').insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/subjects');
  return { success: true };
}

export async function updateSubject(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const teacherVal = formData.get('teacher_id');

  const parsed = subjectSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    weekly_hours: parseInt(formData.get('weekly_hours') as string, 10),
    section_id: formData.get('section_id'),
    teacher_id: teacherVal ? teacherVal : null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('subjects').update(parsed.data).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/subjects');
  return { success: true };
}

export async function deleteSubject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) {
    if (error.code === '23503') return { error: 'Cannot delete subject: it is currently scheduled in a timetable.' };
    return { error: error.message };
  }
  
  revalidatePath('/dashboard/subjects');
  return { success: true };
}

export async function importSubjectsCsv(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { error: 'No file provided.' };

  const text = await file.text();
  const { data, errors } = Papa.parse(text, { header: true, skipEmptyLines: true });

  if (errors.length > 0) return { error: 'Invalid CSV format.' };
  if (data.length === 0) return { error: 'No data found in CSV.' };

  const supabase = await createClient();
  
  // Fetch existing sections and teachers for resolution
  const { data: sections } = await supabase.from('sections').select('id, name');
  const { data: teachers } = await supabase.from('teachers').select('id, email');
  
  if (!sections) return { error: 'Failed to load sections for resolution.' };
  
  const sectionMap = new Map(sections.map(s => [s.name.toLowerCase(), s.id]));
  const teacherMap = new Map(teachers?.map(t => [t.email?.toLowerCase(), t.id]));

  const rowsToInsert = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i] as Record<string, string>;
    const name = row.name?.trim();
    const type = row.type?.trim().toLowerCase();
    const weekly_hours = parseInt(row.weekly_hours, 10);
    const section_name = row.section_name?.trim();
    const teacher_email = row.teacher_email?.trim() || null;

    if (!name || !type || isNaN(weekly_hours) || !section_name) {
      return { error: `Row ${i + 1}: Missing or invalid name, type, weekly_hours, or section_name.` };
    }
    if (type !== 'lecture' && type !== 'lab') {
      return { error: `Row ${i + 1}: Type must be lecture or lab.` };
    }

    const section_id = sectionMap.get(section_name.toLowerCase());
    if (!section_id) {
      return { error: `Row ${i + 1}: Section '${section_name}' not found in database.` };
    }

    let teacher_id = null;
    if (teacher_email) {
      teacher_id = teacherMap.get(teacher_email.toLowerCase());
      if (!teacher_id) {
        return { error: `Row ${i + 1}: Teacher with email '${teacher_email}' not found in database.` };
      }
    }

    rowsToInsert.push({ name, type, weekly_hours, section_id, teacher_id });
  }

  const { error } = await supabase.from('subjects').insert(rowsToInsert);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/subjects');
  return { success: true, count: rowsToInsert.length };
}
