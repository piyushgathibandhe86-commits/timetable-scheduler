import { createClient } from '@/lib/supabase/server';

type Subject = {
  id: string;
  name: string;
  section_id: string;
  teacher_id: string | null;
  type: 'lecture' | 'lab';
  weekly_hours: number;
};

export type TimetableSlot = {
  subject_id: string;
  section_id: string;
  teacher_id: string | null;
  room_id: string;
  day_of_week: number;
  period_number: number;
};

export async function generateTimetable(name: string, startDate: string, endDate: string) {
  const supabase = await createClient();

  // 1. Fetch Master Data
  const { data: subjects, error: subErr } = await supabase.from('subjects').select('*');
  const { data: rooms, error: roomErr } = await supabase.from('rooms').select('*');

  if (subErr) throw new Error(`Failed to fetch subjects: ${subErr.message}`);
  if (roomErr) throw new Error(`Failed to fetch rooms: ${roomErr.message}`);
  
  if (!subjects || subjects.length === 0) throw new Error('No subjects found to schedule.');
  if (!rooms || rooms.length === 0) throw new Error('No rooms available for scheduling.');

  // 2. Prepare Tasks (Lessons)
  const lessons: Subject[] = [];
  for (const sub of subjects) {
    for (let i = 0; i < sub.weekly_hours; i++) {
      lessons.push(sub);
    }
  }

  // Sort lessons: Labs first (fewer rooms usually), then subjects with teachers (more constraints)
  lessons.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'lab' ? -1 : 1;
    if (a.teacher_id && !b.teacher_id) return -1;
    if (!a.teacher_id && b.teacher_id) return 1;
    return 0;
  });

  // 3. Initialize Constraint Matrices
  const DAYS = 6;
  const PERIODS = 8;

  // We map (day, period) to a 1D index: (day - 1) * PERIODS + (period - 1)
  // Maps keep track of occupied slots: id -> Set<number>
  const sectionSchedule = new Map<string, Set<number>>();
  const teacherSchedule = new Map<string, Set<number>>();
  const roomSchedule = new Map<string, Set<number>>();
  
  // Track daily distribution to prevent putting all weekly hours on the same day if possible
  // section_subject_id -> day -> count
  const subjectDailyCount = new Map<string, Map<number, number>>();

  // Initialize sets
  for (const sub of subjects) {
    if (!sectionSchedule.has(sub.section_id)) sectionSchedule.set(sub.section_id, new Set());
    if (sub.teacher_id && !teacherSchedule.has(sub.teacher_id)) teacherSchedule.set(sub.teacher_id, new Set());
    subjectDailyCount.set(sub.id, new Map());
  }
  for (const r of rooms) {
    roomSchedule.set(r.id, new Set());
  }

  const resultSlots: TimetableSlot[] = [];

  // Group rooms by type for fast lookup
  const roomsByType = {
    lecture: rooms.filter(r => r.type === 'lecture'),
    lab: rooms.filter(r => r.type === 'lab'),
  };

  // 4. Backtracking Solver
  let iterations = 0;
  const MAX_ITERATIONS = 500000; // Safety catch to prevent infinite loops on Vercel/Node

  function solve(lessonIndex: number): boolean {
    if (lessonIndex === lessons.length) return true; // All scheduled
    
    iterations++;
    if (iterations > MAX_ITERATIONS) return false;

    const lesson = lessons[lessonIndex];
    const validRooms = roomsByType[lesson.type];
    if (validRooms.length === 0) return false;

    // To ensure a good spread, we should iterate over days and periods, 
    // but prefer days where this subject hasn't been taught much yet.
    // For simplicity, we just iterate chronologically, but enforce a soft limit.
    const subDaily = subjectDailyCount.get(lesson.id)!;
    const maxPerDayLimit = Math.max(1, Math.ceil(lesson.weekly_hours / DAYS));

    for (let day = 1; day <= DAYS; day++) {
      const currentDayCount = subDaily.get(day) || 0;
      // Heuristic: Try not to exceed the ideal daily limit
      if (currentDayCount >= maxPerDayLimit) continue;

      for (let period = 1; period <= PERIODS; period++) {
        const timeIndex = (day - 1) * PERIODS + (period - 1);

        // Check Section constraint
        if (sectionSchedule.get(lesson.section_id)!.has(timeIndex)) continue;
        
        // Check Teacher constraint
        if (lesson.teacher_id && teacherSchedule.get(lesson.teacher_id)!.has(timeIndex)) continue;

        // Try placing in a valid room
        for (const room of validRooms) {
          if (roomSchedule.get(room.id)!.has(timeIndex)) continue;

          // -- PLACE --
          sectionSchedule.get(lesson.section_id)!.add(timeIndex);
          if (lesson.teacher_id) teacherSchedule.get(lesson.teacher_id)!.add(timeIndex);
          roomSchedule.get(room.id)!.add(timeIndex);
          subDaily.set(day, currentDayCount + 1);

          resultSlots[lessonIndex] = {
            subject_id: lesson.id,
            section_id: lesson.section_id,
            teacher_id: lesson.teacher_id,
            room_id: room.id,
            day_of_week: day,
            period_number: period
          };

          // -- RECURSE --
          if (solve(lessonIndex + 1)) return true;

          // -- BACKTRACK --
          sectionSchedule.get(lesson.section_id)!.delete(timeIndex);
          if (lesson.teacher_id) teacherSchedule.get(lesson.teacher_id)!.delete(timeIndex);
          roomSchedule.get(room.id)!.delete(timeIndex);
          subDaily.set(day, currentDayCount);
        }
      }
    }

    // If we exhaust and fail, it might be due to our soft heuristic maxPerDayLimit.
    // In a real robust engine, we might do a second pass without the heuristic, but for MVP this is okay.
    return false;
  }

  const success = solve(0);

  if (!success) {
    if (iterations > MAX_ITERATIONS) {
      throw new Error('Scheduling timed out. The constraints might be too complex or impossible to satisfy.');
    }
    throw new Error('Could not find a conflict-free schedule. Please check if you have enough rooms and teachers, or if teachers are double-booked.');
  }

  // 5. Save to Database
  // Create timetable header
  const { data: timetable, error: ttErr } = await supabase
    .from('timetables')
    .insert({
      name,
      start_date: startDate,
      end_date: endDate,
      status: 'draft'
    })
    .select('id')
    .single();

  if (ttErr || !timetable) {
    throw new Error(`Failed to create timetable record: ${ttErr?.message}`);
  }

  // Attach timetable_id to all slots
  const dbSlots = resultSlots.map(slot => ({
    ...slot,
    timetable_id: timetable.id
  }));

  // Batch insert slots
  const { error: slotErr } = await supabase.from('timetable_slots').insert(dbSlots);
  if (slotErr) {
    // Attempt rollback (soft rollback by just throwing, RLS or cascading might not cover this if we just throw, 
    // but a proper implementation would use Postgres functions for atomic transactions. We'll throw for now).
    await supabase.from('timetables').delete().eq('id', timetable.id);
    throw new Error(`Failed to save slots: ${slotErr.message}`);
  }

  return { success: true, timetableId: timetable.id, totalSlots: dbSlots.length };
}
