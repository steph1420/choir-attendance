import { useRef, useState } from 'react'
import { CONFIG } from '../config'
import { countMarks, groupChildren } from '../data/derive'
import type { GroupBy } from '../data/model'
import type { Store } from '../data/store'
import { useStore } from '../data/useStore'
import { AzStrip } from '../az/AzStrip'
import { ChildRow } from './ChildRow'
import { RemarkSheet } from './RemarkSheet'
export function MarkScreen({ store, sessionId }: { store: Store; sessionId: string }) {
  useStore(store)
  const s = store.session(sessionId)
  const kids = store.state.children
  const [by, setBy] = useState<GroupBy>('section')
  const [note, setNote] = useState<string | null>(null)
  const [azLeft, setAzLeft] = useState<boolean>(CONFIG.az.leftSide)
  const [toast, setToast] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const c = countMarks(kids, s.entries, CONFIG.excusedCountsAs)
  const groups = groupChildren(kids, by)
  const sync = store.sync
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(null), 3000) }
  const jump = (L: string) => { const el = listRef.current?.querySelector(`[data-group="${L}"]`); el?.scrollIntoView({ block: 'start' }) }
  const noteChild = kids.find(k => k.id === note)
  return (
    <div className="shell">
      <header className="topbar">
        <div className="logo"><span className="wm">CHOIR</span><span className="sub">ATTENDANCE</span></div>
        <div className="sync" aria-live="polite"><i className={`dot ${sync.kind}`} />{sync.kind === 'synced' ? 'Synced' : sync.kind === 'syncing' ? `Syncing ${sync.n}` : `Offline · ${sync.n} queued`}</div>
      </header>
      <div className="body">
        <main className="page">
          <div className="head">
            <div><p className="lbl">{s.slot} · {s.venue} · {s.start}</p><h1 className="pt">Mark</h1></div>
            <div className="count"><span className="disp">{c.present}</span><span className="of"> / {c.total}</span><p className="cap">present</p></div>
          </div>
          <label className="field taken"><span className="cap">Taken by</span>
            <input value={s.takenBy ?? ''} placeholder="Teacher name (optional)" onChange={e => store.dispatch({ t: 'takenBy', sessionId, name: e.target.value })} /></label>
          <div className="actions">
            <button className="btno" onClick={() => { store.dispatch({ t: 'allPresent', sessionId, childIds: kids.map(k => k.id) }); say('Unmarked children set to Present') }}>✓ All present</button>
          </div>
          <div className="seg" role="tablist">
            {(['section', 'role', 'az'] as GroupBy[]).map(g => <button key={g} role="tab" aria-selected={by === g} className={by === g ? 'on' : ''} onClick={() => setBy(g)}>{g === 'section' ? 'Section' : g === 'role' ? 'Role' : 'A–Z'}</button>)}
          </div>
          <div className={`list ${by === 'az' ? (azLeft ? 'az-pad-left' : 'az-pad') : ''}`} ref={listRef}>
            {groups.map(g => (
              <section key={g.key} data-group={g.key} className="group">
                <h2 className="ghead">{g.key} <span>{g.children.length}</span></h2>
                <div className="rows">
                  {g.children.map(ch => (
                    <ChildRow key={ch.id} child={ch} entry={s.entries[ch.id]}
                      onMark={(mark, reason) => store.dispatch({ t: 'mark', sessionId, childId: ch.id, mark, reason })}
                      onLeftEarly={v => store.dispatch({ t: 'leftEarly', sessionId, childId: ch.id, value: v })}
                      onNote={() => setNote(ch.id)} onHistory={() => say('Child history comes in v0.2')} />))}
                </div>
              </section>))}
          </div>
          {by === 'az' && <AzStrip names={kids.map(k => k.name)} left={azLeft} onJump={jump} />}
          {by === 'az' && <button className="az-side" onClick={() => setAzLeft(!azLeft)} aria-label="Move strip">{azLeft ? '→' : '←'}</button>}
        </main>
        <aside className="side">
          <p className="lbl">Present</p><p className="disp big">{c.present}</p><p className="cap">of {c.total}</p>
          <dl className="tally"><dt>Absent</dt><dd>{c.A}</dd><dt>Late</dt><dd className="late">{c.L}</dd><dt>Excused</dt><dd className="exc">{c.E}</dd><dt>Unmarked</dt><dd>{c.unmarked}</dd></dl>
          <p className="cap">Total {c.P + c.A + c.L + c.E + c.unmarked} = {kids.length}</p>
        </aside>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
      {noteChild && <RemarkSheet child={noteChild} entry={s.entries[noteChild.id]} onClose={() => setNote(null)}
        onSave={(remark, stars) => store.dispatch({ t: 'note', sessionId, childId: noteChild.id, remark, stars })} />}
    </div>
  )
}
