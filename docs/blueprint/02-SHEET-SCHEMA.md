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

## Contract v2 — as built (slice 1d, 2026-11-04)
Additive only: `Code.gs` accepts `v:1` and `v:2` bodies and answers with the same `v`, so v1 clients keep working. Missing v2 tabs are created on first use; `setup()` fills only blank header cells added at the end (it never renames).

| Tab | Columns | Notes |
|---|---|---|
| 🔒 Sessions | v1 + **Event ID** (col 10) | set when a v2 mark op carries `eventId`; session IDs for new events are `<eventId>/<date>-H2` |
| 🔒 Events · Costumes · Props · Notes · QuickNotes · CareFlags · Permissions | ID · Event ID · Rev · Updated at · Updated by · Deleted · Record JSON | one row per record; `Rev` +1 per write; remove = `Deleted = Y` (row kept) |
| 🔒 Change log | At · Entity · ID · Event ID · Old JSON · New JSON · Device · Seq · Result | every record write; `Result` = upsert / remove / `stale: kept newer` |

Ops (POST `{v:2, ops:[QueuedOp]}`; still idempotent by device+seq via Log):
- v1 ops unchanged; attendance ops may add `eventId`.
- `<kind>.upsert {item}` / `<kind>.remove {item:{id}}` for kind = events, costumes, props, notes, care, permissions.
- `quickNote {id, screen, text, at, by, eventId}` → QuickNotes tab.
- Conflict rule: last write wins by op time (`Updated at`); an older write is not applied and is logged as stale.
- Pull: `GET ?v=2` adds `records: {events, costumes, …}` (live rows only). Plain `GET` is the v1 reply.

Client: costumes, props, notes, quick notes and sessions are scoped by `eventId`; local data saved before v2 is moved into the current event once. Care flags and permissions are school-wide (not per event). Note: Record JSON can hold care notes — the CareFlags tab must stay owner-only (protected).
