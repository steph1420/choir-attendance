import { useState } from 'react'
export function PasscodeScreen({ wrong, onSave, onLocal }: { wrong: boolean; onSave: (p: string) => void; onLocal: () => void }) {
  const [p, setP] = useState('')
  return <div className="cc-first"><form className="cc-card" onSubmit={e => { e.preventDefault(); if (p.trim()) onSave(p) }}>
    <p className="lbl">CurtainCall</p><h1 className="pt">Team passcode</h1>
    <p className="cc-sub">{wrong ? 'That passcode didn\u2019t work. Please check it with your coordinator and try again.' : 'Enter the passcode your coordinator shared. You only need to do this once on this device.'}</p>
    <input className="cc-in" type="password" autoComplete="current-password" aria-label="Team passcode" autoFocus value={p} onChange={e => setP(e.target.value)} placeholder="Passcode" />
    <button className="cc-btn wide" type="submit" disabled={!p.trim()}>Continue</button>
    <button className="cc-link" type="button" onClick={onLocal}>Use on this device only for now</button>
  </form></div>
}
