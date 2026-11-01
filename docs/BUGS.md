# Bugs / open issues
| ID | Status | What | Notes |
|---|---|---|---|
| BUG-1 | Fixed 0.1.0 | Status stuck on "Syncing N" until the 5 s retry | Drain loop added, guarded by progress; test added |
| BUG-2 | Fixed 0.1.1 | L/E and ⋯ popups on the last rows opened below the screen edge | Q27 = B: flip above when no room below |
| BUG-3 | Open | A–Z strip top offset is a CSS constant (200px) | Should measure the list top; move to config |
| ISSUE-4 | Open | Sessions not yet generated from the timetable; one sample session | v0.2 |
| ISSUE-5 | Open | Pull (GET) side and Manual Edits not wired in the app yet | v0.2 |
| ISSUE-6 | Open | Code.gs untested against a real sheet | needs a TEST copy (working rule 7) |
| ISSUE-7 | Open | Child history, member picker, reports, daily report, template maker, settings not built | later milestones |
| BUG-4 | Fixed 0.1.2 | doGet threw on header mismatch | returns {ok:false,error} |
| ISSUE-8 | Open | Child ID dropdowns in the TEST sheet are a fixed list (connector has no range-dropdown) | In the live sheet, change to "Dropdown from a range: 'Roster link'!A3:A" |
| ISSUE-9 | Open | Date cells use a date check + format, not a true date-picker rule | Double-click still opens the calendar; can switch to "Is valid date" in Sheets UI |
| ISSUE-10 | Open | Apps Script not yet deployed to the TEST sheet | needs Steve (steps in README) |
