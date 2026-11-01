// Port of steph1420/sow v0.45.0 src/checklist/az/AzStrip.tsx (scrub, HUD, haptic-free, left/right side).
import { useMemo, useRef, useState } from 'react'
import { AZ_LETTERS, azSlotTopPercent, letterAtY, presentLetters, type AzLetter } from './azLayout'
export function AzStrip({ names, left, onJump }: { names: string[]; left: boolean; onJump: (L: AzLetter) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const present = useMemo(() => presentLetters(names), [names])
  const [hi, setHi] = useState<AzLetter | null>(null)
  const scrub = (y: number) => { const r = ref.current!.getBoundingClientRect(); const L = letterAtY(y, r.top, r.height); setHi(L); onJump(L) }
  const end = () => setTimeout(() => setHi(null), 600)
  return (<>
    {hi && <div className={`az-hud ${left ? 'left' : ''} ${present.has(hi) ? '' : 'dim'}`}>{hi}</div>}
    <div ref={ref} className={`az ${left ? 'left' : ''}`} role="slider" aria-label="A to Z strip" aria-valuemin={1} aria-valuemax={26} aria-valuenow={hi ? AZ_LETTERS.indexOf(hi) + 1 : 1}
      onPointerDown={e => { e.currentTarget.setPointerCapture?.(e.pointerId); scrub(e.clientY) }}
      onPointerMove={e => { if (e.buttons) scrub(e.clientY) }} onPointerUp={end} onPointerCancel={end}>
      {AZ_LETTERS.map((L, i) => <i key={L} className={`${present.has(L) ? '' : 'dim'} ${hi === L ? 'hi' : ''}`} style={{ top: `${azSlotTopPercent(i)}%` }}>{L}</i>)}
    </div>
  </>)
}
