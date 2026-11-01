# Sheet guide (layout v1)

TEST sheet: **A-02 Choir Attendance — TEST** (placeholder children only). Every tab: **row 1 = instructions banner**, **row 2 = headers** (frozen), data from **row 3**. `apps-script/Code.gs` checks the row-2 headers and fails with a clear message if one is renamed.

| Tab | Who types | What it is |
|---|---|---|
| Read Me | — | How it works + colour legend (P green, A grey, L amber, E blue) and status legend |
| ✏️ Manual Edits | **Teacher** | Fix a mark: Date · Hour · Child ID · New mark · Reason (E only) · Note. *Status*, *Applied at*, *Name* are automatic (locked, grey) |
| ✏️ Members | **Teacher** | Who is in choir: Child ID · Section · Role (Singer/Action/Prop, more allowed) · From · To · Note. *Name* automatic |
| ✏️ Timetable | **Teacher** | Golden Hour slots: Day · Hour · Start · End · Venue · Active? |
| 🔒 Roster link | System | Child ID · Section · Name. Live sheet: read from the school roster at runtime (never copied to the repo) |
| 🔒 Sessions | System (app) | One row per session |
| 🔒 Attendance | System (app) | One row per child per session; mark colours |
| 📊 Reports | Formulas | P/A/L/E counts, % (Late + Excused count as attended), "Below 75%" flag |
| 🔒 Log | System (app) | Every change the app sends (for history/undo, and duplicate protection) |

## Fixing a mark (Manual Edits)
1. Type the **Date** (yyyy-mm-dd; double-click a date cell for the calendar).
2. Pick **Hour**, **Child ID**, **New mark** from the dropdowns; pick a **Reason** only for E.
3. Leave **Status** empty. The row is **yellow** while waiting.
4. On the next app sync the script applies it (your fix wins), sets **✓ Applied** (green) and the time. A problem shows **⚠ Error: …** (red) — fix the row, then ask the owner to clear Status.

## Colours
Banner: yellow = you can type; grey = system; blue = reports. Marks: P green · A grey · L amber · E blue.

## Protection
System tabs and automatic columns are locked (owner only). Banner/header rows warn before editing.

## Screenshots
Not captured: Google Sheets needs a signed-in browser. Open the TEST sheet to see it.
