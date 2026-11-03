import { readFileSync } from 'fs'
import { createHash } from 'node:crypto'
import { loadCodeGs } from './fakeSheets'
const src = readFileSync('apps-script/Code.gs', 'utf8')
function fresh() { const g0 = loadCodeGs(src, {}); const t: Record<string, unknown[][]> = {}; for (const [n, h] of Object.entries(g0.HEADERS as Record<string, string[]>)) t[n] = [[n], h]; return loadCodeGs(src, t) }
const body = (o: object) => ({ postData: { contents: JSON.stringify({ v: 2, ops: [{ v: 1, seq: 1, at: 't', device: 'd', op: { t: 'notes.upsert', item: { id: 'n' } } }], ...o }) } })
test('GET and POST without or with wrong passcode: 401-style, no data, nothing written', () => {
  const g = fresh()
  for (const r of [g.call(g.rawDoGet({ parameter: { v: '2' } })), g.call(g.rawDoGet({ parameter: { v: '2', pass: 'nope' } })), g.call(g.rawDoPost(body({}))), g.call(g.rawDoPost(body({ pass: 'nope' })))]) {
    expect(r).toEqual({ v: 2, ok: false, auth: false, status: 401, error: 'passcode required' })
  }
  expect(g.sheets.get('Notes')!.rows.length).toBe(2); expect(g.sheets.get('Log')!.rows.length).toBe(2)
})
test('right passcode works; no hash set = everything denied', () => {
  const g = fresh(); expect(g.call(g.rawDoPost(body({ pass: 'test-pass' })))).toMatchObject({ ok: true })
  expect(g.call(g.rawDoGet({ parameter: { v: '2', pass: 'test-pass' } }))).toMatchObject({ ok: true })
  delete g.props.CC_PASSCODE_HASH; expect(g.call(g.rawDoGet({ parameter: { pass: 'test-pass' } })).auth).toBe(false)
})
test('menu: Set team passcode stores only the SHA-256', () => {
  const g = fresh(); const alerts: string[] = []
  const ui = (txt: string, btn = 'OK') => ({ ButtonSet: { OK_CANCEL: 1 }, Button: { OK: 'OK' }, alert: (m: string) => alerts.push(m), prompt: () => ({ getSelectedButton: () => btn, getResponseText: () => txt }) })
  g.setUi(ui('abc')); g.setTeamPasscode(); expect(alerts[0]).toMatch(/short/)
  g.setUi(ui('choir-2026')); g.setTeamPasscode()
  expect(g.props.CC_PASSCODE_HASH).toBe(createHash('sha256').update('choir-2026').digest('hex')); expect(JSON.stringify(g.props)).not.toContain('choir-2026')
  expect(g.call(g.rawDoGet({ parameter: { pass: 'choir-2026' } })).ok).toBe(true)
  g.setUi(ui('other-pass', 'CANCEL')); g.setTeamPasscode(); expect(g.call(g.rawDoGet({ parameter: { pass: 'choir-2026' } })).ok).toBe(true)
})
