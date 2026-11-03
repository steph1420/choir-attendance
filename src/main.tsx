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
import { loadEvent, saveEvent, makeEvent, KEY } from './cc/templates'
const url = localStorage.getItem('choir-attendance/endpoint')
const adapter = url ? new AppsScriptSync(url) : new FakeSync()
const params = new URLSearchParams(location.search)
if (params.has('offline') && adapter instanceof FakeSync) adapter.isOnline = false
if (params.has('reset')) { localStorage.removeItem(CONFIG.storageKey); localStorage.removeItem(KEY); for (const k of ['costumes', 'props', 'notes', 'quicknotes']) localStorage.removeItem(`curtaincall/${k}/v1`); localStorage.removeItem('curtaincall/tip-today') }
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
const cols = { costumes: new Collection<Costume>('costumes', localStorage, adapter, () => demo ? seedCostumes(store.state.children) : []), props: new Collection<Prop>('props', localStorage, adapter, () => demo ? seedProps() : []), notes: new Collection<Note>('notes', localStorage, adapter, () => demo ? seedNotes() : []) }
setInterval(() => { void qn.flush(); Object.values(cols).forEach(c => void c.flush()) }, CONFIG.syncRetryMs)
function Root() {
  const [ev, setEv] = useState(loadEvent(localStorage))
  if (!ev) return <TemplatePicker onDone={e => { saveEvent(localStorage, e); setEv(e) }} />
  return <AppShell store={store} qn={qn} ev={ev} cols={cols} initialShow={params.get('show') === 'props' ? 'props' : 'costumes'} initialTab={(params.get('tab') as Tab) ?? 'today'} initialNote={params.has('note')} />
}
createRoot(document.getElementById('root')!).render(<Root />)
