// CODE-1/2: the single data layer. Screens send intents here; local storage + queue are owned here.
import { CONFIG } from '../config'
import type { Child, Op, QueuedOp, Saved, Session } from './model'
import type { SyncAdapter, SyncState } from './sync'
export interface KV { getItem(k: string): string | null; setItem(k: string, v: string): void }
export function applyOp(s: Session, op: Op): Session {
  const e = { ...s.entries }
  const cur = (id: string) => ({ ...(e[id] ?? {}) })
  switch (op.t) {
    case 'mark': { const x = cur(op.childId); if (op.mark) x.mark = op.mark; else delete x.mark; x.reason = op.mark === 'E' ? op.reason : undefined; if (op.mark !== 'P' && op.mark !== 'L') x.leftEarly = undefined; e[op.childId] = x; break }
    case 'leftEarly': { const x = cur(op.childId); x.leftEarly = op.value || undefined; e[op.childId] = x; break }
    case 'note': { const x = cur(op.childId); x.remark = op.remark || undefined; x.stars = op.stars || undefined; e[op.childId] = x; break }
    case 'allPresent': for (const id of op.childIds) { const x = cur(id); if (!x.mark) x.mark = 'P'; e[id] = x } break
    case 'takenBy': return { ...s, takenBy: op.name }
  }
  return { ...s, entries: e }
}
export class Store {
  state: Saved; private subs = new Set<() => void>(); sync: SyncState = { kind: 'synced' }; private flushing = false
  constructor(private kv: KV, private adapter: SyncAdapter, seed: () => { children: Child[]; sessions: Session[] }) {
    const raw = kv.getItem(CONFIG.storageKey)
    let loaded: Saved | null = null
    if (raw) { const p = JSON.parse(raw) as Saved; if (p.v !== CONFIG.schemaVersion) throw new Error(`Stored data version ${p.v} ≠ ${CONFIG.schemaVersion}`); loaded = p }
    this.state = loaded ?? { v: CONFIG.schemaVersion, ...seed(), queue: [], seq: 0, device: Math.random().toString(36).slice(2, 8) }
    this.recalc()
  }
  subscribe(f: () => void) { this.subs.add(f); return () => { this.subs.delete(f) } }
  private emit() { this.kv.setItem(CONFIG.storageKey, JSON.stringify(this.state)); this.recalc(); this.subs.forEach(f => f()) }
  private recalc() { const n = this.state.queue.length; this.sync = n === 0 ? { kind: 'synced' } : this.adapter.online() ? { kind: 'syncing', n } : { kind: 'offline', n } }
  /** v2 per-event scope: sessions without an event are adopted by `eventId` (one-time migration). */
  adoptSessions(eventId: string) {
    if (!this.state.sessions.some(s => !s.eventId)) return
    this.state = { ...this.state, sessions: this.state.sessions.map(s => s.eventId ? s : { ...s, eventId }) }; this.emit()
  }
  /** The event's current session; creates one (from `make`) the first time an event is opened. */
  sessionFor(eventId: string, make: () => Session) {
    const found = this.state.sessions.find(s => s.eventId === eventId); if (found) return found
    const s = { ...make(), eventId }; s.id = `${eventId}/${s.id}`
    this.state = { ...this.state, sessions: [...this.state.sessions, s] }; this.emit(); return s
  }
  session(id: string) { return this.state.sessions.find(s => s.id === id)! }
  dispatch(op: Op) {
    const seq = this.state.seq + 1
    const ev = this.state.sessions.find(s => s.id === op.sessionId)?.eventId
    const q: QueuedOp = { v: 1, seq, at: new Date().toISOString(), device: this.state.device, op: ev ? { ...op, eventId: ev } as unknown as Op : op }
    this.state = { ...this.state, seq, sessions: this.state.sessions.map(s => s.id === op.sessionId ? applyOp(s, op) : s), queue: [...this.state.queue, q] }
    this.emit(); void this.flush()
  }
  async flush() {
    if (this.flushing || !this.state.queue.length || !this.adapter.online()) { this.recalc(); this.subs.forEach(f => f()); return }
    this.flushing = true; let progressed = false
    try {
      const batch = this.state.queue.slice(0, CONFIG.syncBatchMax)
      const { ackedSeq } = await this.adapter.push(batch)
      const before = this.state.queue.length
      this.state = { ...this.state, queue: this.state.queue.filter(q => q.seq > ackedSeq) }
      progressed = this.state.queue.length < before
    } catch { /* stays queued; retried on next interval */ } finally { this.flushing = false; this.emit() }
    // Drain ops queued during the push; only while each push makes progress (loop-safe).
    if (progressed && this.state.queue.length) await this.flush()
  }
}
