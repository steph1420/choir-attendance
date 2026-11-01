import type { ReactNode } from 'react'
/** Anchored popup directly below its trigger (A-02 round 3). One tap outside closes (LUCID overlays). */
export function Popover({ open, onClose, align = 'left', children }: { open: boolean; onClose: () => void; align?: 'left' | 'right' | 'center'; children: ReactNode }) {
  if (!open) return null
  return (<>
    <div className="pop-catch" onClick={onClose} />
    <div className={`pop pop-${align}`} role="menu"><i className="pop-arrow" />{children}</div>
  </>)
}
