// Pull sync (contract v2): GET ?v=2 on load, on focus, and every ~60 s while online.
import type { Remote } from './collection'
export type Kind = 'events' | 'costumes' | 'props' | 'notes' | 'quicknotes' | 'care' | 'permissions'
export interface Mergeable { merge(r: Remote<never>[]): number }
export type PullStatus = { kind: 'idle' | 'pulling' | 'ok' | 'error' | 'offline' | 'local'; at?: string; error?: string; changed?: number }
export class Puller {
  status: PullStatus; private subs = new Set<() => void>(); private busy = false
  constructor(private url: string | null, private targets: Partial<Record<Kind, Mergeable>>, private fetcher: typeof fetch = (...a) => fetch(...a), private online = () => typeof navigator === 'undefined' || navigator.onLine, private now = () => new Date(), private auth?: { pass: string | null; check(j: unknown): boolean }) {
    this.status = { kind: url ? 'idle' : 'local' }
  }
  subscribe = (f: () => void) => { this.subs.add(f); return () => { this.subs.delete(f) } }
  snap = () => this.status
  private set(s: PullStatus) { this.status = s; this.subs.forEach(f => f()) }
  async pull() {
    if (!this.url || this.busy) return
    if (!this.online()) return this.set({ ...this.status, kind: 'offline' })
    this.busy = true; this.set({ ...this.status, kind: 'pulling' })
    try {
      if (this.auth && !this.auth.pass) { this.busy = false; return this.set({ ...this.status, kind: 'error', error: 'passcode needed' }) }
      const pq = this.auth?.pass ? `&pass=${encodeURIComponent(this.auth.pass)}` : ''
      const r = await this.fetcher(`${this.url}${this.url.includes('?') ? '&' : '?'}v=2${pq}`); const j = await r.json()
      if (this.auth?.check(j)) throw new Error('wrong passcode')
      if (!j.ok) throw new Error(j.error || 'server error'); if (j.v !== 2 || !j.records) throw new Error('backend is not contract v2 yet')
      let changed = 0; for (const [k, t] of Object.entries(this.targets)) changed += t!.merge(j.records[k] ?? [])
      this.set({ kind: 'ok', at: this.now().toISOString(), changed })
    } catch (e) { this.set({ ...this.status, kind: 'error', error: String((e as Error).message ?? e) }) } finally { this.busy = false }
  }
  start(everyMs = 60000) {
    void this.pull(); const t = setInterval(() => void this.pull(), everyMs)
    const f = () => void this.pull(); window.addEventListener('focus', f); window.addEventListener('online', f)
    return () => { clearInterval(t); window.removeEventListener('focus', f); window.removeEventListener('online', f) }
  }
}
export function statusText(push: { kind: string; n?: number }, pull: PullStatus) {
  const t = (iso?: string) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
  if (push.kind === 'offline') return `Offline · ${push.n} queued`
  if (pull.kind === 'local') return push.kind === 'syncing' ? `${push.n} queued · no backend yet` : 'On this device · no backend yet'
  if (pull.kind === 'error') return `Sync problem · ${pull.error}`
  if (push.kind === 'syncing') return `Sending ${push.n}…`
  if (pull.kind === 'pulling') return 'Checking for changes…'
  return pull.at ? `Synced · ${t(pull.at)}` : 'Synced'
}
