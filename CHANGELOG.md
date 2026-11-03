# Changelog
All notable changes. Format: Keep a Changelog; SemVer.

## [stage1a] 2026-11-04 — CurtainCall shell (dock + desktop rail), first-run template picker (U-01), quick notes tied to screen + timestamped + queued (offline mode), Excused violet. Costumes/Props/Notes placeholders.

## [Unreleased] — branch `driftline` (PROPOSED)
### Added
- 2026-11-04: CurtainCall blueprint: Steve's answers Q58–Q79 (t19u–t21u) LOCKED in `07-DECISIONS`, ANSWERED in `06`; `05-STAGES` Stage 1 = Attendance + Costumes + Props + Notes by 2026-12-20.
- 2026-11-03: CurtainCall `docs/blueprint/07-DECISIONS.md`: Steve's LOCKED picks (Q43–Q47 a, Q51 a, Q52 translucent glance, Q53 sticky collapsible role headers, Q54 a + rail grab handle, Q55 try, Q56 a, tablet redo, backup child, name CurtainCall, all features in).
- CurtainCall Stage 0 blueprint (branch `curtaincall-blueprint`, PROPOSED): `docs/blueprint/00`–`06` — overview, data model (contract v2, additive to v1), sheet schema v2 + sync, navigation, UI principles (locked picks + Kiwi's PROPOSED Tip/IndexRail specs; Q58 Tip accent, Q59 violet clash), stages, open questions Q58–Q79.
- Vendored Driftline Kit v0.3.0 in `src/driftline/` (tokens + react); React 19.1.0, framer-motion 12.43.0, @testing-library/react 16.3.0. Kit tests + contrast run green in the app (55 tests).
- v3 mocks (t38u/t40u): violet Excused, header Undo/Redo with long-press step-history Sheet, collapsible glance (slim bar), Group by Class · Role · A–Z, register-first phone layout, tall A–Z rail, long-press hint → `shots/driftline/v3/`.
- v2 mocks for the t36u LOCKED picks (tap toggle, long-press Sheet, header Undo/Redo, rose absent, amber excused, Late behind Developer options) → `shots/driftline/v2/`.
- `mock.html` + `src/mock/` overhaul mockups; `shots/driftline.mjs` → `shots/driftline/*.png`; `docs/DRIFTLINE_PLAN.md` (Q29, Q30, Q32–Q38).

## [0.1.2] - 2026-11-01
### Changed
- Code.gs sheet layout v1: instructions banner row 1, headers row 2, data from row 3; header check fails clearly.
- Manual Edits now uses Date + Hour + Child ID + New mark (+ Reason, Note); script writes ✓ Applied / ⚠ Error and the time.
- Members gains Section; Timetable gains Active?; Reports headers defined.
### Fixed
- BUG-4: doGet threw on a header mismatch; now returns a clear JSON error.
### Added
- Code.gs tests with an in-memory Sheets fake; docs/SHEET_GUIDE.md.

## [0.1.1] - 2026-11-01
### Fixed
- BUG-2: L/E and ⋯ popups flip above the button when there is no room below (A-02 Q27 = B). Test added.

## [0.1.0] - 2026-11-01
### Added
- Marking screen (P / A / L-E popup / ⋯ menu), tap name for remark + stars, Section/Role/A–Z grouping with ported A–Z strip.
- Local storage, versioned sync queue (contract v1) with fake adapter and Apps Script adapter.
- Apps Script `Code.gs` draft (8 tabs, idempotent POST, GET pull with Manual Edits).
- Tests for grouping, counts, store, queue (offline, loss, dedupe, drain, version check).
- Headless screenshot script.
- 2026-11-04: blueprint: U-01 universal-app rule locked.
