import { render, screen, fireEvent } from '@testing-library/react'
import { Store } from '../src/data/store'
import { FakeSync } from '../src/data/sync'
import { sampleChildren, sampleSession } from '../src/data/sample'
import { Collection } from '../src/cc/collection'
import { History, trackCollection } from '../src/cc/history'
import { Puller } from '../src/cc/pull'
import { TodayScreen } from '../src/cc/TodayScreen'
import { seedNotes } from '../src/cc/seed'
import type { Note } from '../src/cc/kinds'
import type { CareFlag } from '../src/cc/access'
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } }
const mk = () => new Store(mem(), new FakeSync(), () => ({ children: sampleChildren(), sessions: [sampleSession()] }))
const sid = sampleSession().id
const row = (cid: string, mark: string, at: string, s = sid) => [s, cid, mark, '', '', '', '', 'devB', 1, at]
test('attendance pull: newer remote wins, older ignored, pending local kept, unknown event session created', () => {
  const f = new FakeSync(); f.isOnline = false; const s = new Store(mem(), f, () => ({ children: sampleChildren(), sessions: [sampleSession()] }))
  s.dispatch({ t: 'mark', sessionId: sid, childId: 'X001', mark: 'P' })
  expect(s.mergeAttendance([row('X001', 'A', '2999-01-01T00:00:00Z'), row('X002', 'L', '2026-11-04T01:00:00Z')])).toBe(1)
  expect(s.session(sid).entries.X001.mark).toBe('P'); expect(s.session(sid).entries.X002.mark).toBe('L')
  expect(s.mergeAttendance([row('X002', 'A', '2026-11-04T00:00:00Z')])).toBe(0)
  expect(s.mergeAttendance([row('X002', 'E', '2026-11-04T02:00:00Z')])).toBe(1); expect(s.session(sid).entries.X002.mark).toBe('E')
  expect(s.mergeAttendance([row('X003', 'P', 't', 'e9/2026-11-05-H1')], [['e9/2026-11-05-H1', '', '', '', '', '', '', '', '', 'e9']])).toBe(1)
  expect(s.sessionFor('e9', sampleSession).entries.X003.mark).toBe('P')
  expect(s.state.queue.length).toBe(1) // merge never queues
})
test('members from backend replace the sample list', async () => {
  const s = mk(); const j = { v: 2, ok: true, records: {}, members: [['M01', 'KG A', 'Singer', '', '', '', 'Sample One'], ['M02', 'KG B', '', '', '', '', '']], attendance: [], sessions: [] }
  const p = new Puller('https://x/exec', { store: s } as never, (async () => ({ json: async () => j })) as never, () => true)
  await p.pull(); expect(s.state.children.map(c => c.id)).toEqual(['M01', 'M02']); expect(s.state.children[1]).toMatchObject({ name: 'M02', role: 'Singer' })
})
test('undo for notes and care flags', () => {
  const h = new History(); const n = new Collection<Note>('notes', mem(), new FakeSync(), seedNotes); const c = new Collection<CareFlag>('care', mem(), new FakeSync())
  trackCollection(n, h, 'note'); trackCollection(c, h, 'care flag')
  n.patch('n1', { pinned: false }); c.upsert({ id: 'X001', note: 'x' }); c.remove('X001')
  h.undo(); expect(c.items.length).toBe(1); h.undo(); expect(c.items.length).toBe(0); h.undo(); expect(n.items.find(x => x.id === 'n1')!.pinned).toBe(true)
})
test('Today v2: compact counts, All present pill, taken-by remembered, sticky groups', () => {
  const s = mk(); const says: string[] = []
  render(<TodayScreen store={s} session={sampleSession()} title="Practice · 10:30" sub="Annual Day · Choir" sync={null} actions={null} groupLabel="Section" partLabel="Part" teacher="Teacher-S" onSay={t => says.push(t)} />)
  expect(screen.getByLabelText('Counts').textContent).toContain('P 0')
  fireEvent.click(screen.getByText('✓ All present')); expect(screen.getByLabelText('Counts').textContent).toContain('P 30')
  expect(s.session(sid).takenBy).toBe('Teacher-S'); expect(says[0]).toMatch(/Present/)
  expect(screen.getAllByRole('heading', { level: 2 }).length).toBe(4)
  fireEvent.click(screen.getByLabelText('Session details')); expect((screen.getByLabelText('Taken by') as HTMLInputElement).value).toBe('Teacher-S')
})
