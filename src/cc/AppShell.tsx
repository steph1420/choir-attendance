// CurtainCall shell: dock on phone, left rail on desktop (03-NAVIGATION, Q70).
import { useState } from 'react'
import type { Store } from '../data/store'
import { MarkScreen } from '../ui/MarkScreen'
import type { QuickNotes } from './quicknotes'
import { QuickNoteSheet } from './QuickNoteSheet'
import { TEMPLATES, type EventSetup } from './templates'
import type { Collection } from './collection'
import type { Costume, Note, Prop } from './kinds'
import { CostumesScreen, NotesScreen, PropsScreen } from './screens'
import { useSyncExternalStore } from 'react'
export interface Cols { costumes: Collection<Costume>; props: Collection<Prop>; notes: Collection<Note> }
export type Tab = 'today' | 'show' | 'members' | 'notes' | 'reports' | 'settings'
const TABS: [Tab, string, string][] = [['today', '☀', 'Today'], ['show', '🎭', 'Show'], ['members', '👥', 'Members'], ['notes', '📝', 'Notes'], ['reports', '📊', 'Reports']]
export function AppShell({ store, qn, ev, cols, initialTab = 'today', initialNote = false, initialShow = 'costumes' }: { store: Store; qn: QuickNotes; ev: EventSetup; cols: Cols; initialTab?: Tab; initialNote?: boolean; initialShow?: 'costumes' | 'props' }) {
  useSyncExternalStore(qn.subscribe.bind(qn), () => qn.state)
  const [show, setShow] = useState(initialShow); const [tip, setTip] = useState(() => localStorage.getItem('curtaincall/tip-today') !== 'off')
  const s0 = store.state.sessions[0]; const tname = TEMPLATES.find(t => t.id === ev.template)?.name
  const sync = store.sync
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
            <button className="cc-ib" aria-label="Undo" disabled title="Undo — next slice">↶</button><button className="cc-ib" aria-label="Redo" disabled title="Redo — next slice">↷</button><button className="cc-ib" aria-label="Settings" onClick={() => setTab('settings')}>⚙</button></header>
          <div className="cc-kpi"><div><b className="k-p">{c.present}</b><span>Present</span></div><div><b className="k-a">{c.A}</b><span>Absent</span></div><div><b className="k-l">{c.L}</b><span>Late</span></div><div><b className="k-e">{c.E}</b><span>Excused</span></div></div>
          {tip && <div className="cc-tip" role="note">✨<span>Tap to mark · tap a name for a remark</span><button aria-label="Dismiss tip" onClick={() => { localStorage.setItem('curtaincall/tip-today', 'off'); setTip(false) }}>×</button></div>}
        </div>} />}
        {tab === 'show' && <div className="cc-show"><div className="cc-chips cc-subtabs">{(['costumes', 'props'] as const).map(k => <button key={k} className={show === k ? 'on' : ''} onClick={() => setShow(k)}>{k === 'costumes' ? '👗 Costumes' : '🧺 Props'}</button>)}</div>
          {show === 'costumes' ? <CostumesScreen col={cols.costumes} ev={ev.name} /> : <PropsScreen col={cols.props} ev={ev.name} />}</div>}
        {tab === 'members' && ph(L.members, `${L.member} list and ${L.group.toLowerCase()}s — next slice.`)}
        {tab === 'notes' && <NotesScreen col={cols.notes} quick={qn.state.notes} />}
        {tab === 'reports' && ph('Reports', 'Coming in a later stage.')}
        {tab === 'settings' && ph('Settings', `Template: ${ev.template}. Label editing — next slice.`)}
      </div>
      <button className="cc-fab" aria-label="Quick note" onClick={() => setNote(true)}>✎</button>
      <nav className="cc-dock" aria-label="Dock">
        {TABS.map(([t, i]) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}><b>{i}</b>{label(t)}</button>)}
      </nav>
      {note && <QuickNoteSheet qn={qn} screen={tab === 'show' ? (show === 'costumes' ? 'Costumes' : 'Props') : label(tab)} by="Teacher-S" onClose={() => setNote(false)} />}
    </div>)
}
