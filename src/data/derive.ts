import type { Child, Entry, GroupBy } from './model'
import { stripLetterOf } from '../az/azLayout'
export interface Group { key: string; children: Child[] }
export function groupChildren(children: Child[], by: GroupBy): Group[] {
  const keyOf = (c: Child) => (by === 'section' ? c.section : by === 'role' ? c.role : stripLetterOf(c.name))
  const map = new Map<string, Child[]>()
  const sorted = [...children].sort((a, b) => a.name.localeCompare(b.name))
  for (const c of sorted) { const k = keyOf(c); (map.get(k) ?? map.set(k, []).get(k)!).push(c) }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, children]) => ({ key, children }))
}
export interface Counts { P: number; A: number; L: number; E: number; unmarked: number; present: number; total: number }
// A-02: Late counts as attended; Excused per setting (default present).
export function countMarks(children: Child[], entries: Record<string, Entry>, excused: 'present' | 'absent' | 'not-counted' = 'present'): Counts {
  const c: Counts = { P: 0, A: 0, L: 0, E: 0, unmarked: 0, present: 0, total: children.length }
  for (const ch of children) { const m = entries[ch.id]?.mark; if (m) c[m]++; else c.unmarked++ }
  c.present = c.P + c.L + (excused === 'present' ? c.E : 0)
  if (excused === 'not-counted') c.total -= c.E
  return c
}
