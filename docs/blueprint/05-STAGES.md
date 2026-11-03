# 05 — Staged build plan (PROPOSED)
Every stage ships a complete, working, live app with full sync, first to the TEST sheet (placeholder data), then the real sheet only after Steve says go. Each release: tests green, CHANGELOG entry, backup tag, no force-push.

| Stage | Scope | Exit criteria | Order |
|---|---|---|---|
| 0.1 Blueprint | these docs: model, sheet schema, navigation, UI rules, stages, questions | Steve reviews; questions answered or defaults accepted | now |
| 0.2 Mockups | every main screen on phone, tablet, desktop with placeholder data | Steve signs off mockups | next, ≤ 2 weeks total for stage 0 |
| 1 Live base (target 2026-12-20, Q62) | port v0.1.2 to Driftline; contract v2; **GitHub Pages**; **Apps Script on TEST sheet**; **Attendance** (Today/Members/Reports), **Costumes**, **Props**, **Notes** core + Quick-note button, care flags with role access (Q66) | all tests pass; live sync from two devices on TEST; offline test passes; 5-minute usability check with one teacher | 2nd |
| 1.1 Parts tree + casting | groups any depth, parts, assignments + several back-ups (Q67), tree, gap/clash flags | Choir + EMP tree on TEST; flags proven with test data | 3rd |
| 1.2 Notes deep (full plan TODO, Q73) | quick capture, text, checklist, pins, colours, tags, search, offline, export text/Markdown/WhatsApp | notes sync both ways; offline edits survive reload | 4th |
| 1.3 Show plan + call list | running order, scenes, songs, call list per session, Show tab | a real rehearsal run from the call list | 5th |
| 1.4 Parent requests | (costumes/props moved to stage 1) Tailor-D order list export, requests with status + reminders | order list exported; a request goes asked → returned on TEST | 6th |
| 1.5 Show day | check-in (with Practice + in/out button, Q63), run sheet, headcount, hand-over, two shows | full dress-rehearsal dry run before 2027-01-30 | 7th, by mid-Jan |
| 2 Notes deep + templates | draw mode (Drive files), links/backlinks, attach, sharing, PDF/PNG; Template maker + ready notices | drawing saved and reopened on another device; 3 notices from templates | after show or in parallel |
| 2.1 Screencast | cast link/QR, curated views, phone remote, privacy shield; then Mirror, Draw | 50-minute run on classroom smartboard; offline fallback tested | with stage 2 (Q76: lyrics/timer earlier) |
| 3 Stage & polish | standing grid, positions, actions, readiness board, consent, sizes, who's-in-what | usability check on phone and desktop | next |
| 4 Later | photos, entrances, calendar, archive, Custom cast view, possible stand-alone Notes app | per feature | later |
