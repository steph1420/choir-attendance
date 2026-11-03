// CODE-1/5: one versioned contract for data. A-02 decisions cited inline.
export type Mark = 'P' | 'A' | 'L' | 'E' // A-02: P/A + combined L/E
export type Role = string // Singer | Action | Prop (extendable)
export interface Child { id: string; name: string; section: string; role: Role }
export interface Entry {
  mark?: Mark
  reason?: string // Excused reason, optional
  leftEarly?: boolean // Q26: in ⋯ menu
  remark?: string // tap name → remark
  stars?: number // 1..5 proficiency
}
export interface Session {
  id: string; date: string; slot: string; venue: string; start: string; end: string
  status: 'planned' | 'conducted' | 'not-conducted' | 'cancelled' | 'rescheduled' | 'shortened' | 'combined' | 'teacher-absent'
  takenBy?: string; remark?: string
  eventId?: string // v2: CurtainCall per-event scope
  entries: Record<string, Entry>
}
export type Op =
  | { t: 'mark'; sessionId: string; childId: string; mark: Mark | null; reason?: string }
  | { t: 'leftEarly'; sessionId: string; childId: string; value: boolean }
  | { t: 'note'; sessionId: string; childId: string; remark: string; stars?: number }
  | { t: 'allPresent'; sessionId: string; childIds: string[] }
  | { t: 'takenBy'; sessionId: string; name: string }
export interface QueuedOp { v: 1; seq: number; at: string; device: string; op: Op }
export interface Saved { attAt?: Record<string, string>; v: number; children: Child[]; sessions: Session[]; queue: QueuedOp[]; seq: number; device: string }
export type GroupBy = 'section' | 'role' | 'az'
