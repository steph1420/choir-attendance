import { useState } from 'react'
import { CONFIG } from '../config'
import type { Child, Entry } from '../data/model'
export function RemarkSheet({ child, entry, onSave, onClose }: { child: Child; entry?: Entry; onSave: (remark: string, stars?: number) => void; onClose: () => void }) {
  const [remark, setRemark] = useState(entry?.remark ?? '')
  const [stars, setStars] = useState(entry?.stars ?? 0)
  return (<>
    <div className="scrim" onClick={onClose} />
    <section className="sheet bottom" role="dialog" aria-label={`Remark for ${child.name}`}>
      <div className="sheet-h"><button onClick={onClose}>Cancel</button><b>{child.name} · {child.section}</b><button onClick={() => { onSave(remark.trim(), stars || undefined); onClose() }}>Save</button></div>
      <p className="lbl pad">Proficiency today</p>
      <div className="stars">{Array.from({ length: CONFIG.stars }, (_, i) => (
        <button key={i} className={`star ${i < stars ? 'on' : ''}`} aria-label={`${i + 1} star`} onClick={() => setStars(stars === i + 1 ? 0 : i + 1)}>★</button>))}</div>
      <p className="lbl pad">Remark</p>
      <textarea className="field" value={remark} onChange={e => setRemark(e.target.value)} placeholder="Works for any mark" rows={4} />
      <p className="cap pad">Saved with this session</p>
    </section>
  </>)
}
