import { Collection } from '../src/cc/collection'
import { QuickNotes } from '../src/cc/quicknotes'
import { Puller, statusText } from '../src/cc/pull'
import { FakeSync } from '../src/data/sync'
import type { Prop } from '../src/cc/kinds'
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) } }
const P = (id: string, name: string): Prop => ({ id, name, qty: 1, how: 'Make', owner: 'x', parents: false, status: 'Asked' })
const R = (id: string, rev: number, at: string, item: Prop | null, deleted = false) => ({ id, rev, at, deleted, item })
test('merge: newer remote wins, older ignored, deletes apply, pending local stays on top', () => {
  const f = new FakeSync(); const c = new Collection<Prop>('props', mem(), f, () => [P('a', 'A'), P('b', 'B'), P('c', 'C')])
  expect(c.merge([R('a', 2, 't2', P('a', 'A2')), R('b', 1, 't1', null, true), R('n', 1, 't1', P('n', 'New'))])).toBe(3)
  expect(c.items.map(i => i.name).sort()).toEqual(['A2', 'C', 'New'])
  expect(c.merge([R('a', 1, 't9', P('a', 'old'))])).toBe(0); expect(c.items.find(i => i.id === 'a')!.name).toBe('A2')
  expect(c.merge([R('a', 2, 't3', P('a', 'A3'))])).toBe(1) // same rev, later time
  f.isOnline = false; c.patch('c', { name: 'mine' })
  c.merge([R('c', 5, 't9', P('c', 'theirs'))]); expect(c.items.find(i => i.id === 'c')!.name).toBe('mine')
  expect(c.state.queue.length).toBe(1) // merge never queues
})
test('quick notes merge appends unseen only', () => {
  const q = new QuickNotes(mem(), new FakeSync()); const n = q.add('Today', 'a')!
  expect(q.merge([{ id: n.id, deleted: false, item: n }, { id: 'z', deleted: false, item: { id: 'z', screen: 'Props', text: 'b', at: '2026-11-04T00:00:00Z' } }])).toBe(1)
})
test('puller: v2 fetch merges and reports; errors and offline reported; no URL = local', async () => {
  const c = new Collection<Prop>('props', mem(), new FakeSync())
  let body: unknown = { v: 2, ok: true, records: { props: [R('x', 1, 't', P('x', 'X'))] } }; let urlSeen = ''
  const fetcher = (async (u: string) => { urlSeen = u; return { json: async () => body } }) as unknown as typeof fetch
  let on = true; const p = new Puller('https://s/exec', { props: c } as never, fetcher, () => on, () => new Date('2026-11-04T07:10:00Z'))
  await p.pull(); expect(urlSeen).toBe('https://s/exec?v=2'); expect(p.status).toMatchObject({ kind: 'ok', changed: 1 }); expect(c.items[0].name).toBe('X')
  body = { v: 1, ok: true }; await p.pull(); expect(p.status.kind).toBe('error'); expect(p.status.error).toMatch(/v2/)
  on = false; await p.pull(); expect(p.status.kind).toBe('offline')
  expect(new Puller(null, {}).status.kind).toBe('local')
  expect(statusText({ kind: 'offline', n: 2 }, p.status)).toBe('Offline · 2 queued')
  expect(statusText({ kind: 'synced' }, { kind: 'local' })).toMatch(/no backend/)
})
