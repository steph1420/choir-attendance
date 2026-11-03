import { render, screen, fireEvent } from '@testing-library/react'
import { QuickNotes, QN_KEY } from '../src/cc/quicknotes'
import { FakeSync } from '../src/data/sync'
import { TEMPLATES, makeEvent, loadEvent, saveEvent } from '../src/cc/templates'
import { TemplatePicker } from '../src/cc/TemplatePicker'
import { QuickNoteSheet } from '../src/cc/QuickNoteSheet'
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m } }
test('quick note is tied to screen, timestamped, persisted and queued offline', async () => {
  const kv = mem(), f = new FakeSync(); f.isOnline = false
  const q = new QuickNotes(kv, f, () => new Date('2026-11-04T10:00:00Z'))
  expect(q.add('Today', '   ')).toBeNull()
  const n = q.add('Today', 'Bring water bottles', 'Teacher-S')!
  expect(n).toMatchObject({ screen: 'Today', at: '2026-11-04T10:00:00.000Z', by: 'Teacher-S' })
  expect(q.forScreen('Today').length).toBe(1); expect(q.forScreen('Notes').length).toBe(0)
  expect(q.state.queue.length).toBe(1)
  expect(new QuickNotes(kv, f).state.notes[0].text).toBe('Bring water bottles')
  f.isOnline = true; await q.flush(); expect(q.state.queue.length).toBe(0); expect(f.received.length).toBe(1)
  expect(JSON.parse(kv.getItem(QN_KEY)!).queue.length).toBe(0)
})
test('quick note sheet saves via UI', () => {
  const q = new QuickNotes(mem(), new FakeSync())
  render(<QuickNoteSheet qn={q} screen="Today" onClose={() => {}} />)
  fireEvent.change(screen.getByLabelText('Note text'), { target: { value: 'Mic 2 crackles' } })
  fireEvent.click(screen.getByText('Save'))
  expect(screen.getByText('Mic 2 crackles')).toBeTruthy(); expect(q.forScreen('Today').length).toBe(1)
})
test('templates set labels; custom overrides; persist', () => {
  expect(TEMPLATES.map(t => t.id)).toEqual(['choir', 'play', 'dance', 'sports', 'custom'])
  expect(makeEvent('play').labels.members).toBe('Cast')
  const e = makeEvent('custom', 'Fun Fair', { members: 'Volunteers' })
  expect(e).toMatchObject({ name: 'Fun Fair', labels: { members: 'Volunteers', group: 'Group' } })
  expect(() => makeEvent('x' as never)).toThrow()
  const kv = mem(); expect(loadEvent(kv)).toBeNull(); saveEvent(kv, e); expect(loadEvent(kv)).toEqual(e)
})
test('template picker returns chosen event', () => {
  let got: unknown; render(<TemplatePicker onDone={e => { got = e }} />)
  fireEvent.click(screen.getByText('Dance')); fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Annual Day' } })
  fireEvent.click(screen.getByText('Start'))
  expect(got).toMatchObject({ name: 'Annual Day', template: 'dance', labels: { member: 'Dancer' } })
})
