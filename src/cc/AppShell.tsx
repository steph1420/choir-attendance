// CurtainCall shell: dock on phone, left rail on desktop (03-NAVIGATION, Q70).
import { useState } from 'react'
import type { Store } from '../data/store'
import { sampleSession } from '../data/sample'
import { MarkScreen } from '../ui/MarkScreen'
import type { QuickNotes } from './quicknotes'
import { QuickNoteSheet } from './QuickNoteSheet'
import { TEMPLATES, type EventSetup } from './templates'
import type { Collection } from './collection'
import type { Costume, Note, Prop } from './kinds'
import { CostumesScreen, NotesScreen, PropsScreen } from './screens'
import { useSyncExternalStore } from 'react'
import type { History } from './history'
import type { CareFlag, Prefs } from './access'
import type { Events } from './templates'
import { MembersScreen, SettingsScreen } from './people'
export interface Cols { costumes: Collection<Costume>; props: Collection<Prop>; notes: Collection<Note>; care: Collection<CareFlag> }
export interface Ctx { hist: History; evs: Events; setEvs: (e: Events) => void; prefs: Prefs; setPrefs: (p: Prefs) => void }
export type Tab = 'today' | 'show' | 'members' | 'notes' | 'reports' | 'settings'
const TABS: [Tab, string, string][] = [['today', '☀', 'Today'], ['show', '🎭', 'Show'], ['members', '👥', 'Members'], ['notes', '📝', 'Notes'], ['reports', '📊', 'Reports']]
export function AppShell({ store, qn, ev, cols, initialTab = 'today', initialNote = false, initialShow = 'costumes', ctx }: { ctx: Ctx; store: Store; qn: QuickNotes; ev: EventSetup; cols: Cols; initialTab?: Tab; initialNote?: boolean; initialShow?: 'costumes' | 'props' }) {
  useSyncExternalStore(qn.subscribe.bind(qn), () => qn.state)
  const [show, setShow] = useState(initialShow); const [tip, setTip] = useState(() => localStorage.getItem('curtaincall/tip-today') !== 'off')
  const s0 = store.sessionFor(ev.id ?? 'e1', sampleSession); const tname = TEMPLATES.find(t => t.id === ev.template)?.name
  const sync = store.sync
  const h = ctx.hist; useSyncExternalStore(h.subscribe, h.snap)
  const [toast, setToast] = useState(''); const say = (t: string | null) => { if (t) { setToast(t); setTimeout(() => setToast(''), 2000) } }
  const UR = () => <><button className="cc-ib" aria-label="Undo" disabled={!h.past.length} title={h.past.at(-1)?.label} onClick={() => say(h.undo() && `Undone: ${h.future.at(-1)!.label}`)}>↶</button><button className="cc-ib" aria-label="Redo" disabled={!h.future.length} onClick={() => say(h.redo() && `Redone: ${h.past.at(-1)!.label}`)}>↷</button></>
  const [tab, setTab] = useState<Tab>(initialTab); const [note, setNote] = useState(initialNote)
  const L = ev.labels
  const label = (t: Tab) => t === 'members' ? L.members : t === 'settings' ? 'Settings' : TABS.find(x => x[0] === t)![2]
  const ph = (t: string, d: string) => <div className="cc-ph"><h1 className="pt">{t}</h1><p className="cap">{d}</p></div>
  return (
    <div className="cc-app">
      <nav className="cc-rail" aria-label="Main">
        <div className="cc-logo">CurtainCall<small>{ev.name}</small></div>
        {TABS.map(([t, i]) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}><b>{i}</b>{label(t)}</button>)}
        <button className={`gear ${tab === 'settings' ? 'on' : ''}`} onClick={() => setTab('settings')}><b>⚙</b>Settings</button>
      </nav>
      <div className="cc-main">
        {tab === 'today' && <MarkScreen store={store} sessionId={s0.id} labels={{ group: L.group, part: L.part }} header={c => <div className="cc-page cc-todayhead">
          <header className="cc-head"><div style={{ flex: 1 }}><h1>{L.session} · {s0.start}</h1><p className="cc-sub">{ev.name} · {tname} · <i className={`dot ${sync.kind}`} /> {sync.kind === 'synced' ? 'Synced' : `${sync.n} queued`}</p></div>
            <UR /><button className="cc-ib" aria-label="Settings" onClick={() => setTab('settings')}>⚙</button></header>
          <div className="cc-kpi"><div><b className="k-p">{c.present}</b><span>Present</span></div><div><b className="k-a">{c.A}</b><span>Absent</span></div><div><b className="k-l">{c.L}</b><span>Late</span></div><div><b className="k-e">{c.E}</b><span>Excused</span></div></div>
          {tip && <div className="cc-tip" role="note">✨<span>Tap to mark · tap a name for a remark</span><button aria-label="Dismiss tip" onClick={() => { localStorage.setItem('curtaincall/tip-today', 'off'); setTip(false) }}>×</button></div>}
        </div>} />}
        {tab === 'show' && <div className="cc-show"><div className="cc-chips cc-subtabs">{(['costumes', 'props'] as const).map(k => <button key={k} className={show === k ? 'on' : ''} onClick={() => setShow(k)}>{k === 'costumes' ? '👗 Costumes' : '🧺 Props'}</button>)}<span style={{ flex: 1 }} /><UR /></div>
          {show === 'costumes' ? <CostumesScreen col={cols.costumes} ev={ev.name} members={store.state.children} /> : <PropsScreen col={cols.props} ev={ev.name} />}</div>}
        {tab === 'members' && <MembersScreen kids={store.state.children} care={cols.care} costumes={cols.costumes} prefs={ctx.prefs} labels={L} />}
        {tab === 'notes' && <NotesScreen col={cols.notes} quick={qn.notes} />}
        {tab === 'reports' && ph('Reports', 'Coming in a later stage.')}
        {tab === 'settings' && <SettingsScreen evs={ctx.evs} setEvs={ctx.setEvs} prefs={ctx.prefs} setPrefs={ctx.setPrefs} />}
      </div>
      <button className="cc-fab" aria-label="Quick note" onClick={() => setNote(true)}>✎</button>
      <nav className="cc-dock" aria-label="Dock">
        {TABS.map(([t, i]) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}><b>{i}</b>{label(t)}</button>)}
      </nav>
      {toast && <div className="toast" role="status">{toast}</div>}
      {note && <QuickNoteSheet qn={qn} screen={tab === 'show' ? (show === 'costumes' ? 'Costumes' : 'Props') : label(tab)} by={ctx.prefs.teacher} onClose={() => setNote(false)} />}
    </div>)
}
