import { useState } from 'react'
import { TEMPLATES, makeEvent, type EventSetup, type TemplateId } from './templates'
export function TemplatePicker({ onDone }: { onDone: (e: EventSetup) => void }) {
  const [pick, setPick] = useState<TemplateId>('choir'); const [name, setName] = useState('')
  return (
    <div className="cc-first"><div className="cc-card">
      <p className="lbl">Welcome to CurtainCall</p><h1 className="pt">What are you organising?</h1>
      <input className="cc-in" aria-label="Event name" placeholder="Event name, e.g. Annual Day" value={name} onChange={e => setName(e.target.value)} />
      <div className="cc-grid">{TEMPLATES.map(t => <button key={t.id} aria-pressed={pick === t.id} className={pick === t.id ? 'on' : ''} onClick={() => setPick(t.id)}><b>{t.icon}</b>{t.name}<small>{t.labels.members} · {t.labels.group}</small></button>)}</div>
      <p className="cap">You can rename every label later in ⚙ Settings.</p>
      <button className="cc-btn wide" onClick={() => onDone(makeEvent(pick, name))}>Start</button>
    </div></div>)
}
