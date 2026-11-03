// Stage 1 records. Sample/codename data only.
export const COSTUME_STATUS = ['Not measured', 'Measured', 'At tailor', 'Fitting', 'Stitched', 'Ready'] as const
export type CostumeStatus = typeof COSTUME_STATUS[number]
export interface Costume { id: string; memberId: string; who: string; item: string; size: string; status: CostumeStatus; note?: string }
export const PROP_STATUS = ['Not sent', 'Asked', 'In progress', 'Received', 'Ready'] as const
export type PropStatus = typeof PROP_STATUS[number]
export const PROP_HOW = ['Make', 'Bring', 'Borrow', 'Buy'] as const
export interface Prop { id: string; name: string; qty: number; how: typeof PROP_HOW[number]; owner: string; parents: boolean; due?: string; status: PropStatus }
export interface Note { id: string; title: string; text: string; items?: { t: string; done: boolean }[]; tags: string[]; pinned?: boolean; at: string; screen?: string }
export const costumeFilters = { All: () => true, 'To measure': (c: Costume) => c.status === 'Not measured', 'At tailor': (c: Costume) => c.status === 'Measured' || c.status === 'At tailor' || c.status === 'Fitting', Ready: (c: Costume) => c.status === 'Stitched' || c.status === 'Ready' }
export const propFilters = { All: () => true, Parents: (p: Prop) => p.parents, 'Due soon': (p: Prop, today = new Date().toISOString().slice(0, 10)) => !!p.due && p.status !== 'Ready' && p.status !== 'Received' && p.due <= addDays(today, 14), Done: (p: Prop) => p.status === 'Ready' || p.status === 'Received' }
export function addDays(d: string, n: number) { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10) }
export function sizeTally(cs: Costume[]) { const o: Record<string, number> = {}; for (const c of cs) o[c.size] = (o[c.size] ?? 0) + 1; return o }
export function searchNotes(ns: Note[], q: string, tag?: string) {
  const s = q.trim().toLowerCase()
  return ns.filter(n => (!tag || n.tags.includes(tag)) && (!s || [n.title, n.text, ...(n.items ?? []).map(i => i.t), ...n.tags].join(' ').toLowerCase().includes(s)))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.at.localeCompare(a.at))
}
export const parseTags = (s: string) => [...new Set(s.split(/[\s,]+/).map(t => t.replace(/^#/, '').toLowerCase()).filter(Boolean))]
