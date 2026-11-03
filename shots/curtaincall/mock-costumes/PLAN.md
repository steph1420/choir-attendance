# Costumes — plan (Steve Q84–Q90, locked 4 Nov 2026). Mockups only.

Visual language = R7 Register: tinted rows by status, avatars, section rings with an all-button, open-in-place with E3 pills + Details sheet, floating colour circles (L→R spring pop-in), no greetings, nothing assumed.
"Costumes", every status/step name, source names and field labels are **per-event terminology** (renameable). Words below are defaults.

## Screens and states
| # | Screen | First layer (calm) | One step away (full power) |
|---|---|---|---|
| 1 | **By item** (default) | Item cards: photo/colour swatch, name, source chip, ring "9 / 12 ready", step bar, faces strip of who's still pending | Tap card → item page (who has it, step per child, bulk assign/advance); ⋯ → Details sheet |
| 2 | **By child** | Section rings + rows: avatar, name, item line, step pill (tinted). **Tap row = advance one step** (with undo toast) | ▾ open-in-place: step pills for that item's path + Details › + quick-note box; floating circles when the note box is focused |
| 3 | Floating note circles | Appear above the opened row when the note box is focused: Too long, Too short, Missing button, Torn, Needs wash, Other (editable) | Tap inserts a coloured token; long-press → edit options |
| 4 | Item details sheet | Name, photo(s), colour, source, assigned to (part/section/children) | "Fields" checklist: Contact, Due date, Cost, Quantity, Notes, Size chart, Supplier link… Only ticked fields render |
| 5 | Add item | Step 1 Name + photo · Step 2 **Source picker** (circles: Bought, Rented, Tailor, Made at home, School store, Other) · Step 3 Assign (part / section / pick children / everyone) | Typed one-off: "Just for one child" link skips the catalogue |
| 6 | Child measurements | Latest set (chest, waist, length, shoulder, height, shoe…) with **recorded date**; "Re-measure" | History list of dated sets across events; compare with previous (Δ) |
| 7 | Empty state | "No items yet" + **Add your first item** + "Start from a template" (Choir: robe, sash; Play: per-part; Dance: outfit + shoes) | Import from last event |
| 8 | Rename terminology sheet | List of words with current value: screen name, item, steps per source, after-show steps, sources, field labels | Reset to defaults; per-event only |

Toggle By item / By child = segmented control in the header (remembered per device). Search + filter chips (step, source, section) on both.

## Steps (proposal)
- Per source path (editable): Tailor: Measured → At maker → Fitting → Ready · Bought: Ordered → Arrived → Ready · Rented: Booked → Collected → Ready · Made at home: Asked → In progress → Ready · School store: Requested → Ready · Other: To do → Ready.
- Shared after-show: Issued → Returned, with side states Needs fixing, Lost.
- "Tap to advance" moves along the item's own path; side states only via pills/circles.
- "Tailor" (or any source word) never appears unless chosen on that item.

## Data model changes (proposal only)
- `CostumeItem` (catalogue, per event): id, eventId, name, photos[], colour, source, assign {parts[], sections[], memberIds[]}, fields {contact?, due?, cost?, qty?, notes?…}, enabledFields[], oneOff?: boolean.
- `CostumeAssignment`: id, itemId, memberId, step, sideState?, notes[] (text + token + at + by), photos[], updatedAt. (Replaces today's flat `Costume{who,item,size,status}`; migrate each old record to a one-off item + assignment, status mapped onto the Tailor path.)
- `Measurement` (member-scoped, **not** event-scoped): id, memberId, recordedAt (date), values {key: number+unit}, by.
- `Terminology` (per event): map of keys → labels (screen name, steps per source, sources, field labels).
- `NoteOptions` (per event): circle options {label, icon, colour, when[]}.
- Sheet: new record tabs CostumeItems, CostumeAssignments, Measurements (generic REC_H_ columns, JSON body) + Terminology inside Events record.

## Open questions for Steve
1. Can a child have **more than one item** of the same catalogue entry (e.g. 2 shirts)? Quantity per child or per item?
2. Should "Tap to advance" be allowed for every teacher, or only coordinators (like care flags)?
3. Measurement keys: fixed default list (chest, waist, length, shoulder, height, shoe) with add-your-own, or fully custom per school?
4. Units: cm only, or cm/inch toggle?
5. Who can see cost? (hide behind a permission like care flags?)
6. After-show: should "Lost" ask for a cost/charge note to parents (WhatsApp copy like props)?
7. Templates for the empty state: which starter items per template (Choir / Play / Dance / Sports day)?
8. Photos: stored in Drive (Q71a) — one folder per event OK?
9. Should By item show a size tally for ordering ("S 4 · M 6") per source/maker?
