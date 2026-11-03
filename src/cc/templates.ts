import { readJSON, isObj, isEvent } from '../data/safe'
// U-01 universal app: labels come from an event template, never hard-wired.
export type TemplateId = 'choir' | 'play' | 'dance' | 'sports' | 'custom'
export interface Labels { event: string; member: string; members: string; group: string; session: string; part: string }
export interface Template { id: TemplateId; name: string; icon: string; labels: Labels }
export const TEMPLATES: Template[] = [
  { id: 'choir', name: 'Choir', icon: '🎵', labels: { event: 'Concert', member: 'Singer', members: 'Singers', group: 'Section', session: 'Practice', part: 'Part' } },
  { id: 'play', name: 'Play', icon: '🎭', labels: { event: 'Show', member: 'Actor', members: 'Cast', group: 'Scene', session: 'Rehearsal', part: 'Role' } },
  { id: 'dance', name: 'Dance', icon: '💃', labels: { event: 'Performance', member: 'Dancer', members: 'Dancers', group: 'Group', session: 'Rehearsal', part: 'Position' } },
  { id: 'sports', name: 'Sports day', icon: '🏅', labels: { event: 'Sports day', member: 'Athlete', members: 'Athletes', group: 'House', session: 'Practice', part: 'Event' } },
  { id: 'custom', name: 'Custom', icon: '✳', labels: { event: 'Event', member: 'Member', members: 'Members', group: 'Group', session: 'Session', part: 'Part' } },
]
export interface EventSetup { id?: string; name: string; template: TemplateId; labels: Labels }
export const KEY = 'curtaincall/event/v1'
export function makeEvent(id: TemplateId, name?: string, overrides: Partial<Labels> = {}): EventSetup {
  const t = TEMPLATES.find(x => x.id === id); if (!t) throw new Error(`unknown template ${id}`)
  return { name: name?.trim() || t.labels.event, template: id, labels: { ...t.labels, ...overrides } }
}
export function loadEvent(kv: { getItem(k: string): string | null }): EventSetup | null {
  return readJSON<EventSetup>(kv, KEY, isEvent)
}
export function saveEvent(kv: { setItem(k: string, v: string): void }, e: EventSetup) { kv.setItem(KEY, JSON.stringify(e)) }
// Was 'curtaincall/events/v1', which the 'events' sync Collection ALSO wrote ({v,items,queue}) -> blank screen (activeEvent on undefined list).
export const EVENTS_KEY = 'curtaincall/eventlist/v2'
const OLD_EVENTS_KEY = 'curtaincall/events/v1'
const isEvents = (x: any) => isObj(x) && typeof x.active === 'string' && Array.isArray(x.list) && x.list.length > 0 && x.list.every((e: any) => isEvent(e) && typeof e.id === 'string')
export interface Events { active: string; list: (EventSetup & { id: string })[] }
export function loadEvents(kv: { getItem(k: string): string | null }): Events | null {
  const r = readJSON<Events>(kv, EVENTS_KEY, isEvents); if (r) return r
  // Migrate: old key held either the Events list (1d/1e) or the sync Collection shape (items = event list).
  const old = readJSON<any>(kv, OLD_EVENTS_KEY, x => isObj(x))
  if (old && isEvents(old)) return old as Events
  const items = old && Array.isArray(old.items) ? old.items.filter((e: any) => isEvent(e) && typeof e.id === 'string') : []
  const cur = loadEvent(kv)
  if (items.length) { const id = cur?.id && items.some((i: any) => i.id === cur.id) ? cur.id : items[0].id; return { active: id, list: items } }
  const e = cur; return e ? { active: 'e1', list: [{ ...e, id: 'e1' }] } : null
}
export function addEvent(evs: Events | null, e: EventSetup): Events {
  const id = `e${(evs?.list.length ?? 0) + 1}-${Date.now().toString(36)}`
  return { active: id, list: [...(evs?.list ?? []), { ...e, id }] }
}
export const activeEvent = (evs: Events) => evs.list?.find(e => e.id === evs.active) ?? evs.list?.[0]
export function updateEvent(evs: Events, id: string, p: Partial<EventSetup>): Events { return { ...evs, list: evs.list.map(e => e.id === id ? { ...e, ...p, labels: { ...e.labels, ...(p.labels ?? {}) } } : e) } }
