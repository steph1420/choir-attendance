import { render, screen, fireEvent } from '@testing-library/react'
import { Collection } from '../src/cc/collection'
import { FakeSync } from '../src/data/sync'
import { costumeFilters, propFilters, searchNotes, parseTags, sizeTally, type Costume, type Note, type Prop } from '../src/cc/kinds'
import { seedCostumes, seedNotes, seedProps } from '../src/cc/seed'
import { sampleChildren } from '../src/data/sample'
import { CostumesScreen, NotesScreen, PropsScreen } from '../src/cc/screens'
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) } }
test('collection saves locally, queues offline, flushes', async () => {
  const kv = mem(), f = new FakeSync(); f.isOnline = false
  const c = new Collection<Prop>('props', kv, f, seedProps)
  c.patch('p1', { status: 'Received' }); c.remove('p5'); c.upsert({ ...seedProps()[0], id: 'new', name: 'Crown' })
  expect(c.state.queue.length).toBe(3)
  const re = new Collection<Prop>('props', kv, f); expect(re.items.find(p => p.id === 'p1')!.status).toBe('Received'); expect(re.items.some(p => p.id === 'p5')).toBe(false)
  f.isOnline = true; await c.flush(); expect(c.state.queue.length).toBe(0); expect(f.received.length).toBe(3)
})
test('filters, tally, note search', () => {
  const cs = seedCostumes(sampleChildren())
  expect(cs.filter(costumeFilters['To measure']).every(c => c.status === 'Not measured')).toBe(true)
  expect(Object.values(sizeTally(cs)).reduce((a, b) => a + b)).toBe(cs.length)
  const ps = seedProps(); expect(ps.filter(propFilters.Parents).length).toBe(3)
  expect(ps.filter(p => propFilters['Due soon'](p, '2026-11-04')).map(p => p.id)).toEqual(['p1', 'p4'])
  const ns = seedNotes(); expect(searchNotes(ns, '')[0].id).toBe('n1')
  expect(searchNotes(ns, 'socks').map(n => n.id)).toEqual(['n2']); expect(searchNotes(ns, '', 'costumes').map(n => n.id)).toEqual(['n3'])
  expect(parseTags('#Stage, costumes #stage')).toEqual(['stage', 'costumes'])
})
test('costume edit status via UI', () => {
  const c = new Collection<Costume>('costumes', mem(), new FakeSync(), () => seedCostumes(sampleChildren()))
  render(<CostumesScreen col={c} ev="Annual Day" />)
  fireEvent.click(screen.getAllByText(/A-child 01/)[0]); fireEvent.change(screen.getByDisplayValue('Stitched'), { target: { value: 'Ready' } }); fireEvent.click(screen.getByText('Save'))
  expect(c.items.find(x => x.id === 'c0')!.status).toBe('Ready')
})
test('props add via UI', () => {
  const c = new Collection<Prop>('props', mem(), new FakeSync())
  render(<PropsScreen col={c} ev="Annual Day" />); fireEvent.click(screen.getByText('+ Add'))
  fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Crown' } }); fireEvent.click(screen.getByText('Save'))
  expect(c.items[0].name).toBe('Crown')
})
test('notes: checklist toggle, new note with tags, search', () => {
  const c = new Collection<Note>('notes', mem(), new FakeSync(), seedNotes)
  render(<NotesScreen col={c} quick={[{ id: 'q1', screen: 'Today', text: 'Mic 2', at: '2026-11-04T00:00:00Z' }]} />)
  fireEvent.click(screen.getByText(/Spare socks/)); expect(c.items.find(n => n.id === 'n2')!.items![2].done).toBe(true)
  fireEvent.click(screen.getByText('+ Note')); fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Lights' } })
  fireEvent.change(screen.getByLabelText('Tags'), { target: { value: '#stage' } }); fireEvent.click(screen.getByText('Save'))
  expect(c.items[0]).toMatchObject({ title: 'Lights', tags: ['stage'] })
  fireEvent.change(screen.getByLabelText('Search notes'), { target: { value: 'mic' } }); expect(screen.getByText('Mic 2')).toBeTruthy(); expect(screen.queryByText(/Lights/)).toBeNull()
})
