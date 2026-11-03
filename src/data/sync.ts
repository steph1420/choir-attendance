// CODE-3: external system behind an interface with a fake.
import type { QueuedOp } from './model'
export interface SyncAdapter { push(batch: QueuedOp[]): Promise<{ ackedSeq: number }>; online(): boolean }
export type SyncState = { kind: 'synced' } | { kind: 'syncing'; n: number } | { kind: 'offline'; n: number }
/** Stub for v0.1.0: pretends to be the Apps Script endpoint; can simulate offline/loss. */
export class FakeSync implements SyncAdapter {
  isOnline = true; failNext = 0; received: QueuedOp[] = []
  online() { return this.isOnline }
  async push(batch: QueuedOp[]) {
    if (!this.isOnline) throw new Error('offline')
    if (this.failNext > 0) { this.failNext--; throw new Error('lost') }
    for (const op of batch) if (!this.received.some(r => r.seq === op.seq && r.device === op.device)) this.received.push(op) // dedupe
    return { ackedSeq: Math.max(...batch.map(b => b.seq)) }
  }
}
/** Real adapter: POST to Apps Script web app URL (set in Settings). */
export class AppsScriptSync implements SyncAdapter {
  constructor(private url: string, private auth?: { pass: string | null; check(j: unknown): boolean }) {}
  online() { return (typeof navigator === 'undefined' || navigator.onLine) && (!this.auth || !!this.auth.pass) }
  async push(batch: QueuedOp[]) {
    const r = await fetch(this.url, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ v: 2, pass: this.auth?.pass ?? undefined, ops: batch }) /* v2 additive: v1 ops + record ops */ })
    const j = await r.json(); if (this.auth?.check(j)) throw new Error('passcode'); if (j.v !== 1 && j.v !== 2) throw new Error(`contract version mismatch: ${j.v}`)
    if (!j.ok) throw new Error(j.error || 'server error'); return { ackedSeq: j.ackedSeq }
  }
}
