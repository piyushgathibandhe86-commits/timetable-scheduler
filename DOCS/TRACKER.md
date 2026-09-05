# TRACKER.md — Project Progress Tracker
## Timetable Scheduler

Living document — update after every development session. Statuses: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `TESTING`, `COMPLETED`.

---

## MVP Progress

| Phase | Name | Status | Priority | Depends on |
|---|---|---|---|---|
| 0 | Project Setup | COMPLETED | Must have | — |
| 1 | Database & Schema | NOT_STARTED | Must have | Phase 0 |
| 2 | Authentication | NOT_STARTED | Must have | Phase 1 |
| 3 | Master Data: Rooms & Teachers | NOT_STARTED | Must have | Phase 2 |
| 4 | Master Data: Subjects & Sections | NOT_STARTED | Must have | Phase 3 |
| 5 | Setup Wizard | NOT_STARTED | Must have | Phase 4 |
| 6 | Scheduling Engine (core) | NOT_STARTED | Must have | — |
| 7 | Generate Flow (UI + API) | NOT_STARTED | Must have | Phase 5, 6 |
| 8 | Review/Edit Grid | NOT_STARTED | Must have | Phase 7 |
| 9 | Publish Flow | NOT_STARTED | Must have | Phase 8 |
| 10 | Viewer Screens | NOT_STARTED | Must have | Phase 9 |
| 11 | Export | NOT_STARTED | Should have | Phase 8 |
| 12 | Testing Hardening & Deployment | NOT_STARTED | Must have | All |

---

## Feature Progress

| Feature | Status | Notes |
|---|---|---|
| Login / role-based redirect | NOT_STARTED | |
| Rooms CRUD + CSV import | NOT_STARTED | |
| Teachers CRUD + CSV import | NOT_STARTED | |
| Subjects CRUD + CSV import | NOT_STARTED | |
| Sections CRUD + CSV import | NOT_STARTED | |
| Setup wizard (5 steps) | NOT_STARTED | |
| Scheduling engine — backtracking + most-constrained-first | NOT_STARTED | |
| Scheduling engine — conflict checker (shared w/ manual edit) | NOT_STARTED | |
| Generate flow (Keep manual / Fresh) | NOT_STARTED | |
| Timetable grid (view) | NOT_STARTED | |
| Drag-and-drop manual edit | NOT_STARTED | |
| Touch tap-to-select fallback | NOT_STARTED | |
| Unplaced-class panel + resolve | NOT_STARTED | |
| Publish / Unpublish cycle | NOT_STARTED | |
| Student: section selector + view | NOT_STARTED | |
| Teacher: "My lectures today" | NOT_STARTED | |
| Teacher: browse full section | NOT_STARTED | |
| Export / print view | NOT_STARTED | |
| RLS policies (role-scoped reads) | NOT_STARTED | |

---

## Technical Progress

| Item | Status | Notes |
|---|---|---|
| Supabase project (dev) | NOT_STARTED | Requires user to create project and fill `.env.local` |
| Supabase project (production) | NOT_STARTED | |
| Vercel deployment (preview) | NOT_STARTED | Requires user to connect repo to Vercel |
| Vercel deployment (production) | NOT_STARTED | |
| Design tokens implemented (Tailwind config) | COMPLETED | `tailwind.config.ts` + `app/globals.css` CSS vars verified |
| Vitest suite — scheduling engine | NOT_STARTED | Must be green before Phase 7 starts |
| Vitest suite — API routes | NOT_STARTED | |
| Playwright E2E — core path | NOT_STARTED | |

---

## Bug Tracker

| ID | Description | Status | Priority | Found in phase |
|---|---|---|---|---|
| — | — | — | — | — |

*(empty until development begins — add rows as bugs are found)*

---

## Decisions

Record of decisions made during planning, for future reference:

- Single college, single-tenant scope for v1 (no multi-college support)
- Roles: Admin + Student + Teacher (two viewer sub-types with different default landing views)
- Regeneration always asks the admin to choose "Keep manual" vs "Fresh" — never silent
- Soft-constraint balancing uses most-constrained-first (subjects with more weekly hours placed first)
- Publish requires zero unplaced classes; publish/edit cycle requires explicit Unpublish first
- Export/print included in v1 scope
- No settings screen, no notifications in v1
- REST API (not tRPC), Next.js API routes, Supabase (Postgres + Auth), Vercel deployment
- Design direction: android.com-inspired, light mode only, neutral palette + single accent, mobile-first for viewer screens
- `teacher_unavailability` table included from the start rather than deferred
- Lab subjects must be placed in lab-type rooms — promoted from an open question to a hard constraint (resolves `PRD.md` §7 Q2)
- Three distinct roles confirmed (Admin, Student, Teacher) — `TRD.md` corrected from an earlier "two roles" framing to match `APP_FLOW.md`/`SCHEMA.md`

---

## Open Questions

Carried over from `TRD.md` §15 and `SCHEMA.md`, still to be resolved during/before relevant phases:

1. Exact period/day configuration — fixed defaults vs admin-configurable (resolve before Phase 1 migrations)
2. CSV import — strict fixed template vs column-mapping UI (resolve before Phase 3)
3. Backtracking iteration/timeout cap value — needs tuning once real data exists (resolve during Phase 6 testing)
4. Whether Supabase RLS alone is sufficient or an additional API-layer check is warranted (resolve before Phase 10)

---

## Change Log

| Date | Change |
|---|---|
| — | Initial documentation set created: PRD, TRD, APP_FLOW, DESIGN, SCHEMA, IMPLEMENTATION_PLAN, TRACKER, RULES |
| — | Consistency pass: fixed TRD's role count (two → three), added missing `/api/sections` and `/api/timetable/unpublish` endpoints to TRD and Phase 9, added lab/room-type as a hard constraint across TRD/RULES/SCHEMA/DESIGN, resolved PRD's stale open questions (single-institution scope, unplaced-class resolution, room-type constraint), clarified `is_locked` vs publish-status locking in SCHEMA/DESIGN |
| 2026-08-31 | APP_FLOW.md added to DOCS/ (was missing from initial set) |
| 2026-08-31 | Deleted empty `TimeTableScheduler/` Python/Flask prototype folder (user-authorized — all files were zero-byte stubs, conflicted with documented Next.js architecture) |
| 2026-09-05 | **Phase 0 COMPLETED** — scaffold verified: `app/globals.css` (CSS design tokens), `app/layout.tsx` (root layout), `app/page.tsx` (→ /login redirect), `lib/supabase/client.ts` (browser client), `lib/supabase/server.ts` (server + service-role clients), `middleware.ts` (session refresh + role-based route guard), `.env.local` / `.env.example` (env var stubs). TypeScript: clean (0 errors). Build: `next build` exits 0, all 4 pages generated. Decisions: fixed defaults chosen for period/day configuration (simpler, per TRD §15 recommendation) — to be confirmed before Phase 1 migration is written. |
