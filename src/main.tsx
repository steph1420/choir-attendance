import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/app.css'
import { CONFIG } from './config'
import { sampleChildren, sampleSession } from './data/sample'
import { Store } from './data/store'
import { AppsScriptSync, FakeSync } from './data/sync'
import './cc/cc.css'
import { useState } from 'react'
import { AppShell, type Tab } from './cc/AppShell'
import { QuickNotes } from './cc/quicknotes'
import { Collection } from './cc/collection'
import { seedCostumes, seedNotes, seedProps } from './cc/seed'
import type { Costume, Note, Prop } from './cc/kinds'
import { TemplatePicker } from './cc/TemplatePicker'
import { loadEvent, saveEvent, makeEvent, KEY, loadEvents, activeEvent, EVENTS_KEY, addEvent, type Events } from './cc/templates'
import { History, trackCollection, trackStore } from './cc/history'
import { loadPrefs, PREFS_KEY, type CareFlag, type Prefs } from './cc/access'
const url = localStorage.getItem('choir-attendance/endpoint')
const adapter = url ? new AppsScriptSync(url) : new FakeSync()
const params = new URLSearchParams(location.search)
if (params.has('offline') && adapter instanceof FakeSync) adapter.isOnline = false
if (params.has('reset')) { localStorage.removeItem(CONFIG.storageKey); localStorage.removeItem(KEY); localStorage.removeItem(EVENTS_KEY); localStorage.removeItem(PREFS_KEY); for (const k of ['costumes', 'props', 'notes', 'quicknotes', 'care']) localStorage.removeItem(`curtaincall/${k}/v1`); localStorage.removeItem('curtaincall/tip-today') }
if (params.has('demo') && !loadEvent(localStorage)) saveEvent(localStorage, makeEvent('choir', 'Annual Day'))
const store = new Store(localStorage, adapter, () => ({ children: sampleChildren(), sessions: [sampleSession()] }))
if (params.has('demo') && !Object.keys(store.state.sessions[0].entries).length) {
  // Placeholder demo marks for screenshots only.
  const sid = store.state.sessions[0].id
  store.dispatch({ t: 'allPresent', sessionId: sid, childIds: store.state.children.map(c => c.id) })
  store.dispatch({ t: 'mark', sessionId: sid, childId: 'X005', mark: 'A' })
  store.dispatch({ t: 'mark', sessionId: sid, childId: 'X008', mark: 'L' })
  store.dispatch({ t: 'mark', sessionId: sid, childId: 'X013', mark: 'E', reason: 'Sick' })
  store.dispatch({ t: 'note', sessionId: sid, childId: 'X003', remark: 'Good pitch', stars: 4 })
  store.dispatch({ t: 'takenBy', sessionId: sid, name: 'Teacher-S' })
}
setInterval(() => void store.flush(), CONFIG.syncRetryMs)
window.addEventListener('online', () => void store.flush())
const qn = new QuickNotes(localStorage, adapter) // offline-queue mode until Apps Script is deployed
const demo = params.has('demo')
const cols = { costumes: new Collection<Costume>('costumes', localStorage, adapter, () => demo ? seedCostumes(store.state.children) : []), props: new Collection<Prop>('props', localStorage, adapter, () => demo ? seedProps() : []), notes: new Collection<Note>('notes', localStorage, adapter, () => demo ? seedNotes() : []), care: new Collection<CareFlag>('care', localStorage, adapter, () => demo ? [{ id: 'X002', note: 'Sample: nut allergy' }, { id: 'X007', note: 'Sample: inhaler' }] : []) }
const hist = new History(); trackStore(store, hist); trackCollection(cols.costumes, hist, 'costume'); trackCollection(cols.props, hist, 'prop')
setInterval(() => { void qn.flush(); Object.values(cols).forEach(c => void c.flush()) }, CONFIG.syncRetryMs)
function Root() {
  const [evs, setEvsS] = useState<Events | null>(() => loadEvents(localStorage))
  const [prefs, setPrefsS] = useState<Prefs>(() => loadPrefs(localStorage))
  const setEvs = (e: Events) => { localStorage.setItem(EVENTS_KEY, JSON.stringify(e)); saveEvent(localStorage, activeEvent(e)); setEvsS(e) }
  const setPrefs = (p: Prefs) => { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); setPrefsS(p) }
  if (!evs) return <TemplatePicker onDone={e => setEvs(addEvent(null, e))} />
  const role = params.get('role'); const pr = role ? { ...prefs, role: role as Prefs['role'] } : prefs
  return <AppShell store={store} qn={qn} ev={activeEvent(evs)} cols={cols} ctx={{ hist, evs, setEvs, prefs: pr, setPrefs }} initialShow={params.get('show') === 'props' ? 'props' : 'costumes'} initialTab={(params.get('tab') as Tab) ?? 'today'} initialNote={params.has('note')} />
}
createRoot(document.getElementById('root')!).render(<Root />)
