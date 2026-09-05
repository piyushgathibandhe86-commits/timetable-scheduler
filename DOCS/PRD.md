# PRD: Generic Timetable Scheduler

## 1. Problem Statement
Colleges and departments build weekly class timetables manually, juggling constraints across subjects, teachers, and rooms to avoid double-booking. This is typically done in spreadsheets, is time-consuming, error-prone, and has to be redone every semester. Students and admins have no live way to view or adjust changes to a shared schedule.

- **Who experiences this**: college administrative staff/HODs who build timetables, and students/teachers who consume them.
- **Why now**: manual timetabling doesn't scale as subject/section counts grow, and existing institutional systems are often rigid, dated, or opaque to build on.

## 2. Target User
- **Primary**: a college admin or HOD who sets up a department's subjects, teachers, rooms, and time slots each semester and needs a conflict-free timetable fast.
- **Secondary**: students/teachers who just need to view their current timetable on any device.
- **Goals**: minimize manual conflict-checking, generate a usable draft quickly, tweak it without breaking things.
- **Frustrations**: spreadsheet errors, double-booked teachers/rooms, re-doing the whole grid for one small change.

## 3. Core Features (MVP Only)

1. **Real authentication with roles** — admin and student/viewer logins via email (Supabase Auth). Admins can create/edit; students/teachers get read-only access to their section's timetable.
2. **Data setup via CSV import** — admins bulk-upload subjects, teachers, rooms, and constraints (fixed slots, weekly hour requirements) instead of manual form entry for every row.
3. **Auto-generate engine** — a backtracking/graph-based algorithm assigns all classes into a clash-free weekly grid, respecting teacher/room/section constraints.
4. **Dashboard timetable view** — a clean weekly grid (Mon–Fri × time slots), color-coded by subject, viewable by role/section.
5. **Manual edit with live conflict checks** — admins can drag-and-drop a class to a new slot; any resulting teacher/room clash is caught instantly (hash-map lookup) and blocked with a clear message.

**Nice to have (not required for launch):**
- Export to PDF/print
- Email/notification on timetable changes
- Multi-department/multi-college workspace switching
- Analytics on room/teacher utilization

## 4. Out of Scope (v1)
- Mobile native apps (web-responsive only)
- Automatic timetable publishing to external college systems
- Payment/monetization of any kind
- AI-based "smart suggestions" beyond the backtracking algorithm
- Multi-language support
- Real-time collaborative editing (two admins editing simultaneously)

## 5. Success Metrics
- **Generation success rate**: % of setups where the auto-generate engine places 100% of classes with zero conflicts (target: >90% for realistic constraint sets).
- **Time to first usable timetable**: from CSV upload to a viewable, conflict-free grid (target: under 2 minutes).
- **Manual edit conflict-catch rate**: % of invalid drag-and-drop edits correctly blocked before being saved (target: 100% — this is a correctness bar, not a soft metric).

## 6. Technical Assumptions
- **Stack**: Next.js + TypeScript (frontend + API routes in one repo — Cursor-friendly, single deploy target)
- **Database/Auth**: Supabase (Postgres + built-in auth, real login support out of the box)
- **Scheduling logic**: hand-written TypeScript module implementing backtracking + graph/hashmap conflict detection — kept isolated from UI code for clarity and reuse
- **Platform**: Web only, responsive for mobile browsers
- **Deployment**: Vercel (pairs natively with Next.js, free tier sufficient for a college-scale project)
- **Integrations**: Supabase Auth (email login) at minimum; no payment integration needed

## 7. Open Questions

**Resolved during later planning (kept here for history):**
- ~~Single institution vs multi-college~~ → **Resolved**: single college, single-tenant scope for v1 (`TRD.md` §1).
- ~~Room type as hard constraint~~ → **Resolved**: yes — a `lab`-type subject must be placed in a `lab`-type room; this is a hard constraint the engine never relaxes (`TRD.md` §5, `RULES.md`).
- ~~How unplaced classes get resolved~~ → **Resolved**: surfaced to the admin as an unplaced list; resolved manually via drag-and-drop onto the grid (`APP_FLOW.md` §9).

**Still open:**
1. What exactly counts as a "conflict" beyond teacher/room/section double-booking and lab/room-type mismatch — e.g. does a section have a max classes-per-day cap, or explicit lunch-break enforcement beyond treating it as a non-schedulable row?
2. What's the CSV format/template — do you design it, or should the app also let admins map arbitrary column headers to fields? (Carried in `TRACKER.md` Open Questions as needing resolution before Phase 3.)
