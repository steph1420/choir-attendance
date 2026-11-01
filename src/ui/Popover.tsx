import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { popupSide, type Side } from './placement'
/** Anchored popup right below its trigger; flips above near the screen bottom (A-02 Q27 = B). One tap outside closes. */
export function Popover({ open, onClose, align = 'left', children }: { open: boolean; onClose: () => void; align?: 'left' | 'right' | 'center'; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [side, setSide] = useState<Side>('below')
  useLayoutEffect(() => {
    if (!open || !ref.current) return
    const anchor = ref.current.parentElement!.getBoundingClientRect()
    setSide(popupSide(anchor.top, anchor.bottom, ref.current.offsetHeight, window.innerHeight))
  }, [open, children])
  if (!open) return null
  return (<>
    <div className="pop-catch" onClick={onClose} />
    <div ref={ref} className={`pop pop-${align} pop-${side}`} role="menu" data-side={side}><i className="pop-arrow" />{children}</div>
  </>)
}
