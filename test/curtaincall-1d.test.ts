import { Store } from '../src/data/store'
import { FakeSync } from '../src/data/sync'
import { sampleChildren, sampleSession } from '../src/data/sample'
import { Collection } from '../src/cc/collection'
import { QuickNotes } from '../src/cc/quicknotes'
import { seedProps } from '../src/cc/seed'
import type { Prop } from '../src/cc/kinds'
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) } }
test('existing local data migrates into the current event; new events start empty', () => {
  const kv = mem(); const p = new Collection<Prop>('props', kv, new FakeSync(), seedProps)
  p.setScope('e1'); expect(p.items.length).toBe(5); expect(new Collection<Prop>('props', kv, new FakeSync()).state.items.every(i => (i as { eventId?: string }).eventId === 'e1')).toBe(true)
  p.setScope('e2'); expect(p.items.length).toBe(0); p.upsert({ ...seedProps()[0], id: 'z' }); expect(p.items.length).toBe(1)
  p.setScope('e1'); expect(p.items.length).toBe(5)
})
test('sessions: adopt legacy, one per event, ops carry eventId', async () => {
  const f = new FakeSync(); f.isOnline = false
  const s = new Store(mem(), f, () => ({ children: sampleChildren(), sessions: [sampleSession()] }))
  s.adoptSessions('e1'); const a = s.sessionFor('e1', sampleSession); expect(a.id).toBe(sampleSession().id)
  const b = s.sessionFor('e2', sampleSession); expect(b.id).toBe(`e2/${sampleSession().id}`)
  s.dispatch({ t: 'mark', sessionId: b.id, childId: 'X001', mark: 'P' })
  expect(s.state.queue[0].op).toMatchObject({ eventId: 'e2' }); expect(s.session(a.id).entries.X001).toBeUndefined()
})
test('quick notes are scoped and stamped', () => {
  const q = new QuickNotes(mem(), new FakeSync()); q.add('Today', 'old'); q.setScope('e1'); expect(q.notes.length).toBe(1)
  q.setScope('e2'); expect(q.notes.length).toBe(0); expect(q.add('Today', 'new')!.eventId).toBe('e2')
})
