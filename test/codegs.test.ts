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
  const g = fresh(); expect(g.call(g.doPost({ postData: { contents: '{"v":2,"ops":[]}' } }))).toMatchObject({ ok: false })
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
