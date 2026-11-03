import { useState, useSyncExternalStore } from 'react'
import type { QuickNotes } from './quicknotes'
export function QuickNoteSheet({ qn, screen, by, onClose }: { qn: QuickNotes; screen: string; by?: string; onClose: () => void }) {
  useSyncExternalStore(qn.subscribe.bind(qn), () => qn.state)
  const [text, setText] = useState('')
  const list = qn.forScreen(screen)
  const save = () => { if (qn.add(screen, text, by)) setText('') }
  return (
    <div className="cc-scrim" onClick={onClose}>
      <div className="cc-sheet" role="dialog" aria-label="Quick note" onClick={e => e.stopPropagation()}>
        <div className="cc-grab" />
        <p className="lbl">Quick note · {screen}</p>
        <textarea aria-label="Note text" autoFocus value={text} onChange={e => setText(e.target.value)} placeholder="Jot it down…" rows={4} />
        <div className="cc-row"><span className="cap">Saved here · timestamped · syncs when online</span><button className="cc-btn" onClick={save} disabled={!text.trim()}>Save</button></div>
        {list.length > 0 && <ul className="cc-notes">{list.map(n => <li key={n.id}><time>{new Date(n.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</time>{n.text}</li>)}</ul>}
      </div>
    </div>)
}
