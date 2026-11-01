// A-02 Q27 = B (Steve, 2026-11-01 t30u): open below; flip ABOVE when there is no room below.
import { CONFIG } from '../config'
export type Side = 'below' | 'above'
export function popupSide(triggerTop: number, triggerBottom: number, popupH: number, viewportH: number, margin = CONFIG.popupMargin): Side {
  const roomBelow = viewportH - triggerBottom - margin
  const roomAbove = triggerTop - margin
  return roomBelow >= popupH || roomBelow >= roomAbove ? 'below' : 'above'
}
