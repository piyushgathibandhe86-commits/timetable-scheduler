# DESIGN.md — UI/UX Design Specification
## Timetable Scheduler

Source of truth: `PRD.md`, `TRD.md`, `APP_FLOW.md`. This document defines exactly how the application looks, behaves, and feels so an AI coding tool implements a consistent interface. No screens beyond what `APP_FLOW.md` defines are introduced here.

---

## 1. Design Goals

- Feel approachable and calm despite handling a genuinely complex scheduling problem underneath
- Make the weekly grid the visual hero of the app — everything else supports it
- Work as well on a phone (student checking their next class) as on a laptop (admin building the schedule)
- Never make the admin feel like they're fighting the interface while resolving conflicts

## 2. Design Philosophy

Inspired by android.com's marketing site direction: soft rounded surfaces, generous whitespace, confident but restrained color, friendly and legible type at every size — professional software that doesn't feel corporate or cold. Minimal, light-mode only, one accent color doing the work instead of many.

Three principles:
- **Whitespace over borders** — separate things with space and soft surface changes, not hard rules everywhere
- **One accent, used sparingly** — accent color marks the primary action and today's date/current period; everything else stays neutral
- **The grid earns the color** — subject-color-coding is the one place the interface gets colorful; every other screen stays quiet so the grid doesn't have to compete

---

## 3. Visual Direction

- **Overall style**: minimal, soft, rounded, light-mode only. Large corner radii on containers, small radii on controls.
- **Layout**: generous padding, content-width capped and centered on large screens, full-bleed on mobile.
- **Density**: comfortable, not compact — this is a tool people check quickly and often, not a dense data-entry grind. Exception: the timetable grid itself uses a slightly tighter density so a full week fits without excessive scrolling (see §8).
- **Typography**: a clean, humanist sans-serif (system font stack: `-apple-system, "Segoe UI", Roboto, "Anthropic Sans", sans-serif` as a practical fallback chain, matching the requested Anthropic-Sans-like feel). Two weights only — regular (400) and medium (500). Sentence case everywhere, no ALL CAPS, no heavy bold.
- **Color system**: neutral gray-based UI with a single blue accent (see tokens below). Subject color-coding uses a small curated palette, not full RGB freedom.
- **Borders**: hairline only (0.5–1px), low-contrast — borders separate, they don't shout.
- **Shadows**: none on flat surfaces; a single soft, low-opacity shadow reserved for floating elements (modals, dropdowns) only.
- **Radius**: large (16–20px) on cards and containers, medium (10–12px) on buttons/inputs, small (6–8px) on chips/badges.
- **Icons**: simple outline icon set (e.g. Tabler/Material Symbols outline style) — no filled icons, no illustrations, no emoji.

---

## 4. Design Tokens

### Colors (light mode only)

| Token | Value | Use |
|---|---|---|
| `--surface-page` | `#FAFAFA` | Page background |
| `--surface-card` | `#FFFFFF` | Cards, panels |
| `--surface-muted` | `#F1F3F4` | Subtle fills (hover, disabled bg) |
| `--text-primary` | `#1F1F1F` | Main text |
| `--text-secondary` | `#5F6368` | Supporting text |
| `--text-muted` | `#80868B` | Placeholders, captions |
| `--border` | `#E3E4E6` | Default hairline |
| `--border-strong` | `#C9CBCE` | Emphasized divider |
| `--accent` | `#3B77E8` | Primary actions, current period highlight, links |
| `--accent-muted` | `#EAF1FD` | Accent backgrounds (selected states) |
| `--danger` | `#D63A2E` | Conflict indicators, destructive actions |
| `--danger-muted` | `#FCEAE8` | Conflict background fill |
| `--success` | `#1E8E3E` | Success states (e.g. "fully placed") |
| `--success-muted` | `#E8F5E9` | Success background fill |

### Subject color palette (curated, cycled per subject, not per interaction)

A fixed set of 8 soft, distinguishable ramps used only for subject-card fills on the timetable grid: blue, teal, purple, coral, amber, pink, green, gray. Each subject is assigned one consistently across the whole app (list, grid, exports). Text on these fills always uses the ramp's darkest stop for contrast.

### Typography

| Token | Size | Weight | Use |
|---|---|---|---|
| `--text-h1` | 28px | 500 | Screen titles |
| `--text-h2` | 20px | 500 | Section headers |
| `--text-h3` | 16px | 500 | Card/subsection titles |
| `--text-body` | 15px | 400 | Body text |
| `--text-small` | 13px | 400 | Captions, metadata |
| `--text-grid` | 13px | 400/500 | Timetable cell text (subject name 500, room/teacher 400) |

Line height: 1.5 for body text, 1.3 for headings, 1.2 for dense grid cells.

### Spacing

`4, 8, 12, 16, 24, 32, 48, 64px` scale. Card padding: 16–24px. Section gaps: 32–48px.

### Radius

`--radius-sm: 8px` (chips, badges) · `--radius-md: 12px` (buttons, inputs, grid cells) · `--radius-lg: 20px` (cards, containers, modals)

### Elevation

Only two levels: `--shadow-none` (default, everything flat) and `--shadow-float` (`0 4px 16px rgba(0,0,0,0.08)`, used only for modals, dropdown menus, and the dragged card while mid-drag).

### Component states

Every interactive element defines: default, hover (`--surface-muted` or slight darken), active/pressed (scale 0.98), focus (2px `--accent` outline, offset 2px — never removed), disabled (40% opacity, no pointer events).

---

## 5. Application Layout

- **Header** (all screens): app name/logo left, current section indicator (Admin/Student) or "My lectures today" toggle (Teacher) center-left, user menu + logout right. Sticky on scroll.
- **Sidebar** (Admin only, desktop): left-hand nav — Dashboard, Rooms, Teachers, Subjects, Sections, Generate. Collapses to a bottom nav bar or hamburger drawer on mobile.
- **Navigation** (Viewer roles): no sidebar — just the header, since Student/Teacher have only 1–2 destinations (their timetable, and section-switch/browse for Teachers).
- **Content area**: max-width 1200px, centered, 24–48px side padding on desktop; full-width with 16px padding on mobile.
- **Responsive behavior**: sidebar → bottom tab bar or drawer under 768px; grid behavior detailed in §8/§9.

---

## 6. Component System

- **Buttons**: primary (filled `--accent`, white text, `--radius-md`), secondary (outline, `--border-strong`), ghost (no border, text-only, for tertiary actions). One primary button per screen/section max.
- **Inputs**: 40px height, `--surface-card` background, `--border` outline, `--radius-md`, focus ring in accent.
- **Selects**: same visual treatment as inputs, native or custom dropdown with `--shadow-float` on open.
- **Tables**: used for master data lists (rooms, teachers, subjects, sections) — hairline row dividers, no zebra striping, row hover = `--surface-muted`, action icons right-aligned per row.
- **Cards**: `--surface-card`, `--radius-lg`, no border (shadow-free, separated by page background contrast), used for dashboard summary tiles and the setup wizard steps.
- **Modals**: centered, `--radius-lg`, `--shadow-float`, used for confirmations (unpublish, delete, discard changes) — never for primary data entry (that stays in-page).
- **Dropdowns**: `--shadow-float`, `--radius-md`, used for section selection (Student) and user menu.
- **Tabs**: underline style (not pill), used only if a screen needs it (e.g. switching between "My lectures" and "Browse sections" for Teachers).
- **Toasts**: bottom-center, `--radius-md`, auto-dismiss after 4s, used for save confirmations and non-blocking errors (CSV row errors use inline messaging instead, not toasts).
- **Alerts**: inline banners (`--danger-muted` or `--success-muted` background) for blocking states — e.g. "Publish blocked: 3 unplaced classes remain."
- **Badges**: small `--radius-sm` pills — used for status (Draft/Published), and conflict counts.
- **Loading states**: skeleton placeholders (soft gray blocks matching final layout shape) for lists and the grid — no spinners for content areas; a small inline spinner only for button-triggered actions (e.g. "Generating…" on the Generate button itself).

---

## 7. Screen Specifications

### Login
- **Purpose**: single shared entry point for all roles
- **Layout**: centered card, max-width 400px, on `--surface-page` background
- **Components**: email input, password input, primary submit button
- **User actions**: submit credentials
- **Data displayed**: none
- **Empty state**: n/a
- **Loading state**: button shows inline spinner + "Signing in…"
- **Error state**: inline red text under the form
- **Success state**: redirect per role (per `APP_FLOW.md` §3)
- **Mobile behavior**: card becomes full-width with page padding, no visual change otherwise

### Setup Wizard (Admin, first login)
- **Purpose**: guided linear entry of rooms → teachers → subjects → sections → review
- **Layout**: step indicator at top (5 dots/labels), one step's form per screen, Back/Next buttons bottom-right
- **Components**: form/table for the current entity, CSV import button, inline validation
- **User actions**: add manually, import CSV, edit/remove a row, advance step
- **Data displayed**: rows added so far for the current step
- **Empty state**: "No rooms added yet — add one or import a CSV" with the two actions front and center
- **Loading state**: skeleton rows during CSV processing
- **Error state**: row-level CSV errors listed inline, Next disabled until resolved
- **Success state**: step complete, Next enabled
- **Mobile behavior**: step indicator collapses to "Step 2 of 5" text; forms stack full-width

### Dashboard (Admin)
- **Purpose**: overview + entry point to per-section work
- **Layout**: summary cards row (subject/teacher/room/section counts) + a list of sections with status badges
- **Components**: cards, table/list, status badges (Draft/Published/No timetable)
- **User actions**: select a section → generate/edit
- **Data displayed**: counts, per-section status
- **Empty state**: shown only pre-wizard (redirects instead, per `APP_FLOW.md`)
- **Loading state**: skeleton cards
- **Error state**: n/a (read-only aggregation)
- **Success state**: n/a
- **Mobile behavior**: cards stack to 2-column then 1-column grid; section list becomes stacked cards instead of a table

### Master Data screens (Rooms, Teachers, Subjects, Sections)
- **Purpose**: ongoing CRUD outside the wizard
- **Layout**: table with add button top-right, search/filter above the table
- **Components**: table, add/edit modal or inline row edit, CSV import button, delete confirmation modal
- **User actions**: add, edit, delete, import
- **Data displayed**: full list of the entity
- **Empty state**: same pattern as wizard step
- **Loading state**: skeleton table rows
- **Error state**: delete-blocked alert if record is in use (per `APP_FLOW.md` §6)
- **Success state**: toast on save
- **Mobile behavior**: table collapses to stacked card-per-row

### Generate
- **Purpose**: trigger and configure scheduling engine run
- **Layout**: section context header, mode choice (Keep manual / Fresh) as two large selectable cards, primary Generate button
- **Components**: selectable cards, primary button, validation alert if data incomplete
- **User actions**: choose mode, generate
- **Data displayed**: data-completeness summary before generating
- **Empty state**: n/a
- **Loading state**: button shows "Generating…" with inline spinner; grid area shows skeleton
- **Error state**: alert banner listing missing data, Generate disabled
- **Success state**: redirects into Review/Edit with results
- **Mobile behavior**: mode cards stack vertically

### Review / Edit Timetable (includes conflict resolution)
- **Purpose**: the core working screen — view, drag-edit, resolve unplaced classes
- **Layout**: grid takes primary space; unplaced-classes panel appears above the grid on mobile, as a right-side rail on desktop, only when non-empty
- **Components**: timetable grid (§8), unplaced-class chips, Publish button (disabled until fully resolved), Regenerate button
- **User actions**: drag-and-drop (edit + resolve), publish, regenerate
- **Data displayed**: full grid, unplaced list with reasons
- **Empty state**: unplaced panel simply doesn't render when empty
- **Loading state**: skeleton grid during regenerate
- **Error state**: rejected-drop feedback (card snaps back, inline reason near the cursor/toast)
- **Success state**: "All classes placed" success banner replaces the unplaced panel when resolved
- **Mobile behavior**: grid becomes horizontally scrollable with sticky day/time headers; drag-and-drop falls back to tap-to-select + tap-target-slot (see §9)

### Publish confirmation
- **Purpose**: confirm the lock/unlock action
- **Layout**: modal, short copy, two buttons
- **Components**: modal, primary + ghost button
- **User actions**: confirm or cancel
- **Data displayed**: n/a
- **Success state**: toast + status badge updates to Published/Draft
- **Mobile behavior**: modal becomes bottom sheet

### Timetable View (Student)
- **Purpose**: read-only published grid for their section
- **Layout**: section selector (if not yet chosen) → grid, full width, no sidebar
- **Components**: grid (view-only), export button
- **Data displayed**: published entries only
- **Empty state**: "Timetable not published yet" centered message
- **Mobile behavior**: default view, scrollable grid with sticky headers (this is the primary use case for mobile, per your priority)

### Timetable View (Teacher)
- **Purpose**: default filtered "my lectures today" + optional full-section browsing
- **Layout**: today's lecture list (card-per-lecture, chronological) by default; a tab/toggle switches to the full grid for any section
- **Components**: lecture cards, tab/toggle, grid (view-only), export button
- **Data displayed**: today's entries referencing this teacher; full grid on toggle
- **Empty state**: "No lectures scheduled today" friendly message
- **Mobile behavior**: this is the primary use case — the today-list view is mobile-first by design

### Export view
- **Purpose**: printable/PDF-friendly render of the current grid
- **Layout**: clean grid-only layout, no app chrome, print stylesheet applied
- **Components**: grid, print/download trigger
- **User actions**: download or print
- **Empty state**: export disabled with tooltip if no timetable exists (per `APP_FLOW.md` §11)
- **Mobile behavior**: triggers native share/print sheet

---

## 8. Timetable Interface

This is the most important surface in the app.

- **Days**: columns, Monday–Friday (or Saturday if the college requires it), abbreviated on mobile (Mon, Tue…), full on desktop.
- **Periods**: rows, labeled with start time; a distinct lighter "break/lunch" row spans all columns and is visually non-interactive (no drop target).
- **Subject cards** (lecture): filled rounded rect (`--radius-md`) in the subject's assigned color, subject name (500 weight) + teacher name + room (400 weight, smaller) stacked inside.
- **Lab cards**: visually distinct structure from lecture cards — wider (spans 2 periods where applicable), a thin diagonal-hatch pattern or left accent bar layered over the subject color to signal "lab" at a glance without relying on color alone, plus a small flask/beaker-style outline icon in the corner. This visual distinction now also reflects a real engine rule, not just styling: a lab subject can only ever occupy a lab-type room (per `SCHEMA.md` §3, `TRD.md` §5), so a lab card should never legitimately appear in a slot that could be mistaken for a lecture room.
- **Faculty / Room info**: always shown in the card in small text; on narrow mobile columns, truncates to initials/abbreviation with full detail available on tap.
- **Conflict indicators**: a card involved in a conflict (during editing, before it's resolved) gets a `--danger` left border bar + small warning icon; unplaced classes (not yet in the grid) render as neutral outlined chips in the side panel, not colored, until placed.
- **Locked slots**: published timetable cards render with a subtle lock icon and are simply non-draggable (no drag handle shown) rather than grayed out — they should still read clearly, just not appear interactive. This is a *display-time* lock derived from `timetables.status = published`, distinct from the database's `timetable_entries.is_locked` field (which only affects regeneration behavior, per `SCHEMA.md` §3) — don't conflate the two when implementing.
- **Editing**: drag-and-drop on desktop (grab cursor on hover, `--shadow-float` while dragging, target cell highlights in `--accent-muted` on drag-over); tap-to-select then tap-destination on mobile/touch (see §9).
- **Filtering**: a simple dropdown to filter the grid by teacher or room (Admin only), highlighting only matching cards and dimming the rest rather than hiding them (preserves grid shape/context).
- **Searching**: a lightweight search box (Admin master data screens only) — not needed on the grid itself given the filter covers the main use case.
- **Print/export view**: strips all interactive affordances (no drag handles, no hover states), increases text contrast slightly, fits one section's week to a single page width.

---

## 9. Responsive Design

Mobile is a primary use case (students/teachers checking schedules), not an afterthought:

- **Breakpoints**: mobile <768px, tablet 768–1024px, desktop >1024px.
- **Grid on mobile**: horizontally scrollable with the day header row and period column both sticky, so users always know what they're looking at while scrolling. Card text truncates gracefully (subject name always visible; teacher/room may abbreviate).
- **Drag-and-drop on touch**: replaced with a tap-to-select interaction — tap a card (it lifts with `--shadow-float` and a "select a destination" hint appears), then tap the destination cell. This avoids the reliability problems of drag gestures on small touch targets.
- **Admin sidebar** → bottom tab bar (4–5 icons: Dashboard, Rooms, Teachers, Subjects/Sections grouped, Generate) under 768px.
- **Wizard/forms**: single-column stacking, full-width inputs, sticky Next/Back buttons at the bottom of the viewport.

---

## 10. Accessibility

Sensible, genuinely-applied defaults rather than a formal compliance audit, given project scale:

- Minimum 4.5:1 text contrast for body text, 3:1 for large text — verified against the token values above
- Every interactive element reachable and operable via keyboard (tab order follows visual order; drag-and-drop has a keyboard-accessible alternative: select card with Enter, arrow-key to target cell, Enter to confirm)
- Visible focus ring on every focusable element, never removed via CSS
- Color is never the only signal — conflict/lab/locked states all pair color with an icon or pattern (per §8)
- Form inputs have associated `<label>` elements, not placeholder-only labeling
- Alt text on all icons that convey meaning (decorative icons marked `aria-hidden`)

---

## 11. UX Rules

- Never let the grid layout shift during a drag operation — only the dragged card and the hovered target cell change appearance.
- Never publish silently — always require the explicit confirmation modal (§7).
- Never show a spinner for content that can be skeleton-loaded instead — skeletons preserve layout and feel faster.
- Always confirm destructive actions (delete, unpublish) with a modal; never confirm additive actions (add row, generate) with a modal — those get inline feedback instead.
- Keep the accent color reserved for primary actions and "current period" highlighting — if it starts appearing on more than a few elements per screen, that's a sign something should be neutral instead.
- Teacher's "My lectures today" list is always the default landing view — never make them navigate to find today's schedule.

## 12. Design Do's and Don'ts

**Do**:
- Use whitespace and soft surface changes to separate content
- Keep every screen to one primary action
- Let the subject-color grid be the one colorful moment in the app
- Design mobile layouts first for any Viewer-facing screen

**Don't**:
- Don't add gradients, drop shadows on flat cards, or decorative textures
- Don't introduce a second accent color
- Don't use ALL CAPS or heavy bold weights anywhere
- Don't build screens not defined in `APP_FLOW.md` (no settings screen, no notifications UI)
- Don't rely on color alone to distinguish lab vs lecture vs conflict states
