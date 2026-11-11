# CurtainCall: Duties & Responsibilities, Practice Schedule & Important Dates (LOCKED plan, 2026-11-11, t100u/t101u)

Status: **LOCKED 2026-11-11 (Steve, t100u; school terms t101u)**. Answers in section 9. Q113a supersedes the Q70 dock (Steve approved). Image mockups come before any build (v1: `shots/curtaincall/mock-plan/` on `curtaincall-mockups`).
Privacy: placeholders only (Teacher A, Coordinator B, School-LF). No real names anywhere.
Fits into the blueprint on `curtaincall-stage1` (`docs/blueprint/00`, `01`, `03`, `04`, `07`) and extends it. It is not a separate app.

## 1. What Steve's paper notices contain (structure only)
1. **Duty roster.** Areas of work (Reception, Backscreen, Seating, Sound & Light, PR/Photography, Hall Decoration, Stage Coordination, Parking, Refreshment). Each has 1–2 staff and an "approval on/before" date.
2. **Weekly rehearsal timetable.** Two daily time blocks (Golden Hour 1 07:40–08:30, Golden Hour 2 10:30–11:20). Venues are the columns, weekdays the rows, and items or groups sit in the cells. Starts "with effect from" a date.
3. **Programme roles per day.** Anchor, Opening, Welcome Address and Vote of Thanks, separately for Day 1 and Day 2.
4. **Key dates.** Auditions, orientation with parents, dress rehearsals per section, a status-report deadline, and a meeting with agenda points.
5. **The notice itself.** Numbered, dated, and signed by the principal and coordinators.

Note: the photo files were not on the box when this was written. Section 1 comes from the parent's description.

## 2. What the industry calls these things
| On paper | Official term(s) | Who uses the term |
|---|---|---|
| Who does which area | Duty roster; committee assignments; **responsibility assignment matrix (RACI**: Responsible, Accountable, Consulted, Informed) | PM standard (Wikipedia, Atlassian) |
| Committees | Teams / departments; in Planning Center, **Teams** with **Positions** | Planning Center, Propared, theCallboard |
| "Approval on/before" | Due date + **sign-off / approver** (the "A" in RACI) | RACI, Asana, Monday |
| Weekly rehearsal grid | **Rehearsal schedule**; per day, a **daily call / call sheet**; venues are **locations/spaces** | Propared, theCallboard |
| All dates in one place | **Production calendar** / production schedule / planning timeline; important ones are **milestones** (key dates) | Propared, event-planning texts, Monday |
| Anchor, Welcome, Vote of Thanks | Roles in the **running order / run of show** (programme); the public version is the **agenda/programme** | CueHound, Eventdex, eventblox |
| Status-report deadline | **Status report / status update**; theatre also has a **rehearsal report** | Monday, theCallboard |
| Meeting with points | **Agenda** → **minutes** → **action items** | Universal |
| Numbered signed notice | **Circular / notice**; ParentSquare calls them **Posts** and **Alerts** | Schools, ParentSquare |

Patterns worth borrowing:
- **Planning Center Services:** an event is a Plan with tabs (Order, Teams). Teams hold Positions. Templates pre-fill the needed positions. On mobile there is a bottom tab bar and a ➕ button.
- **Propared:** one master **Timeline**. Every schedule is a filtered view of it (rehearsal schedule, venue calendar, personal itinerary). "Clone" makes repeats and "Shift" moves a block of dates. Contacts are kept as People, Organisations and Locations.
- **theCallboard:** colour-coded call types (rehearsal, dress, performance, fittings). "Only my calls" appears in the "My schedule: Upcoming · Conflicts · Updates" list. Changed times show the old time struck through. Calendars sync to the phone.
- **Things / Asana:** a personal **Today** and **Upcoming**, plus **My Tasks** and an **Inbox** for updates.
- **Whova:** Agenda plus a personal **My Agenda**.
- **Apple HIG:** keep 3–5 flat tabs and avoid a "More" tab. Each tab drills down with Back. Edits open in sheets. On iPad the tab bar becomes a sidebar, with at most two levels shown.

## 3. Names in the app (school terms, t101u; official term in brackets)
Steve asked (t101u) for terms close to what his school uses. These replace the earlier suggestions.
| Name in app | Official term | What it is |
|---|---|---|
| **Plan** (new tab) | Production office / production book | Home for all organising paperwork |
| **Duties & Responsibilities** (short: **Duties** in tight spots) | Duty roster · responsibility matrix (RACI) | Who looks after what, by when |
| **Nature of Work** | Task / deliverable name | The name of each duty, e.g. "Welcome desk & guest list" |
| **Teacher(s) In-charge** | Responsible / Accountable (R, A in RACI) | The staff doing and owning the work; the first one listed is the main in-charge |
| **Approval on/before** | Due date / deadline | Date the work must be shown for approval |
| **Approved by** | Approver / sign-off (A in RACI) | Who approves, e.g. a Co-ordinator or the Head |
| **Committees** | Committees / teams / departments | Groups of duties, e.g. Reception, Seating, Sound & Light |
| **Practice Schedule** | Rehearsal schedule · production calendar | Weekly timetable plus one-off events |
| **Golden Hour 1 / Golden Hour 2** (example names) | Time blocks / periods / slots | Renameable daily practice slots |
| **Cultural Items** | Acts / numbers / programme items | Songs, dances, plays, groups that practise |
| **Venues** | Locations / spaces | Auditorium, Hall, Play Area, classrooms |
| **Important Dates** | Milestones / key dates | Audition, Orientation, Dress Rehearsal, Meeting, deadlines |
| **Meetings** | Agenda · minutes · action items | Meeting points; decisions turn into Duties |
| **Notices** (numbered "Notice 3", "Notice 7") | Circulars | Numbered, dated, signed notices with original pictures kept |
| **Work Status Report** | Status report / status update | Short progress report on a duty or committee |
| **Programme Duties** (inside Show) | Run-of-show roles / programme roles | Anchor, Opening Prayer, Welcome Address, Vote of Thanks, per Day 1 (Sec A) / Day 2 (Sec B) |
| **Co-ordinator** (a staff role) | Coordinator / manager | Staff role that can approve and edit |

Every label stays renameable (U-01). Event templates (Choir, Play, Dance, Sports day) come with ready Committees and Programme Duties. **Opening Prayer** is a school-approved default label, kept as an exception to the faith-neutral rule (confirmed by Steve, t102u). Like every label it can still be renamed per event.

## 4. Data model in plain words
- **People.** Children, as today, plus **Staff** (adults). A staff member has a display name loaded at runtime, a role label (Teacher, Co-ordinator, Head) and optional contact details. Repo fixtures use codenames only.
- **Committee.** A name, a colour, a Co-ordinator (optional), members, and an order.
- **Duty (Duties & Responsibilities).** Belongs to a Committee (optional) and has:
  - **Nature of Work** (title) and short details
  - **Teacher(s) In-charge** (first listed = main in-charge, the accountable owner)
  - **Approval on/before** date
  - optional **Approved by** (approver, e.g. a Co-ordinator) and approval date
  - a status: To do → Doing → Waiting for approval → Done
  - a checklist, attachments, and links to Items, Props or Costumes
  - **Work Status Reports**

  Behind Advanced: "Ask" (consulted), "Keep informed" (informed), priority and repeat.
- **Venue.** A name, capacity (optional) and a colour.
- **Time block.** A name (e.g. Golden Hour 1), start time and end time.
- **Weekly plan (timetable).** Effective from and to dates, with cells of **day × time block × venue → Cultural Item**. One-day changes ("this day only") don't alter the weekly plan. Clashes reuse the existing Clash rules.
- **Schedule event.** One-off: a date, time, venue, type (rehearsal, dress rehearsal, audition, meeting, orientation, performance, deadline, other), who is called, and an optional **Important Date** flag. The weekly plan creates events automatically. Performance (already in the model) becomes a Schedule event too.
- **Programme Duties.** Per Performance: role label → person (staff or child) → section/group (optional) → order in the running order. **Entered once, shown in two places** (Q119 note): in Show → Programme Duties, and in the **programme schedule / running order** as the person shown against that segment (e.g. Anchor, Welcome Address). Editing either place edits the same record.
- **Meeting.** Date, time, venue, attendees, **agenda points**, minutes and **actions**. Each action becomes a Duty with one tap.
- **Notice.** Number (auto-suggested, e.g. N-07), date, from (role), title, body, **the original pictures of every page, always preserved** (Q121 note: never altered or deleted when the notice is edited; stored privately in Drive like Q71, original resolution, page order kept), and links to the Duties, Dates and Weekly plan it created. Copy-ready WhatsApp text follows Q64.
- **Work Status Report.** Text, author, time and a status change (optional). It attaches to a Duty or a Committee.
- Every change goes into the existing ChangeLog, so undo works as it does everywhere else.

Proposed new IDs (additive to contract v2): `stf_` Staff, `com_` Committee, `dut_` Duty, `wsr_` WorkStatusReport, `ven_` Venue, `tbk_` TimeBlock, `wkp_` WeeklyPlan, `wkc_` WeeklyCell, `evt_` ScheduleEvent, `rod_` RoleOnDay, `mtg_` Meeting, `ntc_` Notice.

## 5. Where it lives (menus)
**Dock (recommended, Q113a):** **Today · Show · Plan · Members · Notes**, with the gear in the top bar for Settings. **Reports** moves into Plan (attendance %, readiness, Tailor order, Duty progress). That keeps the dock at five tabs with no "More" tab, as the Apple HIG advises.

### Phone: first layer vs one step deeper
| Tab | First screen (glance) | One tap deeper | Advanced (behind "More options") |
|---|---|---|---|
| **Today** | **Now & next** (current time block: what is rehearsing where), **My Duties** due soon, **next 3 Important Dates**, latest Notice, then the existing roll call | Duty sheet · event sheet · notice | – |
| **Show** | Running order (as today) with role holders shown on each segment + **Programme Duties** strip per performance (Day 1 / Day 2) | Item tabs (as blueprint) · role picker sheet | Cue details |
| **Plan** | Segmented control: **Duties · Practice Schedule · Important Dates** (short labels Duties · Schedule · Dates) (top three), plus a row of small tiles: Meetings, Notices, Reports | Duty → sheet; Schedule → week grid → cell sheet; Date → event sheet | RACI fields, repeat rules, numbering format, import |
| **Members** | **Children · Staff** switch | Person sheet shows their **Duties, Programme Duties and practice calls** too | – |
| **Notes** | Unchanged | Notes can link to a Duty, Meeting or Notice | – |

**Inside Plan:**
- **Duties:**
  - Group by **Committee** (default), **Person** or **Due date**, remembered per device as in Q45a.
  - Each row shows the Nature of Work, Teacher(s) In-charge initials, an Approval on/before chip (amber when due within 3 days, rose when overdue) and a status dot.
  - A filter chip at the top switches to **"Mine"**.
- **Schedule:**
  - **Week** (timetable grid: days × time blocks with venues inside), **List** (upcoming) and **Month** views.
  - On phone the Week view shows one day at a time, swiped left and right. Landscape or iPad shows the full grid with venues as columns, matching the paper.
- **Important Dates:** a list by month, with a countdown on the next one ("Dress rehearsal, in 12 days").

### iPad (landscape) and desktop
- On iPad the dock becomes the left sidebar. Plan expands to Duties, Schedule, Dates, Meetings, Notices and Reports, two levels at most.
- Lists sit on the left (about 60%) and the detail panel on the right (about 40%), as in the blueprint.
- On desktop:
  - **Duties** gets a **board** (columns by status) and a **matrix** (Committees × People, the RACI view, read-only by default).
  - **Schedule** gets the full venue grid with drag-to-move and "Shift dates".

## 6. Quick access ideas
1. **Today** answers "what now?": Now & next, My duties, next dates.
2. **One search** (top of every tab) finds people, duties, dates, notices and items. Typing "Hall" shows everything happening in the Hall.
3. **➕ quick add** (same spot as + Note) with one sheet: Duty · Date · Note · Notice.
4. **Calendar subscription (.ics):** Practice Schedule and Important Dates show up in Apple Calendar and Google Calendar, including their widgets and lock-screen. This is the honest answer for widgets, because a web app can't make its own iPhone/iPad widgets. There's a "My calls only" feed and an "Everything" feed.
5. **Share / print:**
   - Any view turns into a clean A4 PDF in the familiar notice layout (number, date, table, approval/signature lines): duty roster, weekly timetable, Programme Duties, or a meeting with its minutes.
   - It can also become copy-ready WhatsApp text.
6. **Changes are visible:** a moved time shows the old one struck through, borrowing from theCallboard. There's a small "Changed" badge for 48 h.
7. **Reminders:** a due-date reminder in the app and the calendar feed carries alerts. Push notifications come later.
8. **Screencast** (existing): the "Today's rehearsals" grid can be shown on the smartboard.

## 7. From paper notice to app data
- **Step 1 (first build), type it in fast:**
  - **New notice** → choose a ready layout: *Duty roster*, *Weekly timetable*, *Programme Duties*, *Important Dates* or *Meeting*.
  - Each layout is a quick form. For example, the roster is a list of Committee → people → date, and the timetable is a grid to tap-fill.
  - Attach a photo of the paper as the original. Saving creates the Duties, Dates and so on, all linked back to the Notice.
- **Step 2 (later), photo import:**
  - Take or pick a photo. On iPad, Live Text can copy the text on the device; later the iPad plan's on-device AI or an AI reader can do it.
  - The app suggests rows (Committee, people, date) on a **check screen**, and nothing saves until the teacher confirms.
  - Names are matched to existing People at runtime and never stored outside the live sheet.
  - This links into the iPad power plan in `08-IPAD-POWER-PLAN.md`.
- **Step 3, the reverse:** the app can print the notice from the data, so the paper and the app never disagree.

## 8. Build order (suggestion)
1. Mockups (images) for Plan → Duties, Schedule week grid, Today additions and Programme Duties.
2. Data: Staff, Committee, Duty, Venue, Time block, Weekly plan, Event (sheet tabs on TEST).
3. Screens: Duties list + sheet → Schedule week/list → Dates → Today cards.
4. Notices + Meetings, PDF/WhatsApp share, .ics feed.
5. Photo import (with the iPad plan).

## 9. Decisions (LOCKED 2026-11-11, Steve t100u)
| Q | Answer | Note |
|---|---|---|
| Q113 | **a**: new **Plan** tab; dock = Today · Show · Plan · Members · Notes; Reports moves inside Plan | Supersedes the Q70 dock |
| Q114 | **a**: **Duties** → shown as **Duties & Responsibilities** (t101u) | Short label "Duties" in tight UI |
| Q115 | **b**: **Committees** (not Teams) | Renamed throughout |
| Q116 | **a**: Teacher(s) In-charge, Approval on/before, Status on screen; Approved by / Ask / Keep informed behind More options | Terms per t101u |
| Q117 | **a**: Practice Schedule grid like the paper; one day per screen on phone, full grid on iPad; "from date" + "this day only" | |
| Q118 | **a**: one **Important Dates** list, also in the Schedule calendar, with countdown | |
| Q119 | **a**: **Programme Duties** (asked as "Roles on the day") inside Show, per Day 1 (Sec A) / Day 2 (Sec B) | Steve: "this will also be in programme schedule". Entered once; shown in Show and in the programme schedule / running order |
| Q120 | **a**: Members gets **Children · Staff** switch | |
| Q121 | **a**: **Notices** list in Plan | Steve: also **preserve the original pictures** of notices (all pages, unaltered) |
| Q122 | **a**: quick type-in forms first (photo attached); photo import with check screen later | |
| Q123 | **a**: Today shows Now & next, My duties, next 3 dates; calendar subscription (.ics) | |
| Q124 | **a**: mockups now; build right after Stage 1 (after 2026-12-20) | |

### Original question wording (for the record; earlier names, superseded by section 3)
**Q113. Where do the new things live?**
a) New **Plan** tab; dock becomes Today · Show · Plan · Members · Notes; Reports moves inside Plan ✅
b) Keep the dock; put Duties and Schedule inside Show
c) Six tabs (add Plan, keep Reports)

**Q114. Name for "who does what by when"?**
a) **Duties** ✅
b) Jobs
c) Responsibilities
d) Tasks

**Q115. Name for the groups (Reception, Seating, Sound & Light…)?** (answered b: Committees)
a) **Teams** ✅
b) Committees
c) Areas

**Q116. How much detail on each duty?**
a) Simple on screen: Lead, Helpers, Due date, Status (To do · Doing · Waiting for sign-off · Done); Sign-off by, "Ask" and "Keep informed" behind More options ✅
b) Full RACI (Responsible, Accountable, Consulted, Informed) always on screen
c) Just people + date + done tick

**Q117. How should the weekly rehearsal timetable look?**
a) Grid like the paper (days × time blocks, rooms as columns), one day per screen on phone, full grid on iPad; "from date" + "this day only" changes ✅
b) Plain list by day
c) Month calendar only

**Q118. Key dates (auditions, dress rehearsals, deadlines, meetings)?**
a) One **Dates** list (flagged events) that also shows in the Schedule calendar, with a countdown to the next ✅
b) Separate lists per type
c) Only inside the calendar, no list

**Q119. Anchor, Opening, Welcome Address, Vote of Thanks?**
a) **Programme Duties** (was Programme Duties) inside Show, per performance (Day 1 / Day 2), in running order ✅
b) As Duties in Plan
c) Both (role in Show, prep duty in Plan, linked)

**Q120. Where do staff (teachers, coordinators) live?**
a) Members gets a **Children · Staff** switch; a person's sheet shows their duties, roles and calls ✅
b) A separate Staff list inside Plan
c) No staff list; type names on each duty

**Q121. Notices (circulars)?**
a) **Notices** list in Plan: number, date, from, original photo/PDF, and the duties/dates it created; can print in the familiar layout ✅
b) Keep notices as Notes with a "Notice" tag
c) Leave notices on paper; only enter the duties and dates

**Q122. Turning a paper notice into app data?**
a) First: quick type-in forms (roster, timetable, roles, dates, meeting) with the photo attached; later: photo import with a check screen before saving ✅
b) Photo import first
c) Type-in only, never photo import

**Q123. Quick access?**
a) Today shows Now & next, My duties and the next 3 dates; plus a calendar subscription so dates appear in Apple Calendar and its widgets ✅
b) Today unchanged; use the Plan tab only
c) (a) plus push notifications now (more setup, later is easier)

**Q124. When to build?**
a) Mockups now; build right after Stage 1 (after 20 Dec), so it's ready for Parents' Day rehearsals ✅
b) Build before Props & Notes (changes Stage 1)
c) After Parents' Day

## 10. Sources
- Planning Center (Teams, Positions, templates, mobile Plans tab): https://help.planningcenter.com/en/142899-set-up-split-teams.html · https://help.planningcenter.com/en/139469-set-up-plan-templates.html · https://help.planningcenter.com/en/142861-organize-people-with-tags.html
- Propared (Timeline, Production Books, Contacts/Locations, Clone/Shift): https://www.propared.com/how-does-propared-work/ · https://www.propared.com/explore-scheduling/ · https://help.propared.com/article/9cvkp3uiei-part-5-production-books-and-sharing-information-training-video-8-42
- theCallboard (call types, My schedule, conflicts, struck-through changes, rehearsal reports): https://thecallboard.app/
- RACI / responsibility assignment matrix: https://en.wikipedia.org/wiki/Responsibility_assignment_matrix · https://www.atlassian.com/work-management/project-management/raci-chart · https://www.essex.ac.uk/staff/strategic-project-delivery/responsibility-matrix
- Run of show / running order / call sheet / production schedule: https://cuehound.com/run-of-show · https://www.eventdex.com/guides/run-of-show/ · https://astrablack.co/insights/call-sheet-vs-run-of-show/ · https://uark.pressbooks.pub/eventplanning/chapter/the-event-document-set/
- Things (Today, Upcoming, Anytime, Someday): https://culturedcode.com/things/support/articles/4001304/ · Asana Home / My Tasks / Inbox: https://help.asana.com/hc/en-us/articles/14250783001627-How-to-start-using-Asana
- Whova Agenda / My Agenda: https://whova.zendesk.com/hc/en-us/articles/17111969814683-How-do-I-add-a-session-to-my-Agenda
- ParentSquare Posts / Smart Alerts / sign-ups: https://help.knoxschools.org/en_US/parentsquare/parentsquare-introduction-for-parents
- Apple-style navigation (tab bar 3–5, no More tab, iPad sidebar): https://learningux.com/en/modules/12-navigation-ia/ · https://frankrausch.com/ios-navigation/
