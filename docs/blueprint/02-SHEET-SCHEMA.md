# 02 — Google Sheet schema (layout v2, PROPOSED)
Keeps layout v1 (row 1 banner, row 2 headers frozen, data from row 3; `Code.gs` checks headers). v1 tabs stay unchanged; v2 adds tabs. ✏️ = teachers may edit by hand; 🔒 = system tab, app writes only (protected, owner only); 📊 = formulas.

| Tab | Type | Columns (after common `ID · Rev · Updated at · Updated by · Deleted`) |
|---|---|---|
| Read Me | — | how it works, colour legend |
| ✏️ Manual Edits | Teacher | v1 unchanged |
| ✏️ Members | Teacher | v1 + Shirt · Shoe · Sock · Consent part · Consent photo |
| ✏️ Timetable | Teacher | v1 unchanged |
| ✏️ Clashes | Teacher | Section · Day · Hour · Reason |
| 🔒 Roster link | System | v1 (runtime read of school roster; never copied to repo) |
| 🔒 Sessions / Attendance / Log | System | v1 + Production ID, Plan, Called parts on Sessions |
| 🔒 Productions | System | Title · Start · End · Status |
| 🔒 Performances | System | Production ID · Date · Call time · Venue · Label |
| 🔒 Items | System | Production ID · Kind · Title · Order · Minutes |
| 🔒 Scenes | System | Item ID · Title · Order · Notes |
| 🔒 Songs | System | Item ID · Scene ID · Title · Order · Track URL · Lyrics URL |
| 🔒 Groups | System | Production ID · Parent ID · Name · Order · Colour |
| 🔒 Parts | System | Group ID · Name · Capacity · Order |
| 🔒 Scene parts | System | Scene ID · Part ID |
| 🔒 Assignments | System | Part ID · Member ID · Kind (main/backup) · Order |
| 🔒 Readiness | System | Target type · Target ID · Level |
| 🔒 Positions | System | Item ID · Member ID · Row · Spot · Side |
| ✏️ Costumes | Teacher + app | Member ID · Kind · Size · Status · Supplier · Due · Photo file |
| ✏️ Props | Teacher + app | Name · Scene ID · Holder ID · Location · Source · Status · Photo file |
| ✏️ Parent requests | Teacher + app | Member ID · What · Prop ID · Due · Status · Remind at · Note |
| 🔒 Check-ins | System | Performance ID · Member ID · In at · Out at · Handed to |
| 🔒 Cues | System | Item ID · Order · Type · Label · Track URL |
| 🔒 Notes | System | Title · Mode · Body (Markdown, split if > 45,000 chars: Part n) · Checklist JSON · Drawing file ID · Tags · Pinned · Colour · Links · Attach · Sharing · Shared with |
| 🔒 Templates | System | Category · Name · Body |
| 🔒 Cast views | System | Name · Kind · Widgets JSON · Hide names |
| 🔒 Change log | System | Entity · ID · Field · Old · New · Rev · Device · At |
| 📊 Reports / 📊 Readiness board / 📊 Tailor order | Formulas | counts, %, below-75% flag; costume counts by kind/size for Tailor-D |

"Teacher + app" tabs: the app owns the ID/Rev columns (locked grey); teachers may edit the other columns; Code.gs picks up hand edits by an onEdit stamp (Rev+1, Updated by = "sheet").

## Sync
- Device keeps everything locally (offline first) and queues ops (v1 queue, `v:2` ops added); idempotent POST by `device+seq` (v1 duplicate protection).
- Pull: GET changes since last cursor (Change log row number).
- Conflicts: **last-write-wins per field** using `Updated at`, tie broken by `Rev` then device id. Every overwrite goes to Change log with old value, so nothing is lost and undo can send a reverse change (Q41a).
- Notes drawings: stored as files (PNG + vector JSON) in a Drive folder `CurtainCall/Drawings/<production>`; the Notes row keeps the file ID. Drawings sync slower and need the Apps Script Drive scope; offline drawings wait in the queue as blobs.
- Limits: ~10M cells per spreadsheet; one sheet per school year recommended; archive closes a Production (status archived) and can copy its rows to an archive file.
