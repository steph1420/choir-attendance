// Generic local collection: saved on device, every change queued for sync (offline-queue mode, last-write-wins).
import type { KV } from '../data/store'
import type { SyncAdapter } from '../data/sync'
import type { QueuedOp } from '../data/model'
import { readJSON, isQueueState } from '../data/safe'
export interface Remote<T> { id: string; rev: number; at: string; deleted: boolean; item: T | null }
interface Saved<T> { v: 1; meta?: Record<string, { rev: number; at: string }>; items: T[]; queue: QueuedOp[]; seq: number; device: string }
export class Collection<T extends { id: string }> {
  state: Saved<T>; scope?: string; private subs = new Set<() => void>()
  constructor(private kind: string, private kv: KV, private adapter: SyncAdapter, seed: () => T[] = () => [], private now = () => new Date()) {
    const r = readJSON<Saved<T>>(kv, this.key, x => isQueueState(x, 'items'))
    this.state = r ? { ...r, items: r.items.filter(i => i && typeof i === 'object' && (i as { id?: unknown }).id != null) } : { v: 1, items: seed(), queue: [], seq: 0, device: Math.random().toString(36).slice(2, 8) }
  }
  get key() { return `curtaincall/${this.kind}/v1` }
  get items() { const s = this.scope; return s ? this.state.items.filter(i => (i as { eventId?: string }).eventId === s) : this.state.items }
  /** Scope to one event. Items saved before v2 (no eventId) move into this event once. */
  setScope(eventId: string) {
    this.scope = eventId
    if (this.state.items.some(i => !(i as { eventId?: string }).eventId)) { this.state = { ...this.state, items: this.state.items.map(i => (i as { eventId?: string }).eventId ? i : { ...i, eventId }) }; this.emit() } else this.subs.forEach(f => f())
  }
  subscribe = (f: () => void) => { this.subs.add(f); return () => { this.subs.delete(f) } }
  snap = () => this.state
  private emit() { this.kv.setItem(this.key, JSON.stringify(this.state)); this.subs.forEach(f => f()) }
  private q(t: 'upsert' | 'remove', item: unknown) {
    const seq = this.state.seq + 1, at = this.now().toISOString()
    const op = { t: `${this.kind}.${t}`, item } as unknown as QueuedOp['op'] // contract v2 (additive)
    return { seq, q: { v: 1 as const, seq, at, device: this.state.device, op } }
  }
  newId() { return `${this.state.device}-${this.state.seq + 1}` }
  upsert(item: T) {
    if (this.scope && !(item as { eventId?: string }).eventId) item = { ...item, eventId: this.scope }
    const { seq, q } = this.q('upsert', item)
    const has = this.state.items.some(i => i.id === item.id)
    this.state = { ...this.state, seq, items: has ? this.state.items.map(i => i.id === item.id ? item : i) : [item, ...this.state.items], queue: [...this.state.queue, q] }
    this.emit(); void this.flush(); return item
  }
  patch(id: string, p: Partial<T>) { const it = this.state.items.find(i => i.id === id); if (it) this.upsert({ ...it, ...p }) }
  remove(id: string) {
    const { seq, q } = this.q('remove', { id })
    this.state = { ...this.state, seq, items: this.state.items.filter(i => i.id !== id), queue: [...this.state.queue, q] }; this.emit(); void this.flush()
  }
  /** Pull merge: remote wins if it is newer (higher rev, then later time) — except records with local changes still queued, which stay on top. Returns how many changed. */
  merge(remote: Remote<T>[]) {
    const pending = new Set(this.state.queue.map(q => String((q.op as unknown as { item?: { id: string } }).item?.id)))
    const meta = { ...(this.state.meta ?? {}) }; let items = this.state.items, n = 0
    for (const r of remote) {
      if (pending.has(r.id)) continue
      const m = meta[r.id]; if (m && (m.rev > r.rev || (m.rev === r.rev && m.at >= r.at))) continue
      meta[r.id] = { rev: r.rev, at: r.at }
      const has = items.some(i => i.id === r.id)
      if (r.deleted || !r.item) { if (has) { items = items.filter(i => i.id !== r.id); n++ } }
      else { items = has ? items.map(i => i.id === r.id ? r.item! : i) : [...items, r.item]; n++ }
    }
    this.state = { ...this.state, meta, items }; this.emit(); return n
  }
  async flush() {
    if (!this.state.queue.length || !this.adapter.online()) return
    try { const { ackedSeq } = await this.adapter.push(this.state.queue); this.state = { ...this.state, queue: this.state.queue.filter(x => x.seq > ackedSeq) }; this.emit() } catch { /* stays queued */ }
  }
}
