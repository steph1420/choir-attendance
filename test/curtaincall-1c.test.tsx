import { render, screen, fireEvent } from '@testing-library/react'
import { Store } from '../src/data/store'
import { FakeSync } from '../src/data/sync'
import { sampleChildren, sampleSession } from '../src/data/sample'
import { Collection } from '../src/cc/collection'
import { History, trackCollection, trackStore } from '../src/cc/history'
import { DEFAULT_CAPS, can, setCap, type CareFlag, type Prefs } from '../src/cc/access'
import { seedCostumes, seedProps } from '../src/cc/seed'
import type { Costume, Prop } from '../src/cc/kinds'
import { MembersScreen } from '../src/cc/people'
import { CostumesScreen } from '../src/cc/screens'
import { addEvent, activeEvent, makeEvent, loadEvents, saveEvent } from '../src/cc/templates'
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) } }
const sid = sampleSession().id
test('undo/redo marking incl. all-present', () => {
  const s = new Store(mem(), new FakeSync(), () => ({ children: sampleChildren(), sessions: [sampleSession()] })); const h = new History(); trackStore(s, h)
  s.dispatch({ t: 'mark', sessionId: sid, childId: 'X001', mark: 'A' })
  s.dispatch({ t: 'mark', sessionId: sid, childId: 'X001', mark: 'E', reason: 'Sick' })
  s.dispatch({ t: 'allPresent', sessionId: sid, childIds: ['X001', 'X002'] })
  h.undo(); expect(s.session(sid).entries.X002.mark).toBeUndefined(); expect(s.session(sid).entries.X001.mark).toBe('E')
  h.undo(); expect(s.session(sid).entries.X001.mark).toBe('A')
  h.redo(); expect(s.session(sid).entries.X001).toMatchObject({ mark: 'E', reason: 'Sick' })
  s.dispatch({ t: 'takenBy', sessionId: sid, name: 'x' }); expect(h.future.length).toBe(1) // typing not tracked
})
test('undo/redo show edits', () => {
  const p = new Collection<Prop>('props', mem(), new FakeSync(), seedProps); const h = new History(); trackCollection(p, h, 'prop')
  p.patch('p1', { status: 'Ready' }); p.remove('p2'); p.upsert({ ...seedProps()[0], id: 'z', name: 'Crown' })
  h.undo(); expect(p.items.some(x => x.id === 'z')).toBe(false)
  h.undo(); expect(p.items.some(x => x.id === 'p2')).toBe(true)
  h.undo(); expect(p.items.find(x => x.id === 'p1')!.status).toBe('Asked')
  h.redo(); expect(p.items.find(x => x.id === 'p1')!.status).toBe('Ready'); expect(h.undo()).toBe('Edit prop')
})
test('capabilities: only admin.permissions may change; admin never locked out', () => {
  expect(can(DEFAULT_CAPS, 'teacher', 'view.careFlags')).toBe(false)
  expect(() => setCap(DEFAULT_CAPS, 'teacher', 'teacher', 'view.careFlags', true)).toThrow()
  const m = setCap(DEFAULT_CAPS, 'coordinator', 'teacher', 'view.careFlags', true); expect(can(m, 'teacher', 'view.careFlags')).toBe(true)
  expect(can(setCap(m, 'admin', 'admin', 'admin.permissions', false), 'admin', 'admin.permissions')).toBe(true)
})
const prefs = (role: Prefs['role']): Prefs => ({ teacher: 'Teacher-S', role, caps: DEFAULT_CAPS })
const L = makeEvent('choir').labels
test('care flag: icon for all, details only with capability', () => {
  const care = new Collection<CareFlag>('care', mem(), new FakeSync(), () => [{ id: 'X002', note: 'Sample allergy' }]); const co = new Collection<Costume>('costumes', mem(), new FakeSync())
  const { unmount } = render(<MembersScreen kids={sampleChildren()} care={care} costumes={co} prefs={prefs('teacher')} labels={L} />)
  expect(screen.getAllByLabelText('care flag').length).toBe(1); fireEvent.click(screen.getByText(/B-child 02/)); expect(screen.queryByText(/Sample allergy/)).toBeNull(); expect(screen.queryByLabelText('Care note')).toBeNull(); unmount()
  render(<MembersScreen kids={sampleChildren()} care={care} costumes={co} prefs={prefs('coordinator')} labels={L} />)
  fireEvent.click(screen.getByText(/B-child 02/)); expect(screen.getAllByText(/Sample allergy/).length).toBeGreaterThan(0); expect(screen.getByLabelText("Care note")).toBeTruthy()
})
test('costume linked to member', () => {
  const kids = sampleChildren(); const c = new Collection<Costume>('costumes', mem(), new FakeSync(), () => seedCostumes(kids))
  render(<CostumesScreen col={c} ev="E" members={kids} />); fireEvent.click(screen.getByText('+ Add'))
  fireEvent.change(screen.getByLabelText('Member'), { target: { value: 'X020' } }); fireEvent.click(screen.getByText('Save'))
  expect(c.items[0]).toMatchObject({ memberId: 'X020', who: kids[19].name })
})
test('events: create, switch, legacy migration', () => {
  const kv = mem(); saveEvent(kv, makeEvent('choir', 'Annual Day')); const evs = loadEvents(kv)!; expect(evs.list.length).toBe(1)
  const e2 = addEvent(evs, makeEvent('play', 'Drama')); expect(activeEvent(e2).labels.members).toBe('Cast')
  expect(activeEvent({ ...e2, active: evs.active }).name).toBe('Annual Day')
})
