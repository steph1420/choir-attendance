import { useState } from 'react'
import { CONFIG } from '../config'
import type { Child, Entry, Mark } from '../data/model'
import { Popover } from './Popover'
type Props = { child: Child; entry?: Entry; onMark: (m: Mark | null, reason?: string) => void; onLeftEarly: (v: boolean) => void; onNote: () => void; onHistory: () => void }
export function ChildRow({ child, entry, onMark, onLeftEarly, onNote, onHistory }: Props) {
  const [menu, setMenu] = useState<null | 'le' | 'more'>(null)
  const [excOpen, setExcOpen] = useState(false)
  const m = entry?.mark
  const le = m === 'L' || m === 'E' ? m : null
  const hasNote = !!(entry?.remark || entry?.stars)
  const close = () => { setMenu(null); setExcOpen(false) }
  return (
    <div className="row" data-child={child.id}>
      {/* A-02 decided: tap the name to open remark + stars */}
      <button className="row-name" onClick={onNote} aria-label={`Remark for ${child.name}`}>
        <span className="nm">{child.name}{hasNote && <i className="ndot" aria-label="has remark" />}</span>
        <span className="mt">{child.section}{child.role !== 'Singer' ? ` · ${child.role}` : ''}{entry?.leftEarly ? ' · left early' : ''}{m === 'E' && entry?.reason ? ` · ${entry.reason}` : ''}</span>
      </button>
      <div className="marks">
        <button className={`mk ${m === 'P' ? 'P' : ''}`} aria-pressed={m === 'P'} onClick={() => onMark(m === 'P' ? null : 'P')}>P</button>
        <button className={`mk ${m === 'A' ? 'A' : ''}`} aria-pressed={m === 'A'} onClick={() => onMark(m === 'A' ? null : 'A')}>A</button>
        <span className="anchor">
          <button className={`mk wide ${le ?? ''} ${menu === 'le' ? 'open' : ''}`} onClick={() => setMenu(menu === 'le' ? null : 'le')} aria-haspopup="menu">{le ?? 'L/E'}</button>
          <Popover open={menu === 'le'} onClose={close} align="center">
            <button className={`mk item L ${m === 'L' ? 'sel' : ''}`} onClick={() => { onMark('L'); close() }}>Late</button>
            <button className={`mk item E ${m === 'E' || excOpen ? 'sel' : ''}`} onClick={() => { onMark('E'); setExcOpen(true) }}>Excused {excOpen ? '▾' : '›'}</button>
            {excOpen && <>
              <span className="cap">Reason · optional</span>
              {CONFIG.excusedReasons.map(r => <button key={r} className={`mk item sub E ${entry?.reason === r ? 'sel' : ''}`} onClick={() => { onMark('E', r); close() }}>{r}</button>)}
            </>}
          </Popover>
        </span>
        <span className="anchor">
          <button className={`mk dots ${menu === 'more' ? 'open' : ''}`} onClick={() => setMenu(menu === 'more' ? null : 'more')} aria-label="More" aria-haspopup="menu">⋯</button>
          <Popover open={menu === 'more'} onClose={close} align="right">
            <button className="mk item L" onClick={() => { onLeftEarly(!entry?.leftEarly); close() }}>{entry?.leftEarly ? '✓ ' : ''}Left early</button>
            <button className="mk item" onClick={() => { onNote(); close() }}>Add remark / stars</button>
            <button className="mk item" onClick={() => { onHistory(); close() }}>Child history</button>
            <button className="mk item muted" onClick={() => { onMark(null); close() }}>Clear mark</button>
          </Popover>
        </span>
      </div>
    </div>
  )
}
