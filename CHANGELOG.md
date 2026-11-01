# Changelog
All notable changes. Format: Keep a Changelog; SemVer.

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
