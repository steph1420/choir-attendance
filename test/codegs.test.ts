import { readFileSync } from 'fs'
import { loadCodeGs } from './fakeSheets'
const src = readFileSync('apps-script/Code.gs', 'utf8')
const H = (name: string, hdr: string[]) => [[`${name} banner`], hdr]
function fresh() {
  const g0 = loadCodeGs(src, {})
  const tabs: Record<string, unknown[][]> = {}
  for (const [n, h] of Object.entries(g0.HEADERS as Record<string, string[]>)) tabs[n] = H(n, h)
  return loadCodeGs(src, tabs)
}
const q = (seq: number, op: object) => ({ v: 1, seq, at: '2026-11-02T05:00:00Z', device: 'dev1', op })
test('setup on an empty sheet creates banner + header rows', () => {
  const g = loadCodeGs(src, {}); g.setup()
  const m = g.sheets.get('Manual Edits')!; expect(m.rows[1][0]).toBe('Date'); expect(m.rows.length).toBe(2)
})
test('POST writes attendance from row 3, idempotent on duplicates', () => {
  const g = fresh()
  const body = { v: 1, ops: [q(1, { t: 'mark', sessionId: '2026-11-02-H2', childId: 'X001', mark: 'E', reason: 'Sick' }), q(2, { t: 'note', sessionId: '2026-11-02-H2', childId: 'X001', remark: 'ok', stars: 4 })] }
  const r = g.call(g.doPost({ postData: { contents: JSON.stringify(body) } }))
  expect(r).toMatchObject({ ok: true, ackedSeq: 2 })
  g.doPost({ postData: { contents: JSON.stringify(body) } }) // duplicate delivery
  const a = g.sheets.get('Attendance')!.rows
  expect(a.length).toBe(3); expect(a[2].slice(0, 7)).toEqual(['2026-11-02-H2', 'X001', 'E', 'Sick', '', 'ok', 4])
  expect(g.sheets.get('Log')!.rows.length).toBe(4)
})
test('wrong contract version fails clearly', () => {
  const g = fresh(); expect(g.call(g.doPost({ postData: { contents: '{"v":3,"ops":[]}' } }))).toMatchObject({ ok: false })
})
test('takenBy creates the session row at row 3', () => {
  const g = fresh(); g.doPost({ postData: { contents: JSON.stringify({ v: 1, ops: [q(1, { t: 'takenBy', sessionId: 'S1', name: 'Teacher-S' })] }) } })
  const s = g.sheets.get('Sessions')!.rows; expect(s[2][0]).toBe('S1'); expect(s[2][7]).toBe('Teacher-S')
})
test('Manual Edits: applies pending rows, stamps Applied, flags bad rows, skips applied', () => {
  const g = fresh(); const me = g.sheets.get('Manual Edits')!
  me.rows.push(['2026-11-02', '2nd hour', 'X005', 'E', 'Sick', 'late call', '', '', ''])
  me.rows.push(['2026-11-02', '', 'X006', 'P', '', '', '', '', ''])
  me.rows.push(['2026-11-01', '1st hour', 'X007', 'A', '', '', '\u2713 Applied', 'x', ''])
  const r = g.call(g.doGet({}))
  expect(r.manualEdits).toEqual([{ sessionId: '2026-11-02-H2', childId: 'X005', mark: 'E', reason: 'Sick', note: 'late call' }])
  expect(me.rows[2][6]).toBe('\u2713 Applied'); expect(me.rows[3][6]).toMatch(/Error: pick an Hour/); expect(me.rows[4][7]).toBe('x')
  expect(g.sheets.get('Attendance')!.rows[2].slice(0, 4)).toEqual(['2026-11-02-H2', 'X005', 'E', 'Sick'])
  g.doGet({}); expect(g.sheets.get('Attendance')!.rows.length).toBe(3) // not re-applied
})
test('renamed header fails loudly', () => {
  const g = fresh(); g.sheets.get('Manual Edits')!.rows[1][3] = 'Mark'
  const r = g.call(g.doGet({})); expect(r.ok).toBe(false); expect(r.error).toMatch(/should be "New mark"/)
})
const post = (g: ReturnType<typeof fresh>, v: number, ops: object[]) => g.call(g.doPost({ postData: { contents: JSON.stringify({ v, ops }) } }))
test('v2: record upsert/remove, rev, change log, answers with v2', () => {
  const g = fresh()
  const c = { id: 'c1', eventId: 'e1', memberId: 'X001', size: 'M', status: 'Measured' }
  expect(post(g, 2, [q(1, { t: 'costumes.upsert', item: c }), q(2, { t: 'costumes.upsert', item: { ...c, status: 'Ready' } })])).toMatchObject({ v: 2, ok: true, ackedSeq: 2 })
  const rows = g.sheets.get('Costumes')!.rows; expect(rows.length).toBe(3); expect(rows[2].slice(0, 3)).toEqual(['c1', 'e1', 2]); expect(JSON.parse(rows[2][6] as string).status).toBe('Ready')
  post(g, 2, [q(3, { t: 'costumes.remove', item: { id: 'c1' } })]); expect(rows[2][5]).toBe('Y')
  expect(g.sheets.get('Change log')!.rows.slice(2).map((r: unknown[]) => r[8])).toEqual(['upsert', 'upsert', 'remove'])
  expect(g.call(g.doGet({ parameter: { v: '2' } })).records.costumes).toEqual([{ id: 'c1', rev: 3, at: '2026-11-02T05:00:00Z', deleted: true, item: null }])
})
test('v2: last write wins by time; stale write logged not applied', () => {
  const g = fresh(); const at = (seq: number, t: string, op: object) => ({ ...q(seq, op), at: t })
  post(g, 2, [at(1, '2026-11-04T10:00:00Z', { t: 'props.upsert', item: { id: 'p1', name: 'Crown' } })])
  post(g, 2, [{ ...at(1, '2026-11-04T09:00:00Z', { t: 'props.upsert', item: { id: 'p1', name: 'Old' } }), device: 'dev2' }])
  expect(JSON.parse(g.sheets.get('Props')!.rows[2][6] as string).name).toBe('Crown')
  expect(g.sheets.get('Change log')!.rows.at(-1)![8]).toMatch(/stale/)
})
test('v2: all record kinds + quickNote op; tabs auto-created on a v1-only sheet', () => {
  const g0 = loadCodeGs(src, {}); const tabs: Record<string, unknown[][]> = {}
  for (const n of ['Members', 'Timetable', 'Sessions', 'Attendance', 'Manual Edits', 'Log', 'Reports', 'Roster link']) tabs[n] = H(n, (g0.HEADERS as Record<string, string[]>)[n])
  const g = loadCodeGs(src, tabs)
  const kinds = ['events', 'costumes', 'props', 'notes', 'care', 'permissions']
  post(g, 2, [...kinds.map((k, i) => q(i + 1, { t: `${k}.upsert`, item: { id: `${k}1` } })), q(9, { t: 'quickNote', id: 'qn1', screen: 'Today', text: 'hi', at: 'x', eventId: 'e1' })])
  for (const t of ['Events', 'Costumes', 'Props', 'Notes', 'CareFlags', 'Permissions', 'QuickNotes']) expect(g.sheets.get(t)!.rows.length).toBe(3)
  expect(g.sheets.get('QuickNotes')!.rows[2][1]).toBe('e1')
  expect(post(g, 2, [q(10, { t: 'bogus.upsert', item: { id: 'b' } })]).ok).toBe(false)
})
test('v1 client still works unchanged; v2 mark carries eventId to Sessions', () => {
  const g = fresh()
  expect(post(g, 1, [q(1, { t: 'mark', sessionId: 'S1', childId: 'X001', mark: 'P' })])).toMatchObject({ v: 1, ok: true })
  expect(g.call(g.doGet({})).records).toBeUndefined()
  post(g, 2, [q(2, { t: 'mark', sessionId: 'e1/S2', childId: 'X001', mark: 'A', eventId: 'e1' })])
  expect(g.sheets.get('Sessions')!.rows[2].slice(0, 1).concat(g.sheets.get('Sessions')!.rows[2][9])).toEqual(['e1/S2', 'e1'])
})
test('setup upgrades a v1 Sessions header by filling only the new column', () => {
  const g = fresh(); const s = g.sheets.get('Sessions')!; s.rows[1] = s.rows[1].slice(0, 9); g.setup(); expect(s.rows[1][9]).toBe('Event ID')
})
