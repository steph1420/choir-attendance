// Generic local collection: saved on device, every change queued for sync (offline-queue mode, last-write-wins).
import type { KV } from '../data/store'
import type { SyncAdapter } from '../data/sync'
import type { QueuedOp } from '../data/model'
interface Saved<T> { v: 1; items: T[]; queue: QueuedOp[]; seq: number; device: string }
export class Collection<T extends { id: string }> {
  state: Saved<T>; private subs = new Set<() => void>()
  constructor(private kind: string, private kv: KV, private adapter: SyncAdapter, seed: () => T[] = () => [], private now = () => new Date()) {
    const r = kv.getItem(this.key)
    this.state = r ? JSON.parse(r) : { v: 1, items: seed(), queue: [], seq: 0, device: Math.random().toString(36).slice(2, 8) }
  }
  get key() { return `curtaincall/${this.kind}/v1` }
  get items() { return this.state.items }
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
  async flush() {
    if (!this.state.queue.length || !this.adapter.online()) return
    try { const { ackedSeq } = await this.adapter.push(this.state.queue); this.state = { ...this.state, queue: this.state.queue.filter(x => x.seq > ackedSeq) }; this.emit() } catch { /* stays queued */ }
  }
}
