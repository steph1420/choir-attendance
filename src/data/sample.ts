// Placeholder data only. Real names are fetched at runtime from the owner's sheet; never stored in this repo.
import type { Child, Session } from './model'
const SECTIONS = ['KG A', 'KG B', 'PREP A', 'PREP B']
const LETTERS = 'ABCDEGHJKMNPRSTV'
export function sampleChildren(): Child[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `X${String(i + 1).padStart(3, '0')}`,
    name: `${LETTERS[i % LETTERS.length]}-child ${String(i + 1).padStart(2, '0')}`,
    section: SECTIONS[Math.min(3, Math.floor(i / 7.5))],
    role: i % 10 === 3 ? 'Prop' : i % 5 === 0 ? 'Action' : 'Singer',
  }))
}
export function sampleSession(date = '2026-11-02'): Session {
  return { id: `${date}-H2`, date, slot: '2nd hour', venue: 'LF Hall', start: '10:30', end: '11:20', status: 'conducted', entries: {} }
}
