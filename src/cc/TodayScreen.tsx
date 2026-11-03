// Today v2 (Steve t43u–t47u): compact panel that is NORMAL scroll content (never collapses).
// Normal scrolling (Steve t51u: spring-peek removed); section headers stay sticky.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CONFIG } from '../config'
import { countMarks, groupChildren } from '../data/derive'
import type { GroupBy, Session } from '../data/model'
import type { Store } from '../data/store'
import { useStore } from '../data/useStore'
import { ChildRow } from '../ui/ChildRow'
import { RemarkSheet } from '../ui/RemarkSheet'
export function TodayScreen({ store, session, title, sub, sync, actions, groupLabel, partLabel, teacher, onSay }: {
  store: Store; session: Session; title: string; sub: string; sync: ReactNode; actions: ReactNode; groupLabel: string; partLabel: string; teacher: string; onSay: (t: string) => void
}) {
  useStore(store)
  const s = store.session(session.id), kids = store.state.children, sid = s.id
  const [by, setBy] = useState<GroupBy>('section'); const [note, setNote] = useState<string | null>(null); const [info, setInfo] = useState(false)
  const [tip, setTip] = useState(() => localStorage.getItem('curtaincall/tip-today') !== 'off')
  const scroller = useRef<HTMLDivElement>(null), groupsRef = useRef<HTMLDivElement>(null)
  const c = countMarks(kids, s.entries, CONFIG.excusedCountsAs)
  // "Taken by" is remembered once: the device's teacher signs the session on the first mark.
  useEffect(() => { if (!s.takenBy && Object.keys(s.entries).length && teacher) store.dispatch({ t: 'takenBy', sessionId: sid, name: teacher }) }, [s.entries, s.takenBy, sid, teacher, store])
  const groups = groupChildren(kids, by); const noteChild = kids.find(k => k.id === note)
  if (!kids.length) return <div className="cc-ph"><h1 className="pt">{title}</h1><p className="cc-sub">Loading the {groupLabel.toLowerCase()} list…</p></div>
  return <div className="cc-today" ref={scroller}>
    <div className="cc-bar">
      <div className="cc-bar1">
        <button className="cc-title" onClick={() => setInfo(true)} aria-label="Session details"><b>{title}</b><small>{sub} · {s.takenBy ?? teacher}</small></button>
        <span className="cc-syncdot">{sync}</span>{actions}
      </div>
      <div className="cc-bar2">
        <div className="cc-counts" aria-label="Counts"><span className="k-p">P {c.P}</span><span className="k-a">A {c.A}</span><span className="k-l">L {c.L}</span><span className="k-e">E {c.E}</span><span className="k-u" title="Unmarked">· {c.unmarked} left</span></div>
        <button className="cc-pill" onClick={() => { store.dispatch({ t: 'allPresent', sessionId: sid, childIds: kids.map(k => k.id) }); onSay('Unmarked set to Present') }} disabled={!c.unmarked}>✓ All present</button>
      </div>
      <div className="cc-seg" role="tablist">{(['section', 'role', 'az'] as GroupBy[]).map(g => <button key={g} role="tab" aria-selected={by === g} className={by === g ? 'on' : ''} onClick={() => setBy(g)}>{g === 'section' ? groupLabel : g === 'role' ? partLabel : 'A–Z'}</button>)}</div>
      {tip && <div className="cc-tip cc-tip-today" role="note">✨<span>Tap to mark · tap a name for a remark</span><button aria-label="Dismiss tip" onClick={() => { localStorage.setItem('curtaincall/tip-today', 'off'); setTip(false) }}>×</button></div>}
    </div>
    <div className="cc-groups" ref={groupsRef}>{groups.map(g => <section key={g.key} data-group={g.key}>
      <h2 className="cc-ghead">{g.key} <span>{g.children.filter(k => s.entries[k.id]?.mark).length}/{g.children.length}</span></h2>
      <div className="rows">{g.children.map(ch => <ChildRow key={ch.id} child={ch} entry={s.entries[ch.id]}
        onMark={(mark, reason) => store.dispatch({ t: 'mark', sessionId: sid, childId: ch.id, mark, reason })}
        onLeftEarly={v => store.dispatch({ t: 'leftEarly', sessionId: sid, childId: ch.id, value: v })}
        onNote={() => setNote(ch.id)} onHistory={() => onSay('Child history comes in a later stage')} />)}</div>
    </section>)}</div>
    {noteChild && <RemarkSheet child={noteChild} entry={s.entries[noteChild.id]} onClose={() => setNote(null)} onSave={(remark, stars) => store.dispatch({ t: 'note', sessionId: sid, childId: noteChild.id, remark, stars })} />}
    {info && <div className="cc-scrim" onClick={() => setInfo(false)}><div className="cc-sheet" role="dialog" aria-label="Session details" onClick={e => e.stopPropagation()}><div className="cc-grab" />
      <p className="lbl">{title}</p><p className="cc-sub">{s.date} · {s.slot} · {s.venue} · {s.start}–{s.end}</p>
      <label className="cc-f"><span className="cap">Taken by</span><input className="cc-in" aria-label="Taken by" value={s.takenBy ?? ''} placeholder={teacher} onChange={e => store.dispatch({ t: 'takenBy', sessionId: sid, name: e.target.value })} /></label>
      <p className="cc-sub">Present {c.present} of {c.total} · Unmarked {c.unmarked}</p>
      <div className="cc-row"><span /><button className="cc-btn" onClick={() => setInfo(false)}>Done</button></div>
    </div></div>}
  </div>
}
