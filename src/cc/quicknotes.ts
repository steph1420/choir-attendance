// Quick notes (Steve t19u Q70): tied to the screen, timestamped, saved locally, queued for sync (offline-queue mode).
import type { KV } from '../data/store'
import type { SyncAdapter } from '../data/sync'
import type { QueuedOp } from '../data/model'
export interface QuickNote { id: string; screen: string; text: string; at: string; by?: string }
interface Saved { v: 1; notes: QuickNote[]; queue: QueuedOp[]; seq: number; device: string }
export const QN_KEY = 'curtaincall/quicknotes/v1'
export class QuickNotes {
  state: Saved; private subs = new Set<() => void>()
  constructor(private kv: KV, private adapter: SyncAdapter, private now = () => new Date()) {
    const r = kv.getItem(QN_KEY)
    this.state = r ? JSON.parse(r) : { v: 1, notes: [], queue: [], seq: 0, device: Math.random().toString(36).slice(2, 8) }
  }
  subscribe(f: () => void) { this.subs.add(f); return () => { this.subs.delete(f) } }
  private emit() { this.kv.setItem(QN_KEY, JSON.stringify(this.state)); this.subs.forEach(f => f()) }
  forScreen(screen: string) { return this.state.notes.filter(n => n.screen === screen) }
  add(screen: string, text: string, by?: string): QuickNote | null {
    const t = text.trim(); if (!t) return null
    const seq = this.state.seq + 1, at = this.now().toISOString()
    const note: QuickNote = { id: `${this.state.device}-${seq}`, screen, text: t, at, by }
    // Op shape kept loose: contract v2 (additive) will add 'quickNote' server-side.
    const op = { t: 'quickNote', ...note } as unknown as QueuedOp['op']
    this.state = { ...this.state, seq, notes: [note, ...this.state.notes], queue: [...this.state.queue, { v: 1, seq, at, device: this.state.device, op }] }
    this.emit(); void this.flush(); return note
  }
  async flush() {
    if (!this.state.queue.length || !this.adapter.online()) return
    try { const { ackedSeq } = await this.adapter.push(this.state.queue); this.state = { ...this.state, queue: this.state.queue.filter(q => q.seq > ackedSeq) }; this.emit() } catch { /* stays queued */ }
  }
}
