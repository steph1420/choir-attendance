// 08-shared-app-patterns: apps check named capabilities, never role names. Roles map to capabilities.
export type Cap = 'view.careFlags' | 'edit.careFlags' | 'admin.permissions'
export type Role = 'teacher' | 'coordinator' | 'admin'
export const ROLES: Role[] = ['teacher', 'coordinator', 'admin']
export const CAPS: Cap[] = ['view.careFlags', 'edit.careFlags', 'admin.permissions']
export type CapMap = Record<Role, Cap[]>
export const DEFAULT_CAPS: CapMap = { teacher: [], coordinator: [...CAPS], admin: [...CAPS] } // Steve t20u Q66
export const can = (m: CapMap, r: Role, c: Cap) => m[r]?.includes(c) ?? false
/** Only a role holding admin.permissions may change the map; admin always keeps admin.permissions (no lock-out). */
export function setCap(m: CapMap, actor: Role, target: Role, c: Cap, on: boolean): CapMap {
  if (!can(m, actor, 'admin.permissions')) throw new Error('not allowed')
  if (target === 'admin' && c === 'admin.permissions' && !on) return m
  const cur = new Set(m[target]); if (on) cur.add(c); else cur.delete(c)
  return { ...m, [target]: CAPS.filter(x => cur.has(x)) }
}
export const TEACHERS = ['Teacher-S', 'Teacher-A', 'Teacher-B', 'Coordinator-C'] // codenames; login-based later
export interface Prefs { teacher: string; role: Role; caps: CapMap }
export const PREFS_KEY = 'curtaincall/prefs/v1'
export const loadPrefs = (kv: { getItem(k: string): string | null }): Prefs => ({ teacher: 'Teacher-S', role: 'coordinator', caps: DEFAULT_CAPS, ...JSON.parse(kv.getItem(PREFS_KEY) ?? '{}') })
export interface CareFlag { id: string; note: string } // id = memberId
