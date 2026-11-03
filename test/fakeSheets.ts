import { createHash } from 'node:crypto'
// Minimal in-memory fake of the Apps Script APIs Code.gs uses (CODE-3/4).
export class FakeSheet {
  rows: unknown[][] = []
  constructor(public name: string) {}
  getLastRow() { return this.rows.length }
  getName() { return this.name }
  getLastColumn() { return Math.max(0, ...this.rows.map(r => r.length)) }
  appendRow(r: unknown[]) { this.rows.push([...r]) }
  getRange(row: number, col: number, nr = 1, nc = 1) {
    const self = this
    const ensure = () => { while (self.rows.length < row + nr - 1) self.rows.push([]) }
    return {
      getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => self.rows[row - 1 + i]?.[col - 1 + j] ?? '')),
      setValues: (v: unknown[][]) => { ensure(); v.forEach((r, i) => r.forEach((x, j) => { self.rows[row - 1 + i][col - 1 + j] = x })) },
      setValue: (x: unknown) => { ensure(); self.rows[row - 1][col - 1] = x },
    }
  }
}
export function loadCodeGs(src: string, tabs: Record<string, unknown[][]>, roster?: Record<string, unknown[][]>) {
  const sheets = new Map<string, FakeSheet>()
  for (const [n, rows] of Object.entries(tabs)) { const s = new FakeSheet(n); s.rows = rows.map(r => [...r]); sheets.set(n, s) }
  const ss = { getSheetByName: (n: string) => sheets.get(n) ?? null, getSheets: () => [...sheets.values()], insertSheet: (n: string) => { const s = new FakeSheet(n); sheets.set(n, s); return s } }
  const rs = new Map<string, FakeSheet>()
  for (const [n, rows] of Object.entries(roster ?? {})) { const s = new FakeSheet(n); s.rows = rows.map(r => [...r]); rs.set(n, s) }
  const rss = { getSheetByName: (n: string) => rs.get(n) ?? null, getSheets: () => [...rs.values()] }
  const props: Record<string, string> = { CC_PASSCODE_HASH: createHash('sha256').update('test-pass').digest('hex') }
  const g = {
    SpreadsheetApp: { getActive: () => ss, openById: () => (roster ? rss : ss), getUi: () => { throw new Error('no ui') } },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t: string) => ({ setMimeType: () => ({ text: t }) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k: string) => props[k] ?? '', setProperty: (k: string, v: string) => { props[k] = v } }) },
    Utilities: { formatDate: (d: Date) => d.toISOString().slice(0, 10), DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' }, computeDigest: (_a: string, s: string) => [...createHash('sha256').update(s, 'utf8').digest()].map(b => (b > 127 ? b - 256 : b)) },
    Session: { getScriptTimeZone: () => 'Asia/Kolkata' },
  }
  const fn = new Function(...Object.keys(g), `${src}\nreturn { setup, doPost, doGet, HEADERS, importRoster, onOpen, setTeamPasscode };`)
  const api = fn(...Object.values(g))
  // Existing tests send the test passcode automatically; raw* skip that for passcode tests.
  const doGet = (e: { parameter?: Record<string, string> } = {}) => api.doGet({ ...e, parameter: { pass: 'test-pass', ...(e.parameter ?? {}) } })
  const doPost = (e: { postData: { contents: string } }) => { const b = JSON.parse(e.postData.contents); return api.doPost({ postData: { contents: JSON.stringify({ pass: 'test-pass', ...b }) } }) }
  return { ...api, doGet, doPost, rawDoGet: api.doGet, rawDoPost: api.doPost, props, setUi: (ui: unknown) => { g.SpreadsheetApp.getUi = () => ui as never }, sheets, rosterSheets: rs, call: (o: { text: string }) => JSON.parse(o.text) }
}
