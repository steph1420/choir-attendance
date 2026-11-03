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
export interface EventSetup { name: string; template: TemplateId; labels: Labels }
export const KEY = 'curtaincall/event/v1'
export function makeEvent(id: TemplateId, name?: string, overrides: Partial<Labels> = {}): EventSetup {
  const t = TEMPLATES.find(x => x.id === id); if (!t) throw new Error(`unknown template ${id}`)
  return { name: name?.trim() || t.labels.event, template: id, labels: { ...t.labels, ...overrides } }
}
export function loadEvent(kv: { getItem(k: string): string | null }): EventSetup | null {
  const r = kv.getItem(KEY); return r ? JSON.parse(r) as EventSetup : null
}
export function saveEvent(kv: { setItem(k: string, v: string): void }, e: EventSetup) { kv.setItem(KEY, JSON.stringify(e)) }
