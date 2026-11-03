import { useState, useSyncExternalStore, type ReactNode } from 'react'
import type { Collection } from './collection'
import { COSTUME_STATUS, PROP_HOW, PROP_STATUS, costumeFilters, parseTags, propFilters, searchNotes, sizeTally, type Costume, type Note, type Prop } from './kinds'
const use = <T extends { id: string }>(c: Collection<T>) => { useSyncExternalStore(c.subscribe, c.snap); return c.items }
export function Head({ title, sub, right }: { title: string; sub: string; right?: ReactNode }) {
  return <header className="cc-head"><div style={{ flex: 1 }}><h1>{title}</h1><p className="cc-sub">{sub}</p></div>{right}</header>
}
function Chips<K extends string>({ keys, on, set, count }: { keys: K[]; on: K; set: (k: K) => void; count?: (k: K) => number }) {
  return <div className="cc-chips" role="tablist">{keys.map(k => <button key={k} role="tab" aria-selected={on === k} className={on === k ? 'on' : ''} onClick={() => set(k)}>{k}{count && <span> {count(k)}</span>}</button>)}</div>
}
function Sheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="cc-scrim" onClick={onClose}><div className="cc-sheet" role="dialog" aria-label={title} onClick={e => e.stopPropagation()}><div className="cc-grab" /><p className="lbl">{title}</p>{children}</div></div>
}
const F = ({ l, children }: { l: string; children: ReactNode }) => <label className="cc-f"><span className="cap">{l}</span>{children}</label>
const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-')
export function CostumesScreen({ col, ev, members = [] }: { col: Collection<Costume>; ev: string; members?: { id: string; name: string }[] }) {
  const all = use(col); const [f, setF] = useState<keyof typeof costumeFilters>('All'); const [ed, setEd] = useState<Costume | null>(null)
  const list = all.filter(costumeFilters[f]); const t = sizeTally(all)
  return <div className="cc-page">
    <Head title="Costumes" sub={`${ev} · Tailor-D`} right={<button className="cc-btn" onClick={() => setEd({ id: col.newId(), memberId: '', who: '', item: '', size: 'M', status: 'Not measured' })}>+ Add</button>} />
    <Chips keys={Object.keys(costumeFilters) as (keyof typeof costumeFilters)[]} on={f} set={setF} count={k => all.filter(costumeFilters[k]).length} />
    <div className="cc-banner">Tailor-D order: {Object.entries(t).map(([s, n]) => `${s} ${n}`).join(' · ')}</div>
    <div className="cc-list">{list.map(c => <button key={c.id} className="cc-item" onClick={() => setEd(c)}>
      <span className="cc-av">{c.size}</span><span className="cc-t"><b>{c.who}</b><small>{c.item} · size {c.size}</small></span><span className={`cc-st s-${slug(c.status)}`}>{c.status}</span></button>)}</div>
    {ed && <Sheet title={all.some(x => x.id === ed.id) ? 'Edit costume' : 'Add costume'} onClose={() => setEd(null)}>
      <F l="Member">{members.length ? <select className="cc-in" aria-label="Member" value={ed.memberId} onChange={e => setEd({ ...ed, memberId: e.target.value, who: members.find(m => m.id === e.target.value)?.name ?? '' })}><option value="">Choose…</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        : <input className="cc-in" value={ed.who} onChange={e => setEd({ ...ed, who: e.target.value })} />}</F>
      <F l="Costume"><input className="cc-in" value={ed.item} onChange={e => setEd({ ...ed, item: e.target.value })} /></F>
      <F l="Size"><input className="cc-in" value={ed.size} onChange={e => setEd({ ...ed, size: e.target.value.toUpperCase() })} /></F>
      <F l="Status"><select className="cc-in" value={ed.status} onChange={e => setEd({ ...ed, status: e.target.value as Costume['status'] })}>{COSTUME_STATUS.map(s => <option key={s}>{s}</option>)}</select></F>
      <div className="cc-row">{all.some(x => x.id === ed.id) ? <button className="cc-link" onClick={() => { col.remove(ed.id); setEd(null) }}>Delete</button> : <span />}<button className="cc-btn" disabled={!ed.who.trim()} onClick={() => { col.upsert(ed); setEd(null) }}>Save</button></div>
    </Sheet>}
  </div>
}
export function PropsScreen({ col, ev }: { col: Collection<Prop>; ev: string }) {
  const all = use(col); const [f, setF] = useState<keyof typeof propFilters>('All'); const [ed, setEd] = useState<Prop | null>(null); const [msg, setMsg] = useState('')
  const list = all.filter(p => propFilters[f](p)); const pending = all.filter(p => p.parents && (p.status === 'Not sent' || p.status === 'Asked'))
  const remind = () => { const t = `Dear parents, a gentle reminder for ${ev}:\n` + pending.map(p => `• ${p.how} ${p.name}${p.qty > 1 ? ' ×' + p.qty : ''}${p.due ? ' by ' + p.due : ''}`).join('\n'); void navigator.clipboard?.writeText(t).catch(() => {}); setMsg('Reminder copied'); setTimeout(() => setMsg(''), 2500) }
  return <div className="cc-page">
    <Head title="Props" sub={`${ev} · ${all.length} items`} right={<button className="cc-btn" onClick={() => setEd({ id: col.newId(), name: '', qty: 1, how: 'Make', owner: '', parents: false, status: 'Not sent' })}>+ Add</button>} />
    <Chips keys={Object.keys(propFilters) as (keyof typeof propFilters)[]} on={f} set={setF} />
    <div className="cc-list">{list.map(p => <button key={p.id} className="cc-item" onClick={() => setEd(p)}>
      <span className="cc-t"><b>{p.name}{p.qty > 1 ? ` ×${p.qty}` : ''}</b><small>{p.how} · {p.owner}</small></span>
      <span className={`cc-st s-${slug(p.status)}`}>{p.due && p.status !== 'Ready' && p.status !== 'Received' ? `Due ${p.due.slice(5)}` : p.status}</span></button>)}</div>
    {pending.length > 0 && <button className="cc-banner act" onClick={remind}>💬 Copy WhatsApp reminder for {pending.length} parents</button>}
    {msg && <div className="toast" role="status">{msg}</div>}
    {ed && <Sheet title={all.some(x => x.id === ed.id) ? 'Edit prop' : 'Add prop'} onClose={() => setEd(null)}>
      <F l="Item"><input className="cc-in" value={ed.name} onChange={e => setEd({ ...ed, name: e.target.value })} /></F>
      <div className="cc-row"><F l="Qty"><input className="cc-in" type="number" min={1} value={ed.qty} onChange={e => setEd({ ...ed, qty: Math.max(1, +e.target.value) })} /></F>
        <F l="How"><select className="cc-in" value={ed.how} onChange={e => setEd({ ...ed, how: e.target.value as Prop['how'] })}>{PROP_HOW.map(s => <option key={s}>{s}</option>)}</select></F></div>
      <F l="Who"><input className="cc-in" value={ed.owner} onChange={e => setEd({ ...ed, owner: e.target.value })} /></F>
      <div className="cc-row"><F l="Due"><input className="cc-in" type="date" value={ed.due ?? ''} onChange={e => setEd({ ...ed, due: e.target.value || undefined })} /></F>
        <F l="Status"><select className="cc-in" value={ed.status} onChange={e => setEd({ ...ed, status: e.target.value as Prop['status'] })}>{PROP_STATUS.map(s => <option key={s}>{s}</option>)}</select></F></div>
      <label className="cc-check"><input type="checkbox" checked={ed.parents} onChange={e => setEd({ ...ed, parents: e.target.checked })} /> Parents asked to make or bring</label>
      <div className="cc-row">{all.some(x => x.id === ed.id) ? <button className="cc-link" onClick={() => { col.remove(ed.id); setEd(null) }}>Delete</button> : <span />}<button className="cc-btn" disabled={!ed.name.trim()} onClick={() => { col.upsert(ed); setEd(null) }}>Save</button></div>
    </Sheet>}
  </div>
}
export function NotesScreen({ col, quick, ur }: { ur?: ReactNode; col: Collection<Note>; quick: { id: string; screen: string; text: string; at: string }[] }) {
  const all = use(col); const [q, setQ] = useState(''); const [tag, setTag] = useState('All'); const [ed, setEd] = useState<Note | null>(null)
  const tags = ['All', 'Quick notes', ...new Set(all.flatMap(n => n.tags).map(t => '#' + t))]
  const merged: Note[] = [...all, ...quick.map(n => ({ id: 'q-' + n.id, title: n.screen, text: n.text, tags: ['quick'], at: n.at, screen: n.screen }))]
  const list = searchNotes(merged, q, tag === 'All' ? undefined : tag === 'Quick notes' ? 'quick' : tag.slice(1))
  const blank = (cl: boolean): Note => ({ id: col.newId(), title: '', text: '', items: cl ? [{ t: '', done: false }] : undefined, tags: [], at: new Date().toISOString() })
  return <div className="cc-page">
    <Head title="Notes" sub={`${merged.length} notes · pinned first`} right={<>{ur}<button className="cc-btn" onClick={() => setEd(blank(false))}>+ Note</button><button className="cc-btn ghost" aria-label="New checklist" onClick={() => setEd(blank(true))}>☑</button></>} />
    <input className="cc-in cc-search" aria-label="Search notes" placeholder="🔍 Search notes" value={q} onChange={e => setQ(e.target.value)} />
    <Chips keys={tags} on={tag} set={setTag} />
    <div className="cc-masonry">{list.map(n => <button key={n.id} className={`cc-note ${n.pinned ? 'pin' : ''}`} onClick={() => !n.id.startsWith('q-') && setEd(n)}>
      {n.screen && <small className="cc-from">↪ {n.screen} · {new Date(n.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</small>}
      {n.title && !n.id.startsWith('q-') && <b>{n.pinned ? '📌 ' : ''}{n.items ? '☑ ' : ''}{n.title}</b>}
      {n.text && <p>{n.text}</p>}
      {n.items?.map((it, i) => <span key={i} className={it.done ? 'done' : ''} onClick={e => { e.stopPropagation(); col.patch(n.id, { items: n.items!.map((x, j) => j === i ? { ...x, done: !x.done } : x) }) }}>{it.done ? '☑' : '☐'} {it.t}</span>)}
      {n.tags.filter(t => t !== 'quick').length > 0 && <small className="cc-tags">{n.tags.map(t => '#' + t).join(' ')}</small>}
    </button>)}</div>
    {ed && <Sheet title={all.some(x => x.id === ed.id) ? 'Edit note' : 'New note'} onClose={() => setEd(null)}>
      <input className="cc-in" aria-label="Title" placeholder="Title" value={ed.title} onChange={e => setEd({ ...ed, title: e.target.value })} />
      {ed.items ? <>{ed.items.map((it, i) => <div className="cc-row" key={i}><input type="checkbox" checked={it.done} onChange={() => setEd({ ...ed, items: ed.items!.map((x, j) => j === i ? { ...x, done: !x.done } : x) })} /><input className="cc-in" aria-label={`Item ${i + 1}`} value={it.t} onChange={e => setEd({ ...ed, items: ed.items!.map((x, j) => j === i ? { ...x, t: e.target.value } : x) })} /></div>)}
        <button className="cc-link" onClick={() => setEd({ ...ed, items: [...ed.items!, { t: '', done: false }] })}>+ Item</button></>
        : <textarea aria-label="Note body" rows={4} value={ed.text} onChange={e => setEd({ ...ed, text: e.target.value })} placeholder="Note" />}
      <input className="cc-in" aria-label="Tags" placeholder="#tags" defaultValue={ed.tags.map(t => '#' + t).join(' ')} onChange={e => setEd({ ...ed, tags: parseTags(e.target.value) })} />
      <div className="cc-row"><label className="cc-check"><input type="checkbox" checked={!!ed.pinned} onChange={e => setEd({ ...ed, pinned: e.target.checked })} /> Pin</label>
        <button className="cc-link" onClick={() => setEd(ed.items ? { ...ed, text: ed.items.map(i => i.t).join('\n'), items: undefined } : { ...ed, items: ed.text.split('\n').filter(Boolean).map(t => ({ t, done: false })), text: '' })}>{ed.items ? 'To text' : 'To checklist'}</button>
        {all.some(x => x.id === ed.id) && <button className="cc-link" onClick={() => { col.remove(ed.id); setEd(null) }}>Delete</button>}
        <button className="cc-btn" onClick={() => { col.upsert({ ...ed, items: ed.items?.filter(i => i.t.trim()), at: new Date().toISOString() }); setEd(null) }}>Save</button></div>
    </Sheet>}
  </div>
}
