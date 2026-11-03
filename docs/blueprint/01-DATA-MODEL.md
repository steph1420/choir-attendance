# 01 — Data model (contract v2, PROPOSED)
Contract **v2 is additive to v1** (`src/data/model.ts`). v1 types (Child, Entry, Session, Op, QueuedOp v:1) keep working; v2 adds entities and ops. Every queued op carries `v` (1 or 2); the server accepts both; v1 clients ignore v2 tabs.

## Common fields (every v2 entity)
`id` (prefix + short random, e.g. `prd_7k2q`), `productionId` (where scoped), `createdAt`, `updatedAt` (ISO, device clock), `updatedBy` (teacher label), `rev` (integer, +1 per change), `deleted` (soft delete flag). IDs never change; names can.

## Entities
| Entity | ID | Key fields | Links |
|---|---|---|---|
| Production | `prd_` | title, startDate, endDate, status (planning/live/archived) | has Performances, Items, Groups |
| Performance | `prf_` | date, callTime, venue, label (Show 1/2) | Production |
| Item | `itm_` | kind (song/medley/play/other), title, order, minutes | Production; has Scenes, Songs |
| Scene | `scn_` | title, order, notes | Item; lists Parts on stage |
| Song | `sng_` | title, order, trackUrl, lyricsUrl, readiness | Item (and optional Scene) |
| Group (part-group tree) | `grp_` | name, parentId (null = root), order, colour?, collapsed? | self (any depth), Production |
| Part | `prt_` | name, groupId, capacity (seats, e.g. 21), order | Group; Scenes via SceneParts |
| SceneParts | `scp_` | sceneId, partId | join |
| Assignment | `asg_` | partId, memberId, kind (main/backup), order | Part, Member; back-up = kind backup |
| Member | `mem_` (v1 Child.id kept) | displayName (runtime from roster), section, sizes {shirt, shoe, sock}, careFlags[] (later), consent {take part, photo: yes/no/pending} | Assignments |
| Session (Rehearsal) | v1 Session | + productionId, plan[] (itemIds/sceneIds), calledParts[] | v1 |
| Attendance | v1 Entry | mark P/A/E (L dev), reason, leftEarly | Session × Member |
| Remark / Rating | v1 Entry | remark, stars 1–5 | Session × Member |
| Readiness | `rdy_` | targetType (item/scene/song), targetId, level (not-started/learning/ready), at | |
| Clash | `clh_` | section, day, slot, reason | used by planner |
| StagePosition | `pos_` | itemId (or sceneId), memberId, row, spot, side (entrance/exit) | |
| CostumeItem | `cos_` | memberId, kind (bow/braces/socks/shoes/…), size, status (needed/ordered/fitted/ready), supplier (Tailor-D), dueDate, photoFileId? | Member, Item? |
| Prop | `prp_` | name, sceneId, holderMemberId, location, source (school/parent), status, photoFileId? | Scene, Member, ParentRequest |
| ParentRequest | `req_` | memberId, what, propId?, dueDate, status (asked/confirmed/received/returned), remindAt, note | Member, Prop |
| CheckIn | `chk_` | performanceId, memberId, inAt, outAt, handedTo (free text) | Performance |
| Cue | `cue_` | itemId, order, type (music/light/other), label, trackUrl? | run sheet |
| Note | `not_` | title?, mode (text/checklist/draw/mixed), body (Markdown), checklist[], drawingFileId?, tags[], pinned, colour, links[] (noteIds), attach[] {type,id}, sharing (private/shared/view-only), sharedWith[] | anything via attach |
| Template | `tpl_` | category (notice/info/reminder/consent/thank-you/daily-report/custom), name, body with `{variables}` | pulls Production/Item/Session data |
| CastView | `cst_` | name, kind (mirror/curated/custom), widgets[] {type, x, y, w, h}, hideNames (default false) | |
| ChangeLog | `chg_` | entity, id, field, old, new, rev, device, at | every write |

## Rules
- Tree any depth: Group.parentId; cycles rejected on write; order is per parent.
- Double-booking: one Member with main Assignments in two Parts whose Scenes overlap in the running order → flag red. Gap: Part with fewer main Assignments than capacity, or no backup → amber.
- Sizes, care flags and consent are per Member and never cast.
- Codenames/placeholders only in repo fixtures; real names only at runtime.
