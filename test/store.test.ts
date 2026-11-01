import { Store } from '../src/data/store'
import { FakeSync } from '../src/data/sync'
import { sampleChildren, sampleSession } from '../src/data/sample'
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m } }
const seed = () => ({ children: sampleChildren(), sessions: [sampleSession()] })
const sid = sampleSession().id
test('mark, excused reason, clear', () => {
  const s = new Store(mem(), new FakeSync(), seed)
  s.dispatch({ t: 'mark', sessionId: sid, childId: 'X001', mark: 'E', reason: 'Sick' })
  expect(s.session(sid).entries.X001).toMatchObject({ mark: 'E', reason: 'Sick' })
  s.dispatch({ t: 'mark', sessionId: sid, childId: 'X001', mark: 'P' }); expect(s.session(sid).entries.X001.reason).toBeUndefined()
  s.dispatch({ t: 'mark', sessionId: sid, childId: 'X001', mark: null }); expect(s.session(sid).entries.X001.mark).toBeUndefined()
})
test('all present only fills unmarked', () => {
  const s = new Store(mem(), new FakeSync(), seed)
  s.dispatch({ t: 'mark', sessionId: sid, childId: 'X002', mark: 'A' })
  s.dispatch({ t: 'allPresent', sessionId: sid, childIds: ['X001', 'X002'] })
  expect(s.session(sid).entries.X001.mark).toBe('P'); expect(s.session(sid).entries.X002.mark).toBe('A')
})
test('offline queues, then flushes and dedupes', async () => {
  const f = new FakeSync(); f.isOnline = false
  const s = new Store(mem(), f, seed)
  s.dispatch({ t: 'note', sessionId: sid, childId: 'X003', remark: 'good', stars: 4 })
  s.dispatch({ t: 'mark', sessionId: sid, childId: 'X003', mark: 'L' })
  expect(s.sync).toEqual({ kind: 'offline', n: 2 })
  f.isOnline = true; f.failNext = 1; await s.flush(); expect(s.state.queue.length).toBe(2) // lost → stays queued
  await s.flush(); expect(s.state.queue.length).toBe(0); expect(f.received.length).toBe(2); expect(s.sync.kind).toBe('synced')
})
test('persists and reloads; rejects wrong version', () => {
  const kv = mem(); const s = new Store(kv, new FakeSync(), seed)
  s.dispatch({ t: 'takenBy', sessionId: sid, name: 'Teacher-S' })
  expect(new Store(kv, new FakeSync(), seed).session(sid).takenBy).toBe('Teacher-S')
  kv.setItem('choir-attendance/v1', JSON.stringify({ v: 99 })); expect(() => new Store(kv, new FakeSync(), seed)).toThrow(/version/)
})

test('ops queued during a push are drained', async () => {
  const f = new FakeSync(); const s = new Store(mem(), f, seed)
  for (let i = 1; i <= 5; i++) s.dispatch({ t: 'mark', sessionId: sid, childId: `X00${i}`, mark: 'P' })
  await new Promise(r => setTimeout(r, 10)); await s.flush()
  expect(s.state.queue.length).toBe(0); expect(s.sync.kind).toBe('synced')
})
