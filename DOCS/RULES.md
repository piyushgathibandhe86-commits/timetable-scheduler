# RULES.md — Non-Negotiable Rules for AI Coding Agents
## Timetable Scheduler

These rules govern how any AI coding tool (Cursor, Claude Code, etc.) works on this codebase. They exist to prevent scope drift, silent breakage, and inconsistency across a project built incrementally across many sessions.

---

## General Rules

1. Read the relevant documentation (`PRD.md`, `TRD.md`, `APP_FLOW.md`, `DESIGN.md`, `SCHEMA.md`, `IMPLEMENTATION_PLAN.md`) before making changes — don't infer requirements from code alone.
2. Never invent requirements, screens, roles, or features not defined in these documents. If something seems missing, flag it rather than assuming.
3. Never change architecture (stack, database choice, API style) without explicit justification and approval — these were deliberately chosen in `TRD.md` for a beginner-friendly, single-college scope.
4. Never rewrite working functionality unnecessarily — a working feature is not a refactoring target unless asked.
5. Never delete existing functionality without explicit approval.
6. Never create duplicate components when an existing one (per `DESIGN.md` §6) can be reused — check `/components` before building a new table, modal, card, or button variant.
7. Follow the schema defined in `SCHEMA.md` exactly — field names, types, and constraints are not to be altered casually.
8. Follow the UI system defined in `DESIGN.md` — design tokens, component patterns, and screen specs are the single source of visual truth.
9. Follow the technical architecture defined in `TRD.md`.
10. Follow the implementation order defined in `IMPLEMENTATION_PLAN.md` — do not build Phase 8 before Phase 6 is tested and complete, even if it seems faster.

---

## Code Rules

- Keep code modular — one responsibility per file/module, matching the file layout in `IMPLEMENTATION_PLAN.md`.
- Use reusable components rather than one-off copies (per `DESIGN.md` §6).
- Avoid unnecessary dependencies — the stack in `TRD.md` §2 was chosen to minimize moving parts; adding a new library requires a real justification.
- Validate all user input server-side with `zod`, even if client-side validation also exists.
- Handle errors using the consistent JSON error shape defined in `TRD.md` §4 — don't invent a new error format per route.
- Never hardcode production data (real subjects, teachers, room names) into seed scripts or fixtures — use clearly fake placeholder data.
- Keep all secrets in environment variables, never in source code.
- Never expose the Supabase service-role key to the frontend — server-only usage only.
- Maintain consistent naming: database fields are `snake_case`, TypeScript variables/functions are `camelCase`, components are `PascalCase`.

---

## Database Rules

- Do not modify the schema casually or directly through the Supabase dashboard in a way that bypasses migrations.
- All schema changes go through versioned migration files (`supabase/migrations/`), per `SCHEMA.md` §9.
- Maintain all foreign key relationships defined in `SCHEMA.md` §4 — never orphan records.
- Do not duplicate data unnecessarily — `teacher_id` and `room_id` are denormalized onto `timetable_entries` deliberately (per `SCHEMA.md` §4) for substitution flexibility; this is the one intentional exception, not a pattern to repeat elsewhere.
- Protect destructive operations — deleting a room/teacher/subject that's referenced by existing `timetable_entries` must be blocked with a clear message (per `APP_FLOW.md` §6), never silently cascaded.

---

## Scheduling Rules

### Hard constraints (MUST never be violated, per `TRD.md` §5)

1. One teacher cannot teach two classes in the same period.
2. One room cannot host two classes simultaneously.
3. One section cannot have two subjects in the same period.
4. Fixed/unavailable slots (breaks, lunch, entries in `teacher_unavailability`) are never used for placement.
5. A `lab`-type subject can only be placed in a `lab`-type room — never in a `lecture`-type room (per `TRD.md` §5, `SCHEMA.md` §3).

Any code change touching the scheduling engine (`/lib/scheduler`) must be verified against the Vitest suite proving these four constraints hold under adversarial input before being considered complete (per `IMPLEMENTATION_PLAN.md` Phase 6).

### Soft constraints (optimized, may be relaxed if a valid full placement isn't otherwise possible)

1. Subjects with more required weekly hours are placed first (most-constrained-first).
2. A subject's periods are spread across different days before doubling up on one day.
3. A teacher's daily load is balanced — avoid 5+ consecutive periods when a lighter distribution is achievable.

Soft constraints may be relaxed to achieve a full placement; hard constraints may never be relaxed under any circumstance, including "the timetable will otherwise have unplaced classes." An unplaced-class result is always preferable to a hard-constraint violation.

---

## AI Agent Workflow

Every AI coding agent working on this project should, for every task:

1. Read the relevant `.md` files for the area being touched.
2. Understand the current implementation before changing it (read the actual code, not just the docs).
3. Identify the exact task — resist the urge to "improve" unrelated code along the way.
4. Make the smallest safe change that accomplishes the task.
5. Test the change (unit test for logic, manual/integration check for UI) before considering it done.
6. Report what changed clearly — which files, why, and what was tested.
7. Update `TRACKER.md` — mark the relevant phase/feature status, add a `Change Log` entry, log any new bugs found.
8. Never silently change files unrelated to the current task — if a fix elsewhere is genuinely needed, call it out explicitly rather than bundling it in.
