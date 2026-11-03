# 04 — UI principles (PROPOSED unless marked LOCKED)
Goal: people *want* to open CurtainCall instead of a notepad and sheets.

## Per device
- **Phone:** show little. One main action per screen; everything else one tap away (progressive disclosure); details in bottom Sheets so you keep your place; smart defaults (today's session, current production, last group-by); thumb-reach actions; labelled icons; big targets.
- **Tablet:** two balanced columns (main ~60%, side ~40%); Sheets open as a side panel, never a popup over the list; dock becomes a left rail; all components on one grid and spacing scale; portrait falls back to phone layout.
- **Desktop:** multi-pane, every option visible; tables, filters, drag and drop; keyboard shortcuts.
- All: same words, colours and order everywhere; undo for every change; tips disappear once used.

## Driftline Kit v0.3.0 rules
Use the vendored kit (`src/driftline/`) tokens and components only; **Driftline blue** primary accent (not LUCID cyan); kit themes (Utopian Night/Day); respect reduced motion; contrast tests must pass; no one-off colours. Status colours: Present green, Absent rose, Excused violet.

## Steve's LOCKED picks
| ID | Pick |
|---|---|
| Q29b | tap row toggles P↔A; long-press Sheet for Excused / Late (if enabled) / remark + stars; Undo/Redo in header, no toast (t36u) |
| Q30 | Absent = rose (t36u) |
| Q33 | Late counts as present, hidden behind Developer options (t36u) |
| Q35a | dock Today · Members · Reports · Settings (t36u; see Q70 for the CurtainCall dock) |
| Q36a | hours in header, dates via search |
| Q37a | stage density ≥ 1600 px |
| Q38a | old layouts replaced |
| Q39 | Excused = violet |
| Q40a | simple Undo/Redo in header; long-press either → step-history Sheet |
| Q41a | undo per hour session, cleared at day end; undo of synced change sends reverse change |
| Q42a | one-time "Long-press for more" hint + keyboard shortcut |
| Q43a | keep violet for Excused; tell Kiwi |
| Q44a | A–Z rail only in A–Z mode |
| Q45a | group-by remembered per device |
| Q46a | Enter/Space toggles, Shift+Enter opens row Sheet, Ctrl+Z / Ctrl+Shift+Z |
| Q47a | hint gone after first long-press or × |
| Q51a | status as small dot + letter, row edge tinted |
| Q52 | glance as an **overlaid translucent panel** that suggests content behind it |
| Q53 | per-role sticky headers with mini counts (e.g. 18/21), each role **collapsible** |
| Q54a | thinner overlaid A–Z rail, only letters with names, plus a **grab handle** to move it left/right |
| Q55 | trial: no debug label; stars and remark side by side |
| Q56a | undo history as status chips; later steps greyed |

## PROPOSED kit additions (Q58a) — drafts for Kiwi
Kiwi has not yet published these specs (kit `TODO.md` lists IndexRail only). Drafts below follow the Driftline token rules; Kiwi to confirm, only Steve locks.
- **Tip:** one-time dismissable hint, inline in the list (not floating). Leading lightbulb icon + text + × button; translucent surface, Driftline blue hairline; dismissed on × or on first use of the hinted action; remembers per device; reduced-motion: no slide.
- **IndexRail:** A–Z rail overlaid on the list edge, ~20 px wide, shows only letters present; tap/drag scrubs with a letter bubble; grab handle (6-dot) at top to drag to left or right edge, side remembered per device; hidden outside A–Z mode (Q44a); keyboard: letter keys jump.
