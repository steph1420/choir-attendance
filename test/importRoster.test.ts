import { readFileSync } from 'fs'
import { loadCodeGs } from './fakeSheets'
const src = readFileSync('apps-script/Code.gs', 'utf8')
// Synthetic roster only (codenames): header row 1 like the class list, columns matched by name.
const roster = {
  'KG A': [['Roll No.', 'Name', 'Adm. No.'], [1, 'Pupil-1', 'T001'], [2, 'Pupil-2', 'T002'], ['', '', '']],
  'PREP  B': [['Adm. No.', 'Roll No.', 'Name'], ['T101', 1, 'Pupil-3']],
}
function fresh() {
  const g0 = loadCodeGs(src, {})
  const tabs: Record<string, unknown[][]> = {}
  for (const [n, h] of Object.entries(g0.HEADERS as Record<string, string[]>)) tabs[n] = [[n], h]
  return loadCodeGs(src, tabs, roster)
}
test('importRoster copies by header name into Members from row 3', () => {
  const g = fresh(); expect(g.importRoster('SRC')).toBe(3)
  const m = g.sheets.get('Members')!.rows
  expect(m.slice(2)).toEqual([
    ['T001', 'KG A', '', '', '', '', 'Pupil-1'], ['T002', 'KG A', '', '', '', '', 'Pupil-2'], ['T101', 'PREP B', '', '', '', '', 'Pupil-3']])
})
test('importRoster is re-runnable: keeps hand edits, adds only new IDs', () => {
  const g = fresh(); g.importRoster('SRC'); g.sheets.get('Members')!.rows[2][2] = 'Narrator'
  expect(g.importRoster('SRC')).toBe(0); expect(g.sheets.get('Members')!.rows.length).toBe(5); expect(g.sheets.get('Members')!.rows[2][2]).toBe('Narrator')
})
test('importRoster never writes to the roster file', () => {
  const g = fresh(); const before = JSON.stringify([...g.rosterSheets.values()].map(s => s.rows)); g.importRoster('SRC')
  expect(JSON.stringify([...g.rosterSheets.values()].map(s => s.rows))).toBe(before)
})
test('importRoster without an id fails clearly', () => {
  const g = fresh(); expect(() => g.importRoster()).toThrow(/ROSTER_SHEET_ID/)
})
