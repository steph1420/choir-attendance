import { Auth, PASS_KEY } from '../src/cc/auth'
import { Puller } from '../src/cc/pull'
import { AppsScriptSync } from '../src/data/sync'
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } }
const DENY = { v: 2, ok: false, auth: false, status: 401, error: 'passcode required' }
test('puller sends passcode; wrong passcode clears it and re-prompts', async () => {
  const kv = mem(); const a = new Auth(kv); let seen = ''; let reply: unknown = { v: 2, ok: true, records: {} }
  const f = (async (u: string) => { seen = u; return { json: async () => reply } }) as unknown as typeof fetch
  const p = new Puller('https://s/exec', {}, f, () => true, () => new Date(), a)
  await p.pull(); expect(p.status.error).toBe('passcode needed'); expect(seen).toBe('')
  a.set(' team pass '); await p.pull(); expect(seen).toBe('https://s/exec?v=2&pass=team%20pass'); expect(p.status.kind).toBe('ok')
  reply = DENY; await p.pull(); expect(p.status.kind).toBe('error'); expect(kv.getItem(PASS_KEY)).toBeNull(); expect(a.wrong).toBe(true)
  a.set('x'); expect(a.wrong).toBe(false)
})
test('push carries passcode in body, waits without one, 401 keeps ops queued', async () => {
  const kv = mem(); const a = new Auth(kv); const bodies: string[] = []; let reply: unknown = { v: 2, ok: true, ackedSeq: 1 }
  globalThis.fetch = (async (_u: string, o: { body: string }) => { bodies.push(o.body); return { json: async () => reply } }) as unknown as typeof fetch
  const s = new AppsScriptSync('https://s/exec', a); expect(s.online()).toBe(false)
  a.set('pw'); expect(s.online()).toBe(true)
  await s.push([{ v: 1, seq: 1, at: 't', device: 'd', op: { t: 'takenBy', sessionId: 's', name: 'T' } }]); expect(JSON.parse(bodies[0]).pass).toBe('pw')
  reply = DENY; await expect(s.push([])).rejects.toThrow(/passcode/); expect(a.pass).toBeNull()
})
