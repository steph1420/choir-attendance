// Driftline overhaul mock (PROPOSED). Placeholder children only. Kit components + --dl-* tokens.
import { useCallback, useState } from 'react'
import { Button, Card, Chip, Dock, Header, HoldToConfirm, ListRow, Segmented, Sheet, StatCard, StatusDot, Toast, Toggle, useHeaderMode, type Tone } from '../driftline/react/src'
import { sampleChildren } from '../data/sample'

type M = 'P' | 'A' | 'L' | 'E' | undefined
const WORD: Record<string, string> = { P: 'Present', A: 'Absent', L: 'Late', E: 'Excused' }
const kids = sampleChildren().slice(0, 14)
const seed: Record<string, M> = { X001: 'P', X002: 'P', X003: 'A', X004: 'P', X005: 'E', X006: 'P', X007: 'P', X008: 'P', X009: 'A' }

export function MockApp({ q }: { q: URLSearchParams }) {
  const screen = q.get('screen') ?? 'today'
  const late = q.get('late') === '1'
  const tone = (m: M): Tone => m === 'P' || m === 'L' ? 'positive' : m === 'A' ? 'danger' : m === 'E' ? 'warning' : 'neutral'
  const mode = useHeaderMode(useCallback(() => window, []))
  const [marks, setMarks] = useState<Record<string, M>>(seed)
  const [toast, setToast] = useState(false)
  const [sheet, setSheet] = useState(q.get('sheet') === '1' || screen === 'remark' || screen === 'long')
  const [step, setStep] = useState(6)
  const [hour, setHour] = useState('H2')
  const counts = { P: 0, A: 0, L: 0, E: 0, none: 0 }
  kids.forEach(k => { const m = marks[k.id]; if (m) counts[m]++; else counts.none++ })
  const set = (id: string, m: M) => { setMarks(s => ({ ...s, [id]: s[id] === m ? undefined : m })); setStep(x => x + 1) }
  const tab = screen === 'members' ? 'members' : screen === 'reports' || screen === 'daily' ? 'reports' : screen === 'settings' ? 'settings' : 'today'
  const titles: Record<string, string> = { today: 'Attendance', remark: 'Attendance', history: 'Child history', members: 'Choir members', reports: 'Reports', daily: 'Daily report', settings: 'Settings' }

  const marking = (
    <Card eyebrow="KG A · 7 children" title="Roll call">
      <div className="dl-list">
        {kids.slice(0, 7).map(k => {
          const m = marks[k.id]
          return (
            <ListRow key={k.id} title={k.name} meta={k.section} onClick={() => set(k.id, m === 'P' ? 'A' : 'P')}
              leading={m ? m : '·'} tone={tone(m)}
              trailing={<>{m ? <Chip tone={tone(m)}>{WORD[m]}{m === 'E' ? ' · Sick' : ''}</Chip> : <Chip>Not marked</Chip>}</>} />)
        })}
      </div>
    </Card>)

  const glance = (
    <Card eyebrow="Today · 2nd hour" title="Who's here?" action={<Chip onClick={() => {}}>{`${step} steps · history`}</Chip>}>
      <div className="m-stats">
        <StatCard tone="positive" label="Present" value={<span className="dl-num">{counts.P + counts.L + counts.E}</span>} note={late ? `${counts.L} late · ${counts.E} excused` : `incl. ${counts.E} excused`} />
        <StatCard tone="danger" label="Absent" value={<span className="dl-num">{counts.A}</span>} note="of 14" />
        <StatCard tone="neutral" label="To mark" value={<span className="dl-num">{counts.none}</span>} note="tap a row" />
      </div>
      <div className="m-progress" aria-label="progress"><i style={{ transform: `scaleX(${(14 - counts.none) / 14})` }} /></div>
    </Card>)

  let body
  if (screen === 'today' || screen === 'remark' || screen === 'long') body = (<>
    <div className="m-hero"><div><p className="m-greet">Monday · 2 Nov · Music room</p><h2 className="dl-title2 m-h">Choir · 2nd hour</h2></div><Chip tone="positive">All synced</Chip></div>
    <div className="m-grid m-today">{glance}{marking}
      <Card eyebrow="Session" title="Teacher-S · Music room"><div className="m-wrap"><Button>Mark all present</Button><Button variant="secondary">Not conducted</Button></div>
        <div style={{ marginTop: 'var(--dl-space-3)' }}><HoldToConfirm label="Hold to clear session" doneLabel="Cleared" onConfirm={() => setMarks({})} /></div></Card></div></>)
  else if (screen === 'members') body = (<>
    <Card eyebrow="In choir · 18" title="Selected"><div className="m-wrap">{kids.slice(0, 6).map(k => <Chip key={k.id} tone="accent">{k.name}</Chip>)}<Chip>+12 more</Chip></div></Card>
    <Card eyebrow="KG A" title="Whole class" action={<Chip>Singer</Chip>}><div className="dl-list">{kids.slice(0, 7).map((k, i) =>
      <ListRow key={k.id} title={k.name} meta={i % 3 === 0 ? 'Action' : 'Singer'} leading={<span className={`m-tick ${i < 5 ? 'on' : ''}`}>{i < 5 ? '✓' : ''}</span>} trailing={i < 5 ? 'In choir' : 'Add'} onClick={() => {}} />)}</div></Card></>)
  else if (screen === 'history') body = (<>
    <div className="m-hero"><div><p className="m-greet">KG A · Singer</p><h2 className="dl-title1 m-h">A-child 03</h2></div><Chip tone="warning">Below 75%</Chip></div>
    <Card eyebrow="This term" title="Attendance"><div className="m-stats"><StatCard tone="positive" label="Attended" value={<span className="dl-num">71%</span>} note="15 of 21" /><StatCard tone="danger" label="Absent" value={<span className="dl-num">6</span>} note="2 this week" /><StatCard tone="accent" label="Stars" value={<span className="dl-num">3.6</span>} note="avg of 9" /></div></Card>
    <Card eyebrow="Recent" title="Sessions & remarks"><div className="dl-list">
      {[['2 Nov · 2nd hour', 'A', ''], ['30 Oct · 1st hour', 'P', '★★★★ Clear diction'], ['28 Oct · 2nd hour', 'P', 'Came from PE'], ['27 Oct · Extra', 'E', 'Sick'], ['23 Oct · 2nd hour', 'P', '★★★']].map(([d, m, r]) =>
        <ListRow key={d} title={d} meta={r || 'No remark'} trailing={<Chip tone={tone(m as M)}>{WORD[m]}</Chip>} />)}</div></Card></>)
  else if (screen === 'reports') body = (<>
    <div className="m-hero"><div><p className="m-greet">Week 45 · 27 Oct – 2 Nov</p><h2 className="dl-title1 m-h">Weekly summary</h2></div></div>
    <Card eyebrow="This week" title="At a glance"><div className="m-stats"><StatCard tone="positive" label="Average" value={<span className="dl-num">86%</span>} note="4 sessions" /><StatCard tone="warning" label="Below 75%" value={<span className="dl-num">3</span>} note="children" /><StatCard tone={'danger'} label="Not conducted" value={<span className="dl-num">1</span>} note="Thu 1st hour" /></div></Card>
    <Card eyebrow="Needs you" title="Low attendance"><div className="dl-list">{[['A-child 03', 71], ['A-child 09', 64], ['A-child 12', 73]].map(([n, p]) =>
      <ListRow key={n as string} title={n as string} meta={`${p}% this term`} trailing={<Chip tone="warning">Below 75%</Chip>} onClick={() => {}} />)}</div></Card>
    <Card eyebrow="Write-up" title="Daily report"><div className="dl-list"><ListRow title="Today · 2nd hour" meta="Draft from template" trailing={<Chip tone="warning">Draft</Chip>} onClick={() => {}} /><ListRow title="Template" meta="Edit the fixed style" trailing="›" onClick={() => {}} /></div></Card></>)
  else if (screen === 'daily') body = (<>
    <Card eyebrow="Today · 2nd hour" title="Daily report" action={<Chip tone="warning">Draft</Chip>}>
      <textarea className="m-field" defaultValue={'Choir, 2nd hour (Mon 2 Nov), Music room.\nPresent 11 of 14. Late: A-child 06. Excused: A-child 05 (Sick).\nWe practised: '} />
      <div className="m-wrap" style={{ marginTop: 'var(--dl-space-3)' }}><Chip onClick={() => {}}>+ pick children</Chip><Chip onClick={() => {}}>{'{present}'}</Chip><Chip onClick={() => {}}>{'{absent}'}</Chip><Chip onClick={() => {}}>{'{date}'}</Chip></div>
      <div className="m-wrap" style={{ marginTop: 'var(--dl-space-4)' }}><Button variant="secondary">Edit template</Button><Button>Copy text</Button></div></Card>
    <p className="m-foot">Auto parts refresh while typed text stays.</p></>)
  else body = (<>
    <Card eyebrow="Look" title="Theme"><div className="dl-list"><ListRow title="Family" trailing="Utopian ›" onClick={() => {}} /><ListRow title="Side" trailing={<Segmented label="Side" value="auto" onChange={() => {}} options={[{ id: 'night', label: 'Night' }, { id: 'day', label: 'Day' }, { id: 'auto', label: 'Auto' }]} />} /></div></Card>
    <Card eyebrow="Rules" title="Attendance"><div className="dl-list"><ListRow title="Low attendance below" trailing="75% ›" onClick={() => {}} /><ListRow title="Excused counts as present" trailing={<Toggle checked onChange={() => {}} label="Excused counts as present" />} /><ListRow title="A–Z strip on left" trailing={<Toggle checked={false} onChange={() => {}} label="A–Z strip on left" />} /></div></Card>
    <Card eyebrow="Feel" title="Haptics"><Segmented label="Haptics" value="normal" onChange={() => {}} options={[{ id: 'off', label: 'Off' }, { id: 'light', label: 'Light' }, { id: 'normal', label: 'Normal' }, { id: 'strong', label: 'Strong' }]} /></Card>
    <Card eyebrow="Developer" title="Developer options"><div className="dl-list"><ListRow title="Late mark" meta="Off: Late hidden in marking and counts" trailing={<Toggle checked={late} onChange={() => {}} label="Late mark" />} /><ListRow title="A–Z strip physics" trailing="›" onClick={() => {}} /></div></Card>
    <Card eyebrow="Sync" title="Google Sheet"><div className="dl-list"><ListRow title="Status" trailing={<StatusDot state="live" label="All synced" />} /><ListRow title="Teacher name" meta="Shown on sessions" trailing="Teacher-S ›" onClick={() => {}} /></div></Card></>)

  return (<>
    <Header mode={mode} brand={<span className="dl-logo">♪</span>} title={titles[screen] ?? 'Attendance'} pillLabel="2nd hour · 11 of 14"
      status={<StatusDot state="live" label="" />} actions={<>{tab === 'today' && <><button className="dl-iconbtn" aria-label={`Undo step ${step}`} onClick={() => setStep(x => Math.max(0, x - 1))}>↶</button><button className="dl-iconbtn" aria-label="Redo" disabled style={{ opacity: 0.45 }}>↷</button></>}<button className="dl-iconbtn" aria-label="Search">⌕</button></>}
      context={tab === 'today' && screen !== 'history' ? <Segmented label="Hour" value={hour} onChange={setHour} options={[{ id: 'H1', label: '1st hour' }, { id: 'H2', label: '2nd hour', mark: true }, { id: 'X', label: 'Extra' }]} /> : undefined} />
    <main className="m-main">{body}</main>
    {tab === 'today' && screen !== 'history' && <nav className="m-az" aria-label="Jump to letter">{'ABCDEFGHIJKLM'.split('').map(c => <span key={c}>{c}</span>)}</nav>}
    <Toast show={toast} message={'Saved'} action="Undo" onAction={() => setToast(false)} />
    <Dock value={tab} onChange={() => {}} tabs={[{ id: 'today', label: 'Today', icon: '◉' }, { id: 'members', label: 'Members', icon: '◎' }, { id: 'reports', label: 'Reports', icon: '▦', badge: 3, badgeTone: 'warning' }, { id: 'settings', label: 'Settings', icon: '⚙︎' }]} />
    {screen === 'long' ? <Sheet open={sheet} onClose={() => setSheet(false)} title="E-child 05"
      footer={<><Button variant="secondary" onClick={() => setSheet(false)}>Not now</Button><Button>Save</Button></>}>
      <p className="m-greet">KG A · 2nd hour · long-press menu</p>
      <Segmented label="Mark" value="E" onChange={() => {}} options={[{ id: 'P', label: 'Present' }, { id: 'A', label: 'Absent' }, { id: 'E', label: 'Excused' }, ...(late ? [{ id: 'L', label: 'Late' }] : [])]} />
      <div className="dl-eyebrow" style={{ marginTop: 'var(--dl-space-4)' }}>Reason</div>
      <div className="m-wrap" style={{ marginTop: 'var(--dl-space-2)' }}>{['Sick', 'On leave', 'School duty', 'Other'].map((r, i) => <Chip key={r} tone="warning" selected={i === 0} onClick={() => {}}>{r}</Chip>)}</div>
      <div className="dl-eyebrow" style={{ marginTop: 'var(--dl-space-4)' }}>Proficiency</div>
      <div className="m-stars" role="radiogroup" aria-label="Proficiency">{[1, 2, 3, 4, 5].map(i => <button key={i} role="radio" aria-checked={i === 4} aria-label={`${i} stars`}>{i <= 4 ? '★' : '☆'}</button>)}</div>
      <textarea className="m-field" aria-label="Remark" defaultValue="Rested today; will rejoin Thursday." />
      <div className="dl-list" style={{ marginTop: 'var(--dl-space-3)' }}><ListRow title="Left early" trailing="›" onClick={() => {}} /><ListRow title="Child history" trailing="›" onClick={() => {}} /></div>
    </Sheet> : <Sheet open={sheet} onClose={() => setSheet(false)} title="A-child 05 · Remark"
      footer={<><Button variant="secondary" onClick={() => setSheet(false)}>Not now</Button><Button>Save remark</Button></>}>
      <p className="m-greet">KG A · 2nd hour · Excused (Sick)</p>
      <div className="m-stars" role="radiogroup" aria-label="Proficiency">{[1, 2, 3, 4, 5].map(i => <button key={i} role="radio" aria-checked={i === 4} aria-label={`${i} stars`}>{i <= 4 ? '★' : '☆'}</button>)}</div>
      <textarea className="m-field" defaultValue="Sang the chorus on pitch." />
    </Sheet>}
  </>)
}
