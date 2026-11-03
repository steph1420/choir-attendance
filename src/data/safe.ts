// Defensive localStorage reads (blank-screen fix): never throw at startup on stale/foreign/corrupt data.
export type ReadKV = { getItem(k: string): string | null }
export function readJSON<T>(kv: ReadKV, key: string, valid: (x: any) => boolean): T | null {
  let raw: string | null = null
  try { raw = kv.getItem(key) } catch { return null }
  if (raw == null) return null
  try { const x = JSON.parse(raw); if (valid(x)) return x as T } catch { /* corrupt */ }
  try { (kv as unknown as { setItem(k: string, v: string): void }).setItem(`${key}.bad`, raw) } catch { /* full */ }
  return null
}
export const isArr = Array.isArray
export const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
export const isEvent = (e: any) => isObj(e) && typeof e.name === 'string' && typeof e.template === 'string' && isObj(e.labels)
export const isQueueState = (x: any, list: string) => isObj(x) && isArr(x[list]) && isArr(x.queue) && typeof x.seq === 'number'
