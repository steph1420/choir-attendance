// Q82b team passcode, kept on this device and sent with every request. A 401-style reply clears it and re-prompts.
export const PASS_KEY = 'curtaincall/passcode'
type KV = { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }
export class Auth {
  private subs = new Set<() => void>(); wrong = false
  constructor(private kv: KV) {}
  get pass() { return this.kv.getItem(PASS_KEY) }
  subscribe = (f: () => void) => { this.subs.add(f); return () => { this.subs.delete(f) } }
  snap = () => `${this.pass ?? ''}|${this.wrong}`
  set(p: string) { this.kv.setItem(PASS_KEY, p.trim()); this.wrong = false; this.subs.forEach(f => f()) }
  /** Call with a server reply; returns true if it was an auth failure (and clears the passcode). */
  check(j: { ok?: boolean; auth?: boolean }) {
    if (j && j.ok === false && j.auth === false) { this.kv.removeItem(PASS_KEY); this.wrong = true; this.subs.forEach(f => f()); return true }
    return false
  }
}
