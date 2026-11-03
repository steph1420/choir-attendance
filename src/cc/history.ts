// Undo/redo for Today marking and Show edits. One shared stack, newest first.
import type { Store } from '../data/store'
import type { Op } from '../data/model'
import type { Collection } from './collection'
export interface Step { label: string; undo: () => void; redo: () => void }
export class History {
  past: Step[] = []; future: Step[] = []; private replaying = false; private subs = new Set<() => void>()
  subscribe = (f: () => void) => { this.subs.add(f); return () => { this.subs.delete(f) } }
  snap = () => `${this.past.length}/${this.future.length}`
  private emit() { this.subs.forEach(f => f()) }
  record(s: Step) { if (this.replaying) return; this.past.push(s); this.future = []; this.emit() }
  private run(f: () => void) { this.replaying = true; try { f() } finally { this.replaying = false } }
  undo() { const s = this.past.pop(); if (!s) return null; this.run(s.undo); this.future.push(s); this.emit(); return s.label }
  redo() { const s = this.future.pop(); if (!s) return null; this.run(s.redo); this.past.push(s); this.emit(); return s.label }
}
/** Wraps store.dispatch so marks, notes and All-present become undoable. Typing "Taken by" is not tracked. */
export function trackStore(store: Store, h: History) {
  const d = store.dispatch.bind(store)
  store.dispatch = (op: Op) => {
    if (op.t === 'takenBy') return d(op)
    const before = store.session(op.sessionId).entries
    const inv: Op[] = op.t === 'allPresent'
      ? op.childIds.filter(id => !before[id]?.mark).map(id => ({ t: 'mark', sessionId: op.sessionId, childId: id, mark: null }))
      : op.t === 'mark' ? [{ t: 'mark', sessionId: op.sessionId, childId: op.childId, mark: before[op.childId]?.mark ?? null, reason: before[op.childId]?.reason }]
      : op.t === 'leftEarly' ? [{ t: 'leftEarly', sessionId: op.sessionId, childId: op.childId, value: !!before[op.childId]?.leftEarly }]
      : [{ t: 'note', sessionId: op.sessionId, childId: op.childId, remark: before[op.childId]?.remark ?? '', stars: before[op.childId]?.stars }]
    d(op)
    h.record({ label: op.t === 'allPresent' ? 'All present' : op.t === 'mark' ? 'Mark' : op.t === 'note' ? 'Remark' : 'Left early', undo: () => inv.forEach(d), redo: () => d(op) })
  }
}
export function trackCollection<T extends { id: string }>(c: Collection<T>, h: History, name: string) {
  const up = c.upsert.bind(c), rm = c.remove.bind(c)
  c.upsert = (item: T) => {
    const prev = c.items.find(i => i.id === item.id); up(item)
    h.record({ label: `${prev ? 'Edit' : 'Add'} ${name}`, undo: () => prev ? up(prev) : rm(item.id), redo: () => up(item) }); return item
  }
  c.remove = (id: string) => {
    const prev = c.items.find(i => i.id === id); rm(id)
    if (prev) h.record({ label: `Delete ${name}`, undo: () => up(prev), redo: () => rm(id) })
  }
}
