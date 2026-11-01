// Pure FULL <-> PILL state machine (fixes BUG-29/35 jitter): hysteresis, jump filter, lock window.
import { HEADER } from '../../tokens/dist/tokens';
export type HeaderMode = 'FULL' | 'PILL';
export interface HeaderState { mode: HeaderMode; lastY: number; lockedUntil: number }
export const initialHeader = (): HeaderState => ({ mode: 'FULL', lastY: 0, lockedUntil: 0 });

export function nextHeader(s: HeaderState, y: number, now: number, cfg = HEADER): HeaderState {
  const dy = y - s.lastY;
  const base = { ...s, lastY: y };
  if (y <= cfg.topZone) return s.mode === 'FULL' ? base : { mode: 'FULL', lastY: y, lockedUntil: now + cfg.lockMs };
  if (now < s.lockedUntil) return base;
  // Distance accumulates from the anchor (lastY) until it passes ignoreJump, so slow scrolls still
  // switch, while toolbar wobble (< ignoreJump px) never does. Anchor is NOT moved for small deltas.
  if (Math.abs(dy) < cfg.ignoreJump) return s;
  if (dy > 0 && y > cfg.enterPillAfter && s.mode === 'FULL') return { mode: 'PILL', lastY: y, lockedUntil: now + cfg.lockMs };
  if (dy < 0 && s.mode === 'PILL') return { mode: 'FULL', lastY: y, lockedUntil: now + cfg.lockMs };
  return base;
}
