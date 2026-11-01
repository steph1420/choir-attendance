/**
 * Choir Attendance — Google Apps Script web endpoint (DRAFT v0.1.0, contract v1).
 * Bound to the CHOIR ATTENDANCE spreadsheet (a new sheet you create — NOT the school roster).
 * Layout v1: row 1 instructions banner, row 2 headers, data from row 3.
 * Tabs: Roster link, Members, Timetable, Sessions, Attendance, Manual Edits, Reports, Log.
 * The roster is read live via IMPORTRANGE or ROSTER_SHEET_ID below; names are never written to the repo.
 * Contract: POST {v:1, ops:[QueuedOp]} -> {v:1, ok:true, ackedSeq}; GET ?since=<iso> -> {v:1, ok:true, members, sessions, attendance, manualEdits}
 */
var CONTRACT_V = 1;
var SHEET_LAYOUT_V = 1; // row 1 = instructions banner, row 2 = headers, data from row 3
var HEADER_ROW = 2, FIRST_ROW = 3;
var HOUR_CODE = { '1st hour': 'H1', '2nd hour': 'H2', 'Extra': 'X' };
var ROSTER_SHEET_ID = ''; // set in Script Properties: ROSTER_SHEET_ID (read-only use)
var TABS = {
  roster: 'Roster link', members: 'Members', timetable: 'Timetable', sessions: 'Sessions',
  attendance: 'Attendance', manual: 'Manual Edits', reports: 'Reports', log: 'Log'
};
var HEADERS = {
  'Members': ['Child ID', 'Section', 'Role', 'From', 'To', 'Note', 'Name (auto)'],
  'Timetable': ['Day', 'Hour', 'Start', 'End', 'Venue', 'Active?'],
  'Sessions': ['Session ID', 'Date', 'Slot', 'Venue', 'Start', 'End', 'Status', 'Taken by', 'Remark'],
  'Attendance': ['Session ID', 'Child ID', 'Mark', 'Reason', 'Left early', 'Remark', 'Stars', 'Device', 'Seq', 'At'],
  'Manual Edits': ['Date', 'Hour', 'Child ID', 'New mark', 'Reason (E only)', 'Note', 'Status (auto)', 'Applied at (auto)', 'Name (auto)'],
  'Log': ['At', 'Device', 'Seq', 'Op JSON'],
  'Reports': ['Child ID', 'Name', 'Section', 'P', 'A', 'L', 'E', 'Marked', 'Attendance %', 'Flag'],
  'Roster link': ['Child ID', 'Section', 'Name (placeholder)']
};
var STATUS_APPLIED = '\u2713 Applied', STATUS_ERROR = '\u26a0 Error: ';

/** Run once from the editor: creates missing tabs with headers. Safe to re-run. */
function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(HEADERS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) { sh.appendRow([name.toUpperCase()]); sh.appendRow(HEADERS[name]); }
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
    if (body.v !== CONTRACT_V) return json_({ v: CONTRACT_V, ok: false, error: 'contract version ' + body.v + ' not supported' });
    var ss = SpreadsheetApp.getActive();
    var log = ss.getSheetByName(TABS.log), seen = seenKeys_(log), acked = 0;
    body.ops.forEach(function (q) {
      var key = q.device + ':' + q.seq; acked = Math.max(acked, q.seq);
      if (seen[key]) return; // duplicate delivery: idempotent
      applyOp_(ss, q);
      log.appendRow([q.at, q.device, q.seq, JSON.stringify(q.op)]);
    });
    return json_({ v: CONTRACT_V, ok: true, ackedSeq: acked });
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
  return json_({ v: CONTRACT_V, ok: true, layout: SHEET_LAYOUT_V, members: read(TABS.members), timetable: read(TABS.timetable), sessions: read(TABS.sessions), attendance: read(TABS.attendance), manualEdits: edits, roster: rosterLive_() });
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
  ['KG A', 'KG B', 'PREP A', 'PREP B'].forEach(function (tab) {
    var sh = src.getSheetByName(tab); if (!sh || sh.getLastRow() < 2) return;
    sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function (r) { if (r[2]) out.push({ id: String(r[2]), name: r[1], section: tab }); }); // school roster: Roll No., Name, Adm. No. (header row 1)
  });
  return out;
}
