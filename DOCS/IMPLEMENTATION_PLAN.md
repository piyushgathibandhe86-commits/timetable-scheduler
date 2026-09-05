# IMPLEMENTATION_PLAN.md — Development Roadmap
## Timetable Scheduler

Source of truth: `PRD.md`, `TRD.md`, `APP_FLOW.md`, `DESIGN.md`, `SCHEMA.md`. Each phase is scoped to be small enough to build and test safely in one AI-coding-tool session — do not instruct Cursor to build multiple phases at once.

---

## Phase 0 — Project Setup

- **Objective**: a running, empty Next.js app connected to Supabase, deployed to Vercel with a working preview environment.
- **Features**: project scaffold, Supabase client config, environment variables, base Tailwind/design tokens from `DESIGN.md` §4.
- **Files/modules**: `next.config`, `.env.local`, `/lib/supabase.ts`, `tailwind.config` (tokens as CSS variables per `DESIGN.md`)
- **Dependencies**: none
- **Tasks**: init Next.js (App Router, TS), install Tailwind + Supabase client, connect to a Supabase project, push first empty deploy to Vercel, confirm preview deployments work on a test PR
- **Testing**: manual — app loads, deploys, preview URL generated
- **Definition of Done**: empty app live on a Vercel preview URL, Supabase connected

---

## Phase 1 — Database & Schema

- **Objective**: all tables from `SCHEMA.md` exist with constraints and indexes applied.
- **Features**: migrations for every table in `SCHEMA.md` §3, indexes (§5), constraints (§6).
- **Files/modules**: `supabase/migrations/*.sql`
- **Dependencies**: Phase 0
- **Tasks**: write migrations in the order specified in `SCHEMA.md` §9, apply to dev Supabase project, verify constraints reject invalid inserts manually
- **Testing**: manual SQL smoke tests (insert valid/invalid rows, confirm constraint behavior)
- **Definition of Done**: full schema live in dev environment, constraints verified

---

## Phase 2 — Authentication

- **Objective**: working login/logout with role-based redirect.
- **Features**: login screen (`DESIGN.md` §7), Supabase Auth integration, `users` table role lookup, redirect logic per `APP_FLOW.md` §3.
- **Files/modules**: `/app/login`, `/lib/auth.ts`, middleware for session/role checks
- **Dependencies**: Phase 1
- **Tasks**: build login UI, wire Supabase Auth sign-in, create a `users` row on first login (role assignment handled manually in dev for now — an admin-invite flow is not in v1 scope), implement role-based redirect, implement logout, implement session-expiry redirect
- **Testing**: unit test the redirect-by-role logic; manual test of invalid login, logout, expired session
- **Definition of Done**: all four flows in `APP_FLOW.md` §3 work end-to-end

---

## Phase 3 — Master Data: Rooms & Teachers

- **Objective**: full CRUD + CSV import for the two simplest entities, establishing the reusable pattern.
- **Features**: list/add/edit/delete for `rooms` and `teachers` (`APP_FLOW.md` §6, `DESIGN.md` §7)
- **Files/modules**: `/app/rooms`, `/app/teachers`, `/lib/validation/rooms.ts`, `/lib/validation/teachers.ts` (zod schemas), shared `CsvImport` component
- **Dependencies**: Phase 2 (admin-only routes need auth)
- **Tasks**: build reusable table + modal components per `DESIGN.md` §6, implement CSV import with row-level validation, implement delete-blocked-if-in-use check (stub — real "in use" check completes once `timetable_entries` exists in Phase 6)
- **Testing**: unit tests for zod validation and CSV row parsing; integration test for create/edit/delete API routes
- **Definition of Done**: rooms and teachers fully manageable, CSV import working with correct error handling

---

## Phase 4 — Master Data: Subjects & Sections

- **Objective**: extend the Phase 3 pattern to the two entities with relationships.
- **Features**: list/add/edit/delete for `sections` and `subjects` (including `weekly_hours`, `type`, `teacher_id` linkage)
- **Files/modules**: `/app/sections`, `/app/subjects`, `/lib/validation/subjects.ts`, `/lib/validation/sections.ts`
- **Dependencies**: Phase 3 (subjects reference teachers)
- **Tasks**: build forms with relational selects (subject → section, subject → teacher), reuse table/modal/CSV components from Phase 3
- **Testing**: unit tests for validation; integration test confirming a subject can't be created without a valid `section_id`/`teacher_id`
- **Definition of Done**: full master data set (rooms, teachers, subjects, sections) manageable

---

## Phase 5 — Setup Wizard

- **Objective**: guided first-time flow wrapping Phases 3–4's components into the linear sequence from `APP_FLOW.md` §4.
- **Features**: step indicator, step-gating logic, review step, redirect-to-wizard-if-empty logic
- **Files/modules**: `/app/setup/[step]`, `/lib/setup-status.ts`
- **Dependencies**: Phase 4
- **Tasks**: build step shell reusing Phase 3/4 forms inside each step, implement "advance only when step valid" gating, implement auto-redirect for first-time admins per `APP_FLOW.md` §4 and §12
- **Testing**: integration test simulating a full wizard run; test that returning admins skip the wizard
- **Definition of Done**: new admin can go from empty account to fully-entered master data via the guided flow

---

## Phase 6 — Scheduling Engine (core, isolated)

- **Objective**: the standalone TypeScript scheduling engine, fully unit-tested in isolation before any UI touches it. This is the highest-priority phase technically (TRD §5, §12).
- **Features**: backtracking placement, most-constrained-first subject ordering, hashmap conflict checking, spread/balance soft constraints, partial-result handling for unplaceable classes
- **Files/modules**: `/lib/scheduler/engine.ts`, `/lib/scheduler/conflicts.ts`, `/lib/scheduler/types.ts`
- **Dependencies**: none on UI — can be built and tested using fixture data before Phase 3–5 even finish, if desired, but scheduled here since it needs real subject/teacher/room shapes from `SCHEMA.md`
- **Tasks**: implement the engine as a pure function `generate(subjects, teachers, rooms, existingLockedEntries, constraints) => { placed, unplaced }`; implement the shared conflict-check function reused later by manual editing (Phase 8)
- **Testing**: this phase does not proceed to Phase 7 until Vitest suite proves: no hard constraint ever violated (adversarial fixture with over-tight constraints), most-constrained-first ordering behaves as specified, partial-result shape is correct when generation can't fully complete
- **Definition of Done**: engine passes its full test suite with zero manual verification needed

---

## Phase 7 — Generate Flow (UI + API)

- **Objective**: wire the engine into a real API route and the Generate screen.
- **Features**: Generate screen (`DESIGN.md` §7), `POST /api/timetable/generate` (TRD §6), data-completeness validation before calling the engine, transactional save of results (TRD §8)
- **Files/modules**: `/app/timetable/[sectionId]/generate`, `/app/api/timetable/generate/route.ts`
- **Dependencies**: Phase 5 (needs master data), Phase 6 (needs engine)
- **Tasks**: build mode-selection UI, call engine via API route, save `timetables` + `timetable_entries` rows in a single transaction, return placed/unplaced summary to the frontend
- **Testing**: integration test for the full generate → save → fetch round trip; test the incomplete-data validation blocks generation correctly
- **Definition of Done**: admin can generate a real timetable end-to-end for a section with real master data

---

## Phase 8 — Review/Edit Grid (drag-and-drop + conflict resolution)

- **Objective**: the core visual grid with manual editing and unplaced-class resolution.
- **Features**: timetable grid component (`DESIGN.md` §8), drag-and-drop editing (`APP_FLOW.md` §8), unplaced-class panel + drag-to-resolve (`APP_FLOW.md` §9), `PATCH /api/timetable/entries/:id`
- **Files/modules**: `/app/timetable/[sectionId]/review`, `/components/TimetableGrid.tsx`, `/components/SubjectCard.tsx`, `/app/api/timetable/entries/[id]/route.ts`
- **Dependencies**: Phase 7
- **Tasks**: build the grid layout per `DESIGN.md` §8, implement drag-and-drop (desktop) reusing the Phase 6 conflict-check function via the API, implement tap-to-select fallback for touch (`DESIGN.md` §9), render unplaced panel and wire its drag-to-place interaction
- **Testing**: integration test for the edit API route's conflict rejection; Playwright E2E for the core path (drag a class → see it move; drag an unplaced class into a slot → it resolves)
- **Definition of Done**: admin can fully resolve any generation result into a conflict-free grid using only the UI

---

## Phase 9 — Publish Flow

- **Objective**: unpublish/publish state machine and viewer visibility.
- **Features**: Publish/Unpublish actions with confirmation modals (`DESIGN.md` §7), publish-blocked-if-unplaced rule (`APP_FLOW.md` §10), `POST /api/timetable/publish`, `POST /api/timetable/unpublish`
- **Files/modules**: `/app/api/timetable/publish/route.ts`, `/app/api/timetable/unpublish/route.ts`, publish confirmation modal component
- **Dependencies**: Phase 8
- **Tasks**: implement both status transitions (`draft → published` with the blocking check, `published → draft` unconditionally) and their API routes, wire confirmation modals for both actions, update status badges across dashboard/grid
- **Testing**: integration test confirming publish is blocked with unplaced classes present and succeeds once resolved
- **Definition of Done**: full unpublish → edit → publish cycle works and is reflected in viewer-facing screens

---

## Phase 10 — Viewer Screens (Student & Teacher)

- **Objective**: read-only experiences for both viewer roles.
- **Features**: section selector (Student), "My lectures today" (Teacher), full-grid browsing (Teacher), RLS-enforced read scoping (TRD §7)
- **Files/modules**: `/app/my-timetable` (student), `/app/my-lectures` (teacher), reused `TimetableGrid` in read-only mode
- **Dependencies**: Phase 9 (only published timetables should be visible)
- **Tasks**: build section selector, build teacher's filtered lecture-list view (`DESIGN.md` §7), apply RLS policies restricting reads to each role's scope, reuse the grid component in a non-interactive mode
- **Testing**: integration test verifying a student cannot read another section's data (RLS enforcement); manual test of both viewer journeys end-to-end
- **Definition of Done**: both `APP_FLOW.md` §13 viewer journeys work correctly and securely

---

## Phase 11 — Export

- **Objective**: printable/downloadable view of any grid.
- **Features**: export view (`DESIGN.md` §7, `APP_FLOW.md` §11)
- **Files/modules**: `/app/timetable/[sectionId]/export`, print stylesheet
- **Dependencies**: Phase 8 (needs a working grid to render)
- **Tasks**: build a chrome-free print layout, wire print/download trigger
- **Testing**: manual — verify print output fits one page width per section
- **Definition of Done**: any role can export/print their visible timetable

---

## Phase 12 — Testing Hardening & Deployment

- **Objective**: close testing gaps and confirm production readiness.
- **Features**: fill any remaining unit/integration test gaps per `TRD.md` §12, finalize RLS policies, production environment variables
- **Files/modules**: test suite across all `/lib` and `/app/api` modules
- **Dependencies**: all prior phases
- **Tasks**: run full regression pass, verify production Supabase project has correct RLS and no dev-only data, final Vercel production deploy
- **Testing**: full test suite green, manual smoke test of every `APP_FLOW.md` journey in production
- **Definition of Done**: production deployment live, matches every flow in `APP_FLOW.md`
