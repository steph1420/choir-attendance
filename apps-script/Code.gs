/**
 * Choir Attendance — Google Apps Script web endpoint (DRAFT v0.1.0, contract v1).
 * Bound to the CHOIR ATTENDANCE spreadsheet (a new sheet you create — NOT the school roster).
 * Tabs: Roster link, Members, Timetable, Sessions, Attendance, Manual Edits, Reports, Log.
 * The roster is read live via IMPORTRANGE or ROSTER_SHEET_ID below; names are never written to the repo.
 * Contract: POST {v:1, ops:[QueuedOp]} -> {v:1, ok:true, ackedSeq}; GET ?since=<iso> -> {v:1, ok:true, members, sessions, attendance, manualEdits}
 */
var CONTRACT_V = 1;
var ROSTER_SHEET_ID = ''; // set in Script Properties: ROSTER_SHEET_ID (read-only use)
var TABS = {
  roster: 'Roster link', members: 'Members', timetable: 'Timetable', sessions: 'Sessions',
  attendance: 'Attendance', manual: 'Manual Edits', reports: 'Reports', log: 'Log'
};
var HEADERS = {
  'Members': ['Child ID', 'Role', 'From', 'To'],
  'Timetable': ['Day', 'Hour', 'Start', 'End', 'Venue'],
  'Sessions': ['Session ID', 'Date', 'Slot', 'Venue', 'Start', 'End', 'Status', 'Taken by', 'Remark'],
  'Attendance': ['Session ID', 'Child ID', 'Mark', 'Reason', 'Left early', 'Remark', 'Stars', 'Device', 'Seq', 'At'],
  'Manual Edits': ['Session ID', 'Child ID', 'New mark', 'Reason', 'Note', 'Applied?'],
  'Log': ['At', 'Device', 'Seq', 'Op JSON'],
  'Reports': ['(formulas only — see README)'],
  'Roster link': ['Child ID', 'Section', 'Name (live, IMPORTRANGE)']
};

/** Run once from the editor: creates missing tabs with headers. Safe to re-run. */
function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(HEADERS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS[name]);
  });
}

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
  var out = {}, n = log.getLastRow(); if (n < 2) return out;
  log.getRange(2, 2, n - 1, 2).getValues().forEach(function (r) { out[r[0] + ':' + r[1]] = true; });
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
  var n = sh.getLastRow(); if (n < 2) return 0;
  var v = sh.getRange(2, 1, n - 1, 2).getValues();
  for (var i = 0; i < v.length; i++) if (v[i][0] === sid && v[i][1] === cid) return i + 2;
  return 0;
}

function upsertSession_(ss, sid, patch) {
  var sh = ss.getSheetByName(TABS.sessions), h = HEADERS['Sessions'], n = sh.getLastRow();
  var ids = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(function (r) { return r[0]; }) : [];
  var i = ids.indexOf(sid), row = i >= 0 ? i + 2 : n + 1;
  if (i < 0) sh.getRange(row, 1).setValue(sid);
  Object.keys(patch).forEach(function (k) { sh.getRange(row, h.indexOf(k) + 1).setValue(patch[k]); });
}

/** Pull: app reads members, sessions, attendance and un-applied Manual Edits. Manual Edits win, then get stamped Applied. */
function doGet(e) {
  var ss = SpreadsheetApp.getActive();
  var read = function (name) { var sh = ss.getSheetByName(name); return sh && sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues() : []; };
  var manual = ss.getSheetByName(TABS.manual), edits = [];
  read(TABS.manual).forEach(function (r, i) {
    if (r[5] === 'Applied') return;
    edits.push({ sessionId: r[0], childId: r[1], mark: r[2], reason: r[3], note: r[4] });
    applyOp_(ss, { device: 'manual', seq: 0, at: new Date().toISOString(), op: { t: 'mark', sessionId: r[0], childId: r[1], mark: r[2], reason: r[3] } });
    manual.getRange(i + 2, 6).setValue('Applied');
  });
  return json_({ v: CONTRACT_V, ok: true, members: read(TABS.members), sessions: read(TABS.sessions), attendance: read(TABS.attendance), manualEdits: edits, roster: rosterLive_() });
}

/** Roster is read live at request time (read-only). Never copied into the repo. */
function rosterLive_() {
  var id = PropertiesService.getScriptProperties().getProperty('ROSTER_SHEET_ID') || ROSTER_SHEET_ID;
  if (!id) return [];
  var out = [], src = SpreadsheetApp.openById(id);
  ['KG A', 'KG B', 'PREP A', 'PREP B'].forEach(function (tab) {
    var sh = src.getSheetByName(tab); if (!sh || sh.getLastRow() < 2) return;
    sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function (r) { if (r[2]) out.push({ id: String(r[2]), name: r[1], section: tab }); });
  });
  return out;
}
