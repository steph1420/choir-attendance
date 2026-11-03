/**
 * CurtainCall (was Choir Attendance) — Google Apps Script web endpoint (DRAFT v0.1.0, contract v1).
 * Bound to the CurtainCall spreadsheet (setup() uses the active spreadsheet — NOT the school roster).
 * Menu CurtainCall > Import roster copies the class list into Members by header name (importRoster).
 * Layout v1: row 1 instructions banner, row 2 headers, data from row 3.
 * Tabs: Roster link, Members, Timetable, Sessions, Attendance, Manual Edits, Reports, Log.
 * The roster is read live via IMPORTRANGE or ROSTER_SHEET_ID below; names are never written to the repo.
 * Contract: POST {v:1, ops:[QueuedOp]} -> {v:1, ok:true, ackedSeq}; GET ?since=<iso> -> {v:1, ok:true, members, sessions, attendance, manualEdits}
 */
var CONTRACT_V = 2; // v2 is additive: v1 bodies are still accepted and answered as v1
var SUPPORTED_V = [1, 2];
var SHEET_LAYOUT_V = 1; // row 1 = instructions banner, row 2 = headers, data from row 3
var HEADER_ROW = 2, FIRST_ROW = 3;
var HOUR_CODE = { '1st hour': 'H1', '2nd hour': 'H2', 'Extra': 'X' };
var ROSTER_SHEET_ID = ''; // set in Script Properties: ROSTER_SHEET_ID (read-only use)
var TABS = {
  roster: 'Roster link', members: 'Members', timetable: 'Timetable', sessions: 'Sessions',
  attendance: 'Attendance', manual: 'Manual Edits', reports: 'Reports', log: 'Log'
};
var REC_H_ = ['ID', 'Event ID', 'Rev', 'Updated at', 'Updated by', 'Deleted', 'Record JSON'];
var HEADERS = {
  'Members': ['Child ID', 'Section', 'Role', 'From', 'To', 'Note', 'Name (auto)'],
  'Timetable': ['Day', 'Hour', 'Start', 'End', 'Venue', 'Active?'],
  'Sessions': ['Session ID', 'Date', 'Slot', 'Venue', 'Start', 'End', 'Status', 'Taken by', 'Remark', 'Event ID'], // v2 appends Event ID
  'Attendance': ['Session ID', 'Child ID', 'Mark', 'Reason', 'Left early', 'Remark', 'Stars', 'Device', 'Seq', 'At'],
  'Manual Edits': ['Date', 'Hour', 'Child ID', 'New mark', 'Reason (E only)', 'Note', 'Status (auto)', 'Applied at (auto)', 'Name (auto)'],
  'Log': ['At', 'Device', 'Seq', 'Op JSON'],
  'Reports': ['Child ID', 'Name', 'Section', 'P', 'A', 'L', 'E', 'Marked', 'Attendance %', 'Flag'],
  'Roster link': ['Child ID', 'Section', 'Name (placeholder)'],
  // v2 (CurtainCall) record tabs: one row per record, last write wins by Updated at, every overwrite in Change log.
  'Events': REC_H_, 'Costumes': REC_H_, 'Props': REC_H_, 'Notes': REC_H_, 'QuickNotes': REC_H_, 'CareFlags': REC_H_, 'Permissions': REC_H_,
  'Change log': ['At', 'Entity', 'ID', 'Event ID', 'Old JSON', 'New JSON', 'Device', 'Seq', 'Result']
};
/** v2 op kind -> tab. Ops look like {t:'costumes.upsert'|'costumes.remove', item:{id,...}, eventId?}. */
var RECORD_TABS = { events: 'Events', costumes: 'Costumes', props: 'Props', notes: 'Notes', quicknotes: 'QuickNotes', care: 'CareFlags', permissions: 'Permissions' };
var STATUS_APPLIED = '\u2713 Applied', STATUS_ERROR = '\u26a0 Error: ';

/** Run once from the editor: creates missing tabs with headers. Safe to re-run. */
function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(HEADERS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) { sh.appendRow([name.toUpperCase()]); sh.appendRow(HEADERS[name]); }
    // Additive upgrade (v1 -> v2): fill only blank header cells added at the end; never renames existing ones.
    var hv = sh.getRange(HEADER_ROW, 1, 1, HEADERS[name].length).getValues()[0];
    HEADERS[name].forEach(function (h, i) { if (hv[i] === '') sh.getRange(HEADER_ROW, i + 1).setValue(h); });
    checkHeaders_(sh, name);
  });
}

/** Fails loudly if a header was renamed/moved (CODE-5: no silent mismatch). */
function checkHeaders_(sh, name) {
  var want = HEADERS[name], got = sh.getRange(HEADER_ROW, 1, 1, want.length).getValues()[0];
  for (var i = 0; i < want.length; i++) if (String(got[i]) !== want[i]) throw new Error('Tab "' + name + '" column ' + (i + 1) + ' should be "' + want[i] + '" but is "' + got[i] + '"');
}
function dataRows_(sh, ncol) { var n = sh.getLastRow(); return n < FIRST_ROW ? [] : sh.getRange(FIRST_ROW, 1, n - FIRST_ROW + 1, ncol).getValues(); }
function isoDate_(d) { if (d instanceof Date) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd'); return String(d).slice(0, 10); }

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData.contents);
    if (SUPPORTED_V.indexOf(body.v) < 0) return json_({ v: CONTRACT_V, ok: false, error: 'contract version ' + body.v + ' not supported' });
    var ss = SpreadsheetApp.getActive();
    var log = ss.getSheetByName(TABS.log), seen = seenKeys_(log), acked = 0;
    body.ops.forEach(function (q) {
      var key = q.device + ':' + q.seq; acked = Math.max(acked, q.seq);
      if (seen[key]) return; // duplicate delivery: idempotent
      applyOp_(ss, q);
      log.appendRow([q.at, q.device, q.seq, JSON.stringify(q.op)]);
    });
    return json_({ v: body.v, ok: true, ackedSeq: acked });
  } catch (err) {
    return json_({ v: CONTRACT_V, ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}

function seenKeys_(log) {
  var out = {};
  dataRows_(log, 3).forEach(function (r) { out[r[1] + ':' + r[2]] = true; });
  return out;
}

/** Upsert one Attendance row per (session, child). Last write wins (A-02 Q12), every op is in Log. */
function applyOp_(ss, q) {
  var op = q.op;
  if (op.t === 'quickNote') return applyRecord_(ss, q, 'quicknotes', 'upsert', op); // QuickNotes client op
  var m = /^(\w+)\.(upsert|remove)$/.exec(op.t || '');
  if (m) { if (!RECORD_TABS[m[1]]) throw new Error('unknown record kind ' + m[1]); return applyRecord_(ss, q, m[1], m[2], op.item); }
  if (op.eventId && op.sessionId) upsertSession_(ss, op.sessionId, { 'Event ID': op.eventId });
  if (op.t === 'takenBy') return upsertSession_(ss, op.sessionId, { 'Taken by': op.name });
  var ids = op.t === 'allPresent' ? op.childIds : [op.childId];
  var sh = ss.getSheetByName(TABS.attendance);
  ids.forEach(function (cid) {
    var row = findRow_(sh, op.sessionId, cid), vals = row ? sh.getRange(row, 1, 1, 10).getValues()[0] : [op.sessionId, cid, '', '', '', '', '', '', '', ''];
    if (op.t === 'mark') { vals[2] = op.mark || ''; vals[3] = op.mark === 'E' ? (op.reason || '') : ''; }
    if (op.t === 'allPresent' && !vals[2]) vals[2] = 'P';
    if (op.t === 'leftEarly') vals[4] = op.value ? 'Y' : '';
    if (op.t === 'note') { vals[5] = op.remark || ''; vals[6] = op.stars || ''; }
    vals[7] = q.device; vals[8] = q.seq; vals[9] = q.at;
    if (row) sh.getRange(row, 1, 1, 10).setValues([vals]); else sh.appendRow(vals);
  });
}

function findRow_(sh, sid, cid) {
  var v = dataRows_(sh, 2);
  for (var i = 0; i < v.length; i++) if (v[i][0] === sid && v[i][1] === cid) return i + FIRST_ROW;
  return 0;
}

function upsertSession_(ss, sid, patch) {
  var sh = ss.getSheetByName(TABS.sessions), h = HEADERS['Sessions'];
  var ids = dataRows_(sh, 1).map(function (r) { return r[0]; });
  var i = ids.indexOf(sid), row = i >= 0 ? i + FIRST_ROW : Math.max(sh.getLastRow(), HEADER_ROW) + 1;
  if (i < 0) sh.getRange(row, 1).setValue(sid);
  Object.keys(patch).forEach(function (k) { sh.getRange(row, h.indexOf(k) + 1).setValue(patch[k]); });
}

/** Pull: app reads members, sessions, attendance and un-applied Manual Edits. Manual Edits win, then get stamped Applied. */
function doGet(e) {
  try { return doGet_(e); } catch (err) { return json_({ v: CONTRACT_V, ok: false, error: String(err.message || err) }); }
}
function doGet_(e) {
  var ss = SpreadsheetApp.getActive();
  var read = function (name) { var sh = ss.getSheetByName(name); return sh ? dataRows_(sh, HEADERS[name].length) : []; };
  var edits = applyManualEdits_(ss);
  var v = e && e.parameter && e.parameter.v == 2 ? 2 : 1, extra = v === 2 ? { records: readRecords_(ss) } : {};
  return json_(Object.assign({ v: v, ok: true, layout: SHEET_LAYOUT_V, members: read(TABS.members), timetable: read(TABS.timetable), sessions: read(TABS.sessions), attendance: read(TABS.attendance), manualEdits: edits, roster: rosterLive_() }, extra));
}

/** Manual Edits: rows with empty Status are applied (they win, last write), then stamped. Bad rows get a clear error. */
function applyManualEdits_(ss) {
  var sh = ss.getSheetByName(TABS.manual); checkHeaders_(sh, 'Manual Edits');
  var out = [];
  dataRows_(sh, 8).forEach(function (r, i) {
    var row = i + FIRST_ROW, status = String(r[6] || '');
    if (!r[0] && !r[2] && !r[3]) return;          // empty row
    if (status.indexOf(STATUS_APPLIED) === 0) return; // done
    var err = !r[0] ? 'pick a Date' : !HOUR_CODE[r[1]] ? 'pick an Hour' : !r[2] ? 'pick a Child ID' : ['P', 'A', 'L', 'E'].indexOf(r[3]) < 0 ? 'New mark must be P, A, L or E' : '';
    if (err) { sh.getRange(row, 7).setValue(STATUS_ERROR + err); return; }
    var sid = isoDate_(r[0]) + '-' + HOUR_CODE[r[1]];
    applyOp_(ss, { device: 'manual', seq: 0, at: new Date().toISOString(), op: { t: 'mark', sessionId: sid, childId: String(r[2]), mark: r[3], reason: r[3] === 'E' ? r[4] : '' } });
    sh.getRange(row, 7, 1, 2).setValues([[STATUS_APPLIED, new Date().toISOString()]]);
    out.push({ sessionId: sid, childId: String(r[2]), mark: r[3], reason: r[4], note: r[5] });
  });
  return out;
}

/** Roster is read live at request time (read-only). Never copied into the repo. */
function rosterLive_() {
  var id = PropertiesService.getScriptProperties().getProperty('ROSTER_SHEET_ID') || ROSTER_SHEET_ID;
  if (!id) return [];
  var out = [], src = SpreadsheetApp.openById(id);
  src.getSheets().forEach(function (sh) { // every class tab; header row 1 (Roll No., Name, Adm. No.), matched by name
    rosterRows_(sh).forEach(function (r) { out.push({ id: r.id, name: r.name, section: r.section }); });
  });
  return out;
}

/** Roster columns are matched by header name (row 1), never by position. Section = tab name, spaces tidied ("PREP  B" -> "PREP B"). */
var ROSTER_COLS = { id: 'adm. no.', name: 'name' };
function normHdr_(h) { return String(h).replace(/\s+/g, ' ').trim().toLowerCase(); }
function rosterRows_(sh) {
  var lastR = sh.getLastRow(), lastC = sh.getLastColumn(); if (lastR < 2 || lastC < 1) return [];
  var hdr = sh.getRange(1, 1, 1, lastC).getValues()[0].map(normHdr_);
  var ci = hdr.indexOf(ROSTER_COLS.id), ni = hdr.indexOf(ROSTER_COLS.name); if (ci < 0) return [];
  var section = String(sh.getName()).replace(/\s+/g, ' ').trim();
  return sh.getRange(2, 1, lastR - 1, lastC).getValues().filter(function (r) { return String(r[ci]).trim() !== ''; })
    .map(function (r) { return { id: String(r[ci]).trim(), name: ni < 0 ? '' : r[ni], section: section }; });
}

/** Menu: CurtainCall > Import roster. Runs inside Steve's Google account, so names never leave Google. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('CurtainCall').addItem('Import roster', 'importRoster').addItem('Set up tabs', 'setup').addToUi();
}

/**
 * One-time (re-runnable) copy of the class list into Members, by header name:
 *   Adm. No. -> Child ID, tab name -> Section, Name -> Name (auto). Roll No. is not copied.
 * Source id: Script Property ROSTER_SHEET_ID (asked for once if missing). The source is only read.
 * Existing Child IDs are skipped, so hand edits (Role, From, To, Note) are kept.
 */
function importRoster(srcId) {
  var props = PropertiesService.getScriptProperties();
  var id = srcId || props.getProperty('ROSTER_SHEET_ID') || ROSTER_SHEET_ID, ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch (e) { ui = null; }
  if (!id && ui) {
    var resp = ui.prompt('Import roster', 'Paste the class list file link or id:', ui.ButtonSet.OK_CANCEL);
    if (resp.getSelectedButton() !== ui.Button.OK) return 0;
    var m = String(resp.getResponseText()).match(/[-\w]{25,}/); id = m ? m[0] : '';
    if (id) props.setProperty('ROSTER_SHEET_ID', id);
  }
  if (!id) throw new Error('No class list id. Set Script Property ROSTER_SHEET_ID.');
  var ss = SpreadsheetApp.getActive(), mem = ss.getSheetByName(TABS.members) || setupTab_(ss, TABS.members);
  checkHeaders_(mem, 'Members');
  var h = HEADERS['Members'], seen = {};
  dataRows_(mem, 1).forEach(function (r) { if (r[0] !== '') seen[String(r[0])] = true; });
  var add = [];
  SpreadsheetApp.openById(id).getSheets().forEach(function (sh) {
    rosterRows_(sh).forEach(function (r) {
      if (seen[r.id]) return; seen[r.id] = true;
      var row = h.map(function () { return ''; });
      row[h.indexOf('Child ID')] = r.id; row[h.indexOf('Section')] = r.section; row[h.indexOf('Name (auto)')] = r.name;
      add.push(row);
    });
  });
  if (add.length) mem.getRange(Math.max(mem.getLastRow() + 1, FIRST_ROW), 1, add.length, h.length).setValues(add);
  if (ui) ui.alert('CurtainCall: imported ' + add.length + ' new member(s).');
  return add.length;
}

/** v2: upsert/remove one record. Last write wins by op time (ties: later device+seq). Stale writes are logged, not applied. */
function applyRecord_(ss, q, kind, action, item) {
  var tab = RECORD_TABS[kind], sh = ss.getSheetByName(tab) || setupTab_(ss, tab), clog = ss.getSheetByName('Change log') || setupTab_(ss, 'Change log');
  if (!item || !item.id) throw new Error(kind + ' op needs item.id');
  var ids = dataRows_(sh, 1).map(function (r) { return String(r[0]); }), i = ids.indexOf(String(item.id));
  var row = i >= 0 ? i + FIRST_ROW : 0, old = row ? sh.getRange(row, 1, 1, 7).getValues()[0] : null;
  var eventId = item.eventId || (old ? old[1] : '') || '';
  if (old && String(old[3]) > String(q.at)) { clog.appendRow([q.at, kind, item.id, eventId, old[6], JSON.stringify(item), q.device, q.seq, 'stale: kept newer']); return; }
  var rev = old ? Number(old[2] || 0) + 1 : 1;
  var vals = [String(item.id), eventId, rev, q.at, q.device, action === 'remove' ? 'Y' : '', action === 'remove' ? (old ? old[6] : '') : JSON.stringify(item)];
  if (row) sh.getRange(row, 1, 1, 7).setValues([vals]); else sh.appendRow(vals);
  clog.appendRow([q.at, kind, item.id, eventId, old ? old[6] : '', action === 'remove' ? '' : vals[6], q.device, q.seq, action]);
}
function setupTab_(ss, name) { var sh = ss.insertSheet(name); sh.appendRow([name.toUpperCase()]); sh.appendRow(HEADERS[name]); return sh; }
/** v2 pull: every record per kind as {id, rev, at, deleted, item} so clients can merge (last write wins) and see deletes. */
function readRecords_(ss) {
  var out = {};
  Object.keys(RECORD_TABS).forEach(function (k) {
    var sh = ss.getSheetByName(RECORD_TABS[k]); out[k] = [];
    if (sh) dataRows_(sh, 7).forEach(function (r) { if (r[0]) out[k].push({ id: String(r[0]), rev: Number(r[2]) || 0, at: String(r[3]), deleted: r[5] === 'Y', item: r[5] === 'Y' || !r[6] ? null : JSON.parse(r[6]) }); });
  });
  return out;
}
