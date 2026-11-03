import { useState, useSyncExternalStore, type ReactNode } from 'react'
import type { Child } from '../data/model'
import type { Collection } from './collection'
import type { Costume } from './kinds'
import { CAPS, ROLES, TEACHERS, can, setCap, type CareFlag, type Prefs } from './access'
import { TEMPLATES, activeEvent, makeEvent, type Events, type Labels, type TemplateId } from './templates'
import { Head } from './screens'
const use = <T extends { id: string }>(c: Collection<T>) => { useSyncExternalStore(c.subscribe, c.snap); return c.items }
export function MembersScreen({ kids, care, costumes, prefs, labels, ur }: { ur?: ReactNode; kids: Child[]; care: Collection<CareFlag>; costumes: Collection<Costume>; prefs: Prefs; labels: Labels }) {
  const flags = use(care), cos = use(costumes); const [q, setQ] = useState(''); const [open, setOpen] = useState<string | null>(null); const [draft, setDraft] = useState('')
  const view = can(prefs.caps, prefs.role, 'view.careFlags'), edit = can(prefs.caps, prefs.role, 'edit.careFlags')
  const list = kids.filter(k => k.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name))
  const sel = kids.find(k => k.id === open); const flag = flags.find(f => f.id === open)
  return <div className="cc-page">
    <Head title={labels.members} sub={`${kids.length} ${labels.members.toLowerCase()} · ⚕ = care flag${view ? '' : ' (details hidden)'}`} right={ur} />
    <input className="cc-in cc-search" aria-label="Search members" placeholder="🔍 Search" value={q} onChange={e => setQ(e.target.value)} />
    <div className="cc-list">{list.map(k => { const f = flags.find(x => x.id === k.id), c = cos.find(x => x.memberId === k.id)
      return <button key={k.id} className="cc-item" onClick={() => { setOpen(k.id); setDraft(f?.note ?? '') }}>
        <span className="cc-av">{k.name.slice(0, 1)}{k.id.slice(-2)}</span>
        <span className="cc-t"><b>{k.name} {f && <span className="care" aria-label="care flag" title="care flag">⚕</span>}</b><small>{k.section} · {k.role}{c ? ` · 👗 ${c.status}` : ''}</small></span></button> })}</div>
    {sel && <div className="cc-scrim" onClick={() => setOpen(null)}><div className="cc-sheet" role="dialog" aria-label={sel.name} onClick={e => e.stopPropagation()}><div className="cc-grab" />
      <p className="lbl">{sel.name} · {sel.section}</p>
      <p className="cc-sub">⚕ Care flag: {!flag ? 'none' : view ? flag.note || '(no details)' : 'set — details visible to permitted roles only'}</p>
      {edit && <><textarea aria-label="Care note" rows={2} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Care note (only permitted roles see this)" />
        <div className="cc-row">{flag ? <button className="cc-link" onClick={() => { care.remove(sel.id); setOpen(null) }}>Remove flag</button> : <span />}<button className="cc-btn" onClick={() => { care.upsert({ id: sel.id, note: draft.trim() }); setOpen(null) }}>Save flag</button></div></>}
    </div></div>}
  </div>
}
export function SettingsScreen({ evs, setEvs, prefs, setPrefs, endpoint, setEndpoint }: { endpoint: string; setEndpoint: (u: string) => void; evs: Events; setEvs: (e: Events) => void; prefs: Prefs; setPrefs: (p: Prefs) => void }) {
  const ev = activeEvent(evs); const [nt, setNt] = useState<TemplateId>('play'); const [nn, setNn] = useState(''); const [err, setErr] = useState('')
  const admin = can(prefs.caps, prefs.role, 'admin.permissions'); const [url, setUrl] = useState(localStorage.getItem('choir-attendance/endpoint') ?? '')
  const urlOk = url === '' || url.trim() === 'off' || /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url.trim())
  return <div className="cc-page">
    <Head title="Settings" sub={`${ev.name} · ${TEMPLATES.find(t => t.id === ev.template)?.name}`} />
    <section className="cc-card2"><p className="lbl">You</p>
      <label className="cc-f"><span className="cap">Teacher name</span><select className="cc-in" aria-label="Teacher name" value={prefs.teacher} onChange={e => setPrefs({ ...prefs, teacher: e.target.value })}>{TEACHERS.map(t => <option key={t}>{t}</option>)}</select></label>
      <label className="cc-f"><span className="cap">Role (sample; login-based later)</span><select className="cc-in" aria-label="Role" value={prefs.role} onChange={e => setPrefs({ ...prefs, role: e.target.value as Prefs['role'] })}>{ROLES.map(t => <option key={t}>{t}</option>)}</select></label></section>
    <section className="cc-card2"><p className="lbl">Event</p>
      <label className="cc-f"><span className="cap">Current event</span><select className="cc-in" aria-label="Current event" value={evs.active} onChange={e => setEvs({ ...evs, active: e.target.value })}>{evs.list.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
      <div className="cc-row"><input className="cc-in" aria-label="New event name" placeholder="New event name" value={nn} onChange={e => setNn(e.target.value)} />
        <select className="cc-in" aria-label="New event template" value={nt} onChange={e => setNt(e.target.value as TemplateId)}>{TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <button className="cc-btn" onClick={() => { const list = evs.list; const id = `e${list.length + 1}-${Date.now().toString(36)}`; setEvs({ active: id, list: [...list, { ...makeEvent(nt, nn), id }] }); setNn('') }}>Create</button></div></section>
    <section className="cc-card2"><p className="lbl">Backend (sync)</p>
      <label className="cc-f"><span className="cap">Web app URL (empty = default backend; type off = this device only)</span><input className="cc-in" aria-label="Backend URL" placeholder="https://script.google.com/macros/s/…/exec" value={url} onChange={e => setUrl(e.target.value)} /></label>
      {!urlOk && <p className="cc-sub">That doesn't look like an Apps Script web app link (it should end in /exec).</p>}
      <div className="cc-row"><span className="cap">Now: {endpoint ? endpoint.replace(/\/s\/(.{6}).*\/exec/, '/s/$1…/exec') : 'this device only'}</span><button className="cc-btn" disabled={!urlOk || url.trim() === (localStorage.getItem('choir-attendance/endpoint') ?? '')} onClick={() => setEndpoint(url.trim())}>Save & reconnect</button></div></section>
    <section className="cc-card2"><p className="lbl">Labels for {ev.name}</p>
      <div className="cc-grid2">{(Object.keys(ev.labels) as (keyof Labels)[]).map(k => <label key={k} className="cc-f"><span className="cap">{k}</span>
        <input className="cc-in" aria-label={`Label ${k}`} value={ev.labels[k]} onChange={e => setEvs({ ...evs, list: evs.list.map(x => x.id === ev.id ? { ...x, labels: { ...x.labels, [k]: e.target.value } } : x) })} /></label>)}</div></section>
    <section className="cc-card2"><p className="lbl">Who can see and edit care flags</p>
      {!admin && <p className="cc-sub">Only coordinators and admins can change this.</p>}
      <table className="cc-perm"><thead><tr><th />{CAPS.map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{ROLES.map(r => <tr key={r}><td>{r}</td>{CAPS.map(c => <td key={c}>
        <input type="checkbox" aria-label={`${r} ${c}`} disabled={!admin} checked={can(prefs.caps, r, c)} onChange={e => { try { setPrefs({ ...prefs, caps: setCap(prefs.caps, prefs.role, r, c, e.target.checked) }) } catch (x) { setErr(String(x)) } }} /></td>)}</tr>)}</tbody></table>
      <div className="cc-permcards">{ROLES.map(r => <div key={r}><b>{r}</b>{CAPS.map(c => <label key={c}><span>{c === 'view.careFlags' ? 'See care details' : c === 'edit.careFlags' ? 'Edit care flags' : 'Change permissions'}</span>
        <input type="checkbox" aria-label={`${r} ${c} (card)`} disabled={!admin} checked={can(prefs.caps, r, c)} onChange={e => { try { setPrefs({ ...prefs, caps: setCap(prefs.caps, prefs.role, r, c, e.target.checked) }) } catch (x) { setErr(String(x)) } }} /></label>)}</div>)}</div>
      {err && <p className="cc-sub">{err}</p>}</section>
  </div>
}
