import { loadEvents, activeEvent, loadEvent } from '../src/cc/templates'
import { Collection } from '../src/cc/collection'
import { QuickNotes } from '../src/cc/quicknotes'
import { Store } from '../src/data/store'
import { FakeSync } from '../src/data/sync'
import { loadPrefs } from '../src/cc/access'
import { sampleChildren, sampleSession } from '../src/data/sample'
const kv = (o: Record<string, string>) => { const m = new Map(Object.entries(o)); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m } }
const ev = { name: 'Annual Day', template: 'choir', labels: { event: 'Concert' }, id: 'e1-x' }
test('root cause: events key holding the sync Collection shape migrates instead of crashing', () => {
  const k = kv({ 'curtaincall/events/v1': JSON.stringify({ v: 1, items: [ev], queue: [], seq: 1, device: 'd', meta: {} }), 'curtaincall/event/v1': JSON.stringify(ev) })
  const e = loadEvents(k)!; expect(activeEvent(e).id).toBe('e1-x')
})
test('old Events shape on the old key still loads; garbage falls back', () => {
  expect(loadEvents(kv({ 'curtaincall/events/v1': JSON.stringify({ active: 'e1', list: [{ ...ev, id: 'e1' }] }) }))!.active).toBe('e1')
  expect(loadEvents(kv({ 'curtaincall/events/v1': '{bad', 'curtaincall/event/v1': 'null' }))).toBeNull()
  expect(loadEvent(kv({ 'curtaincall/event/v1': '"x"' }))).toBeNull()
})
test('collections, quick notes, store and prefs survive corrupt or foreign data', () => {
  const bad = { 'curtaincall/events/v1': JSON.stringify({ active: 'e1', list: [] }), 'curtaincall/quicknotes/v1': '[]', 'choir-attendance/v1': JSON.stringify({ v: 0 }), 'curtaincall/prefs/v1': 'nope' }
  const k = kv(bad)
  expect(new Collection('events', k, new FakeSync()).items).toEqual([])
  expect(new QuickNotes(k, new FakeSync()).notes).toEqual([])
  expect(new Store(k, new FakeSync(), () => ({ children: sampleChildren(), sessions: [sampleSession()] })).state.children.length).toBe(30)
  expect(loadPrefs(k).role).toBe('coordinator')
  expect(k.m.has('choir-attendance/v1.bad')).toBe(true)
})
