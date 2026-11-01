# Driftline overhaul plan — choir-attendance (A-02)
Status: picks below **LOCKED (Steve 2026-11-02 t36u)**; everything else PROPOSED · Kit **v0.3.0** confirmed (`tokens.json` 0.3.0, CHANGELOG [0.3.0] HoldToConfirm) · branch `driftline` · 2026-11-02
Scope (Steve t34u): a **complete UI overhaul**, not a reskin. Every screen is redesigned from scratch with the kit's shell (Header ↔ PILL, context Segmented, glance StatCards, cards of ListRows, Sheet, Toast + Undo, Dock, HoldToConfirm). We keep only the locked **functional** decisions. Old LUCID layouts are replaced; each replaced layout choice that Steve locked has a Q-ID below.

## 0. LOCKED picks (Steve 2026-11-02 1:00 AM IST, t36u)
- **Q29 = b LOCKED** — tap the row toggles P ↔ A. **Long-press** opens a Sheet: mark (Present · Absent · Excused · Late only if enabled), Excused reason, remark + 1–5 stars, Left early, Child history. **No Undo toast for marking**: persistent **Undo / Redo** buttons in the header (Today), with a step history (chip "N steps · history" on the glance card).
- **Q30 = rose LOCKED** — Absent = kit danger (rose), with the word.
- ~~Q32 Excused = amber~~ → superseded by **Q39 violet** (t40u).
- **Q33 LOCKED** — Late counts as present → present green. Late is **off by default** in marking *and* counters; turned on only in **Settings → Developer options → Late mark**. Not marked stays **neutral**.
- **Q34 = a LOCKED** — keep the app's own A–Z strip, restyled with tokens (Kiwi asked to add an index rail to the kit as a PROPOSED TODO).
- **Q35 = a LOCKED** — Dock: Today · Members · Reports · Settings.
- **Q36 = a LOCKED** — today's hours in the header Segmented; other dates via search.
- **Q37 = a LOCKED** — `stage` density at ≥ 1600 px.
- **Q38 = a LOCKED** — all listed old layouts replaced (L/E popup, tap-name remark, LUCID cyan look).
- Q31 moot → kit `HoldToConfirm` "Hold to clear session".
Mock stills for these picks: `shots/driftline/v2/`. Sections 3 and 5 below are the pre-lock options, kept for the record.

## 0b. LOCKED picks (Steve 2026-11-02 1:05–1:08 AM IST, t38u/t40u)
- **Q39 LOCKED** — Excused = **violet** (kit `special`); amber no longer used for Excused. Other amber uses stay (Below 75% flag, Reports badge, stars).
- **Q40 = a LOCKED** — simple Undo / Redo buttons in the header; **long-press either** opens the step-history Sheet; tapping a step goes back to it. The separate history chip is removed.
- **Q41 = a LOCKED** — undo scoped to the hour session, cleared at the end of the day; undoing a synced change sends a reverse change to the sheet.
- **Q42 = a LOCKED** — one-time "Long-press for more" hint + a keyboard shortcut that opens the row Sheet.
- **Layout (t38u) LOCKED:** the glance panel is **collapsible** (chevron → slim one-line summary "12 present · 3 absent · 15 to mark" + bar; state remembered); a visible **Group by: Class · Role · A–Z** switch above the register; on phones the register takes most of the screen (hero hidden, title "Choir" in the header, glance collapsed by default on phone); the **A–Z rail is tall** (spans the register, letters evenly spaced).
Stills: `shots/driftline/v3/`.

## 9. v3 self-score (`shots/driftline/v3`)
| # | Criterion | Score | Evidence |
|---|---|---|---|
| R1 | Shell fidelity | 2 | kit Header/Segmented/Cards/Dock; slim summary bar is an app piece (not in kit) |
| R2 | Glance answer | 3 | collapsed bar still reads present · absent · to mark + progress |
| R3 | Token purity | 2 | a few px literals left in mock CSS (rail 28, 200/120 offsets, bar 8) |
| R4 | Colour meaning | 2 | green present, rose absent, violet excused, neutral not marked; violet is the kit's "special" meaning (Q43) |
| R5 | Hierarchy & type | 2 | scale sizes; Group-by + hint on one line |
| R6 | Touch | 3 | 8 full rows visible on 390×844; rows, icons, rail letters ≥ 44 hit |
| R7 | Motion | 2 | kit components; stills at reduced motion |
| R8 | Calm | 2 | primary + hold + hint chip on Today |
| R9 | Agency & safety | 3 | Undo/Redo always on top, step history, Hold to clear, no confirms |
| R10 | Day/night parity | 2 | Utopian Day phone + sheet checked; no Retro Glass |
| R11 | Accessibility | 2 | labels for undo/redo/collapse (aria-expanded); shortcut planned, not built |
| R12 | Words | 3 | "Long-press for more", "Go back to step 4", "Will undo" |
| | **Total** | **28 / 36 (pass, no zeros)** | |

## 10. New questions (v3)
- **Q43 Violet meaning** — kit violet = "special role"; Excused now uses it. a) keep and tell Kiwi Excused is choir's "special" · b) ask Kiwi for an `excused` attendance tone. **Rec: a now, b later (with the attendance-row TODO).**
- **Q44 A–Z rail visibility** — a) only in A–Z mode (mocks) · b) in every group mode. **Rec: a** (Class/Role are short lists).
- **Q45 Group-by memory** — a) remember per device (SP-22) · b) reset to Class daily. **Rec: a.**
- **Q46 Shortcuts** — a) Enter / Space toggles P↔A, Shift+Enter (or the Menu key) opens the row Sheet, Ctrl+Z / Ctrl+Shift+Z undo/redo · b) Sheet only. **Rec: a.**
- **Q47 Hint dismissal** — a) hint disappears after the first long-press (or ×) and never returns · b) shows for the first 3 sessions. **Rec: a.**

## 1. Locked A-02 functions → Driftline
| Locked function (06-projects A-02) | Driftline home |
|---|---|
| Any teacher marks; no sign-in; optional teacher name (Q1, Q22) | Session card "Teacher-S · Music room"; Settings → Teacher name |
| Any device, phone → smartboard (Q2) | Kit phone layout; ≥ 900 px: two columns (glance + session left, roll call right); `stage` density for the smartboard (Q37) |
| Marks P / A / L / E (Q3) and round-3 "P · A · one L/E button" | Q29 (a: buttons kept / b: tap-to-toggle) |
| Whole roster loaded, owner picks choir members (Q4) with check marks + selected list on top | **Members** tab: "Selected" chip card on top, class cards of ListRows with tick tiles |
| Instant sync + offline queue (Q5) | `StatusDot` in the header (live / connecting / offline / error) + "All synced" chip; no spinners |
| Sessions from timetable + extras; "Not conducted"; session + child remarks (Q6) | Header `Segmented`: 1st hour · 2nd hour · Extra (today dot). Session card: **Mark all present** (the one primary), **Not conducted**, **Hold to clear session** |
| % per child, monthly/weekly summary, low flags at Settings threshold (default 75%) (Q7, Q10, Q21) | **Reports** tab: glance (Average · Below 75% · Not conducted), "Needs you" list, weekly summary |
| Excused counts as present, Setting (Q11) | Settings → Rules toggle |
| Last mark wins, logged (Q12) | unchanged (data layer); Undo toast per change |
| Remarks for every status; 5-star proficiency per child per session (Q17, round 2) | Remark **Sheet**: stars, text, Left early, Child history; footer "Not now" · "Save remark" |
| Stars visible to all teachers; history kept; "Left" from a date (Q18, Q19) | Child history screen; Members → "Left" date in member sheet |
| Group by section or role, or A–Z list; A–Z strip left/right (Q25) | Roll call cards per section; A–Z strip (app component, see Q34); Settings toggle "A–Z strip on left" |
| Rows: name + class-section, no Adm. No. | ListRow title + meta |
| Daily report with template maker, pullable variables, child picker, Copy text, '+ pick' chip, auto parts refresh (Q21, round 3b) | **Daily report** screen: text field, variable Chips, "+ pick children", Copy text (primary), Edit template |
| Q26 Left early in ⋯ menu | in the ⋯ / remark Sheet |
| Q31 (clear session confirm) | **moot** → kit `HoldToConfirm` "Hold to clear session" (LOCKED kit standard) |
| Sheet tabs / Code.gs contract v1 | unchanged |

## 2. Screens (new design)
Shell everywhere: Header (♪ logo · title · StatusDot · search) → `main` → Dock **Today · Members · Reports · Settings** (Q35).
1. **Today / marking** — context Segmented for the hour; title "Choir · 2nd hour"; glance card **Present (incl. late/excused) · Absent · To mark** + progress; Roll call cards per section; Session card at the bottom (phone) / left (tablet). Undo toast after every mark. Stills: `mark-*`.
2. **Member picker** (Members tab) — `screen-members`.
3. **Remark + stars sheet** — `screen-remark`.
4. **Child history** — glance (Attended % · Absent · Stars avg) + sessions list with chips — `screen-history`.
5. **Reports / weekly** — `screen-reports`.
6. **Daily report + template maker** — `screen-daily` (template editor = same screen in edit mode, a later still).
7. **Settings** — theme family + Night/Day/Auto, rules, haptics Off/Light/Normal/Strong (LOCKED kit), sync, teacher name — `screen-settings`.
8. **A–Z strip** — slim chrome rail on the right, letters ≥ 12 px; reserves a right gutter.
9. **Sync status** — StatusDot (header + PILL island) + "All synced" chip; Settings row.
10. **Clear session** — `clear-hold-utopian-night-phone` (mid-hold, reduced motion = fade).

## 3. Open questions (Steve picks)
- **Q29 Marking style** — a) P · A · L/E · ⋯ buttons per row (locked round-3 control, kit-styled) · b) tap the row toggles P↔A, Undo toast; L/E + remark via ⋯ or long-press → Sheet (the kit's ADOPT_CHOIR pattern). **Rec: b.** On a 390 px phone (a) squeezes names to "A-chil…" (4 × 44 px buttons + A–Z gutter); (b) keeps full names and scores higher on the rubric. Stills: both.
- **Q30 Absent colour** — a) grey (neutral) · b) rose (kit "needs you"). **Rec: b** (Steve leans rose; kit says rose = absent). Stills: both.
- **Q32 Excused colour** — LUCID used blue, but blue = primary/active (LOCKED kit). a) violet "special" (in the mocks) · b) neutral with the word · c) ask Kiwi for an attendance tone. **Rec: a** for now, c long-term.
- **Q33 Late vs "To mark"** — both amber in the kit mapping (amber = pending). a) Late amber, To mark neutral · b) To mark amber, Late neutral + word · c) keep both amber. **Rec: a** (the mocks show c; to fix after the pick).
- **Q34 A–Z strip** — SoW's physics strip (v0.45.0) isn't in the kit. a) keep it as an app component restyled with tokens (mocks) · b) propose to Kiwi as a kit `IndexRail`. **Rec: a now, b later.**
- **Q35 Dock tabs** — a) Today · Members · Reports · Settings (mocks) · b) Today · History · Members (kit example) + Settings in the header. **Rec: a.**
- **Q36 Session picker** — a) hours of today in the header Segmented, dates via the PILL/search (mocks) · b) dates of the week in the Segmented (kit example), hour in a second row. **Rec: a.**
- **Q37 Smartboard** — a) `stage` density on ≥ 1600 px · b) same as tablet. **Rec: a.**
- **Q38 Old layouts replaced** (confirm): the popup L/E menu below/above the button (Q27 = B) becomes a Sheet in (b), or stays a popover in (a); the tap-name-to-remark gesture becomes row ⋯/long-press in (b); LUCID cyan look → Utopian family. a) accept · b) keep any item (name it). **Rec: a.**

## 4. Migration steps (after the picks)
1. Vendored kit `src/driftline/` (v0.3.0) — done on `driftline`; React 19.1.0 + framer-motion 12.43.0; kit tests (38) + contrast 260/260 run in the app's vitest.
2. Shell + Today screen → release; then Members, remark Sheet, history, Reports, Daily report, Settings (one screen per release, MIGRATION.md).
3. Remove `--lucid-*` styles screen by screen; keep the data layer, sync and Code.gs as is.
Still to bump: vite 5 → 6.4.1 and TypeScript 5.9 per ADOPT_CHOIR (not done in the mock).

## 5. Self-score (AGENT_BRIEF §E)
| # | Criterion | Q29a | Q29b | Evidence |
|---|---|---|---|---|
| R1 | Shell fidelity | 2 | 2 | Header, context pills, cards, Dock match `utopian-night-phone.png`; hero title smaller (title2) to fit roll call above the fold |
| R2 | Glance answer | 3 | 3 | Present · Absent · To mark + progress at the top |
| R3 | Token purity | 2 | 2 | App mock CSS uses tokens; a few px literals (28 px rail, 8 px bar, 96 px field) |
| R4 | Colour meaning | 2 | 2 | Late and To mark share amber (Q33); Excused on violet "special" (Q32) |
| R5 | Hierarchy & type | 2 | 2 | Scale sizes only; stat notes wrap on phone |
| R6 | Touch | 1 | 3 | (a) 4 × 44 buttons truncate names on phone; (b) whole row is the target |
| R7 | Motion | 2 | 2 | Kit components only; mock stills at reduced motion, not recorded |
| R8 | Calm | 2 | 2 | One primary (Mark all present) + Hold (rose) + Live chip |
| R9 | Agency & safety | 3 | 3 | Undo toast on every mark; Hold to clear; no confirms |
| R10 | Day/night parity | 2 | 2 | Utopian Day stills checked; Retro Glass not rendered yet |
| R11 | Accessibility | 2 | 2 | Labels on mark buttons, radios for stars; not keyboard-tested |
| R12 | Words | 3 | 3 | "Who's here?", "Hold to clear session", "Save remark" |
| | **Total** | **27 / 36 (just below pass)** | **29 / 36 (pass)** | no zeros |

## 6. Notes for Kiwi (PROPOSED, not sent)
1. No attendance tri/quad-state row (P/A/L/E) and no tone for "excused"; Late and "not marked" both fall on amber.
2. No index rail (A–Z) component; SoW's lives outside the kit.
3. No rating (stars) control, no popover/menu (only Sheet), no text area / form field styles.
4. No long-press helper on `ListRow`, no `leading` tone without an icon tile.
5. ADOPT_CHOIR asks for Retro Glass stills too; AGENT_BRIEF §C lists 4 themes — choose one list.
6. `HoldToConfirm` under reduced motion shows a full fill at mid-hold (fade), so the "mid" still reads as done-ish.

## 7. v2 self-score (locked picks, `shots/driftline/v2`)
| # | Criterion | Score | Evidence |
|---|---|---|---|
| R1 | Shell fidelity | 2 | Header (+ Undo/Redo icons), hour Segmented, cards, Dock as the reference |
| R2 | Glance answer | 3 | Present (incl. excused) · Absent · To mark + progress |
| R3 | Token purity | 2 | mock CSS still has a few px literals (rail 28, bar 8, field 96) |
| R4 | Colour meaning | 2 | green present (+late), rose absent, amber excused, neutral not marked; amber also used for "Below 75%" and stars (Q39) |
| R5 | Hierarchy & type | 2 | scale sizes; long Developer meta wraps |
| R6 | Touch | 3 | whole row is the target; 44 px icons; sheet controls ≥ 44 |
| R7 | Motion | 2 | kit components only; stills at reduced motion |
| R8 | Calm | 2 | one primary + hold + history chip; no marking toasts |
| R9 | Agency & safety | 3 | Undo/Redo always visible, step history, Hold to clear, no confirms |
| R10 | Day/night parity | 2 | Utopian Day stills checked (phone, tablet, sheet, settings); Retro Glass not rendered |
| R11 | Accessibility | 2 | labelled icon buttons, radio stars; long-press needs a keyboard/AT path (Q42) |
| R12 | Words | 3 | "Who's here?", "Late mark", "Hold to clear session" |
| | **Total** | **28 / 36 (pass, no zeros)** | |

## 8. New questions
- **Q39 Amber overlap** — Excused is now amber, as are "Below 75%" flags and stars. a) keep (word always shown) · b) "Below 75%" → rose (needs you) · c) stars neutral/ink. **Rec: b + c.**
- **Q40 Step history** — where the history opens: a) Sheet listing steps (newest first), tap a step to go back to it · b) only Undo/Redo, no list. **Rec: a.**
- **Q41 Undo scope** — a) per session (hour), cleared at day end · b) whole day across hours. Undo after sync sends a reverse op. **Rec: a.**
- **Q42 Long-press discoverability & access** — a) one-time hint chip "Long-press for more" + a ⋯ in the Sheet-less keyboard path (context-menu key / Shift+F10) · b) hint only. **Rec: a.**
