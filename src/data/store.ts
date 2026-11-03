// CODE-1/2: the single data layer. Screens send intents here; local storage + queue are owned here.
import { CONFIG } from '../config'
import { readJSON, isObj } from './safe'
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
    const loaded = readJSON<Saved>(kv, CONFIG.storageKey, p => isObj(p) && p.v === CONFIG.schemaVersion && Array.isArray(p.children) && Array.isArray(p.sessions) && Array.isArray(p.queue)
      && p.sessions.every((s: any) => isObj(s) && typeof s.id === 'string' && isObj(s.entries)) && p.children.every((c: any) => isObj(c) && c.id != null))
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
  /** Pull merge for attendance rows (v1 layout: Session, Child, Mark, Reason, Left early, Remark, Stars, Device, Seq, At).
   * Last write wins by At; a child with local changes still queued keeps the local value. Sessions unknown here are created when their Event ID is known. */
  mergeAttendance(rows: unknown[][], sessions: unknown[][] = []) {
    const pend = new Set<string>(); for (const q of this.state.queue) { const o = q.op as { sessionId?: string; childId?: string; childIds?: string[] }; if (o.childId) pend.add(`${o.sessionId}|${o.childId}`); o.childIds?.forEach(id => pend.add(`${o.sessionId}|${id}`)) }
    const at = { ...(this.state.attAt ?? {}) }; let ss = this.state.sessions, n = 0
    const evOf = new Map(sessions.map(r => [String(r[0]), String(r[9] ?? '')]))
    for (const r of rows) {
      const [sid, cid, mark, reason, left, remark, stars, , , when] = r.map(x => x === '' ? undefined : x) as (string | number | undefined)[]
      const key = `${sid}|${cid}`; if (!sid || !cid || pend.has(key) || (at[key] && String(when ?? '') <= at[key])) continue
      let s = ss.find(x => x.id === sid)
      if (!s) { const eid = evOf.get(String(sid)); if (!eid) continue; const date = String(sid).split('/').pop()!.slice(0, 10)
        s = { id: String(sid), eventId: eid, date, slot: '', venue: '', start: '', end: '', status: 'conducted', entries: {} }; ss = [...ss, s] }
      const e = { mark: (mark || undefined) as Session['entries'][string]['mark'], reason: reason ? String(reason) : undefined, leftEarly: left === 'Y' || undefined, remark: remark ? String(remark) : undefined, stars: stars ? Number(stars) : undefined }
      ss = ss.map(x => x.id === sid ? { ...x, entries: { ...x.entries, [String(cid)]: e } } : x); at[key] = String(when ?? ''); n++
    }
    if (n || ss !== this.state.sessions) { this.state = { ...this.state, sessions: ss, attAt: at }; this.emit() } return n
  }
  /** Backend Members rows (Child ID, Section, Role, From, To, Note, Name (auto)) replace the local list. Never logged. */
  setMembers(rows: unknown[][]) {
    const kids: Child[] = rows.filter(r => r[0]).map(r => ({ id: String(r[0]), section: String(r[1] || '—'), role: String(r[2] || 'Singer'), name: String(r[6] || r[0]) }))
    if (!kids.length || JSON.stringify(kids) === JSON.stringify(this.state.children)) return 0
    this.state = { ...this.state, children: kids }; this.emit(); return kids.length
  }
  session(id: string) { return this.state.sessions.find(s => s.id === id)! }
  dispatch(op: Op) {
    const seq = this.state.seq + 1
    const ev = this.state.sessions.find(s => s.id === op.sessionId)?.eventId
    const q: QueuedOp = { v: 1, seq, at: new Date().toISOString(), device: this.state.device, op: ev ? { ...op, eventId: ev } as unknown as Op : op }
    const attAt = 'childId' in op ? { ...(this.state.attAt ?? {}), [`${op.sessionId}|${op.childId}`]: q.at } : op.t === 'allPresent' ? { ...(this.state.attAt ?? {}), ...Object.fromEntries(op.childIds.map(id => [`${op.sessionId}|${id}`, q.at])) } : this.state.attAt
    this.state = { ...this.state, attAt, seq, sessions: this.state.sessions.map(s => s.id === op.sessionId ? applyOp(s, op) : s), queue: [...this.state.queue, q] }
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
