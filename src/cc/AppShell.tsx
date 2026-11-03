// CurtainCall shell: dock on phone, left rail on desktop (03-NAVIGATION, Q70).
import { useState } from 'react'
import type { Store } from '../data/store'
import { MarkScreen } from '../ui/MarkScreen'
import type { QuickNotes } from './quicknotes'
import { QuickNoteSheet } from './QuickNoteSheet'
import type { EventSetup } from './templates'
export type Tab = 'today' | 'show' | 'members' | 'notes' | 'reports' | 'settings'
const TABS: [Tab, string, string][] = [['today', '☀', 'Today'], ['show', '🎭', 'Show'], ['members', '👥', 'Members'], ['notes', '📝', 'Notes'], ['reports', '📊', 'Reports']]
export function AppShell({ store, qn, ev, initialTab = 'today', initialNote = false }: { store: Store; qn: QuickNotes; ev: EventSetup; initialTab?: Tab; initialNote?: boolean }) {
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
        {tab === 'today' && <MarkScreen store={store} sessionId={store.state.sessions[0].id} />}
        {tab === 'show' && ph('Show', 'Costumes and Props arrive in the next slice.')}
        {tab === 'members' && ph(L.members, `${L.member} list and ${L.group.toLowerCase()}s — next slice.`)}
        {tab === 'notes' && ph('Notes', `${qn.state.notes.length} quick note(s) saved. Full Notes screen — next slice.`)}
        {tab === 'reports' && ph('Reports', 'Coming in a later stage.')}
        {tab === 'settings' && ph('Settings', `Template: ${ev.template}. Label editing — next slice.`)}
      </div>
      <button className="cc-fab" aria-label="Quick note" onClick={() => setNote(true)}>✎</button>
      <nav className="cc-dock" aria-label="Dock">
        {TABS.map(([t, i]) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}><b>{i}</b>{label(t)}</button>)}
      </nav>
      {note && <QuickNoteSheet qn={qn} screen={label(tab)} by="Teacher-S" onClose={() => setNote(false)} />}
    </div>)
}
