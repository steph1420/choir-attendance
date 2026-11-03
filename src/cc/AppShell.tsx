// CurtainCall shell: dock on phone, left rail on desktop (03-NAVIGATION, Q70).
import { useState } from 'react'
import type { Store } from '../data/store'
import { sampleSession } from '../data/sample'
import { TodayScreen } from './TodayScreen'
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
import { statusText, type Puller } from './pull'
export interface Cols { costumes: Collection<Costume>; props: Collection<Prop>; notes: Collection<Note>; care: Collection<CareFlag> }
export interface Ctx { puller: Puller; endpoint: string; setEndpoint: (u: string) => void; hist: History; evs: Events; setEvs: (e: Events) => void; prefs: Prefs; setPrefs: (p: Prefs) => void }
export type Tab = 'today' | 'show' | 'members' | 'notes' | 'reports' | 'settings'
const TABS: [Tab, string, string][] = [['today', '☀', 'Today'], ['show', '🎭', 'Show'], ['members', '👥', 'Members'], ['notes', '📝', 'Notes'], ['reports', '📊', 'Reports']]
export function AppShell({ store, qn, ev, cols, initialTab = 'today', initialNote = false, initialShow = 'costumes', ctx }: { ctx: Ctx; store: Store; qn: QuickNotes; ev: EventSetup; cols: Cols; initialTab?: Tab; initialNote?: boolean; initialShow?: 'costumes' | 'props' }) {
  useSyncExternalStore(qn.subscribe.bind(qn), () => qn.state)
  const [show, setShow] = useState(initialShow)
  const s0 = store.sessionFor(ev.id ?? 'e1', sampleSession); const tname = TEMPLATES.find(t => t.id === ev.template)?.name
  const sync = store.sync
  const ps = useSyncExternalStore(ctx.puller.subscribe, ctx.puller.snap); const stxt = statusText(sync, ps); const dotk = sync.kind === 'offline' || ps.kind === 'error' ? 'offline' : sync.kind === 'syncing' || ps.kind === 'pulling' ? 'syncing' : 'synced'
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
        <div className="cc-logo">CurtainCall<small>{ev.name}</small><small className="cc-sync"><i className={`dot ${dotk}`} /> {stxt}</small></div>
        {TABS.map(([t, i]) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}><b>{i}</b>{label(t)}</button>)}
        <button className={`gear ${tab === 'settings' ? 'on' : ''}`} onClick={() => setTab('settings')}><b>⚙</b>Settings</button>
      </nav>
      <div className="cc-main">
        {tab === 'today' && <TodayScreen store={store} session={s0} title={`${L.session} · ${s0.start}`} sub={`${ev.name} · ${tname}`} teacher={ctx.prefs.teacher} onSay={say}
          groupLabel={L.group} partLabel={L.part} sync={<span className="cc-sync" role="status" title={stxt} aria-label={stxt}><i className={`dot ${dotk}`} /> {stxt}</span>}
          actions={<><UR /><button className="cc-ib" aria-label="Settings" onClick={() => setTab('settings')}>⚙</button></>} />}
        {tab === 'show' && <div className="cc-show"><div className="cc-chips cc-subtabs">{(['costumes', 'props'] as const).map(k => <button key={k} className={show === k ? 'on' : ''} onClick={() => setShow(k)}>{k === 'costumes' ? '👗 Costumes' : '🧺 Props'}</button>)}<span style={{ flex: 1 }} /><UR /></div>
          {show === 'costumes' ? <CostumesScreen col={cols.costumes} ev={ev.name} members={store.state.children} /> : <PropsScreen col={cols.props} ev={ev.name} />}</div>}
        {tab === 'members' && <MembersScreen ur={<UR />} kids={store.state.children} care={cols.care} costumes={cols.costumes} prefs={ctx.prefs} labels={L} />}
        {tab === 'notes' && <NotesScreen ur={<UR />} col={cols.notes} quick={qn.notes} />}
        {tab === 'reports' && ph('Reports', 'Coming in a later stage.')}
        {tab === 'settings' && <SettingsScreen endpoint={ctx.endpoint} setEndpoint={ctx.setEndpoint} evs={ctx.evs} setEvs={ctx.setEvs} prefs={ctx.prefs} setPrefs={ctx.setPrefs} />}
      </div>
      <button className="cc-fab" aria-label="Quick note" onClick={() => setNote(true)}>✎</button>
      <nav className="cc-dock" aria-label="Dock">
        {TABS.map(([t, i]) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}><b>{i}</b>{label(t)}</button>)}
      </nav>
      {toast && <div className="toast" role="status">{toast}</div>}
      {note && <QuickNoteSheet qn={qn} screen={tab === 'show' ? (show === 'costumes' ? 'Costumes' : 'Props') : label(tab)} by={ctx.prefs.teacher} onClose={() => setNote(false)} />}
    </div>)
}
