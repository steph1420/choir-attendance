// HoldToConfirm — the standard for destructive actions (LOCKED Steve 2026-11-02 t208u; SP-5).
// Press and hold for HOLD.durationMs: a fill grows (transform scaleX, GPU-only). Release early -> the fill
// springs gently back and nothing happens. Complete -> confirm haptic + onConfirm. Keyboard: hold Space/Enter.
// Haptics follow the user's level (Off/Light/Normal/Strong): 'selection' at start, 'confirm' at completion.
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { HOLD } from '../../tokens/dist/tokens';
import { haptic } from './haptics';
import { spring } from './motion';

export type HoldState = 'idle' | 'holding' | 'done';
export interface HoldToConfirmProps {
  label: string;                // e.g. "Hold to clear session"
  doneLabel?: string;           // e.g. "Cleared"
  onConfirm(): void;
  holdMs?: number;
  tone?: 'danger' | 'accent';
  icon?: ReactNode;
  disabled?: boolean;
  /** Docs/stills only: render a static progress 0..1 (or 'done'). */
  preview?: number | 'done';
}

export function HoldToConfirm({ label, doneLabel = 'Done', onConfirm, holdMs = HOLD.durationMs, tone = 'danger', icon, disabled, preview }: HoldToConfirmProps) {
  const reduce = useReducedMotion();
  const progress = useMotionValue(typeof preview === 'number' ? preview : preview === 'done' ? 1 : 0);
  const [state, setState] = useState<HoldState>(preview === 'done' ? 'done' : typeof preview === 'number' && preview > 0 ? 'holding' : 'idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anim = useRef<{ stop(): void } | null>(null);

  useEffect(() => () => { timer.current && clearTimeout(timer.current); reset.current && clearTimeout(reset.current); anim.current?.stop(); }, []);

  const start = () => {
    if (disabled || state !== 'idle' || preview !== undefined) return;
    setState('holding');
    haptic('selection');
    anim.current?.stop();
    // Fill is time-linear so the finish is predictable; reduced motion: no growing fill, just a quick fade.
    anim.current = reduce ? animate(progress, 1, { duration: 0.12 }) : animate(progress, 1, { duration: holdMs / 1000, ease: 'linear' });
    timer.current = setTimeout(() => {
      timer.current = null;
      setState('done');
      haptic('confirm');
      onConfirm();
      reset.current = setTimeout(() => { setState('idle'); anim.current = animate(progress, 0, reduce ? { duration: 0.12 } : spring.gentle); }, 1600);
    }, holdMs);
  };
  const cancel = () => {
    if (state !== 'holding' || !timer.current) return;
    clearTimeout(timer.current); timer.current = null;
    setState('idle');
    anim.current?.stop();
    anim.current = animate(progress, 0, reduce ? { duration: 0.12 } : spring.gentle); // gentle return, no haptic
  };

  // Filled layer is a full copy of the label clipped to the progress (paint-only, no layout): text stays
  // readable on both sides of the fill edge.
  const clip = useTransform(progress, (p) => `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0 round var(--dl-radius-md))`);
  const secs = (holdMs / 1000).toFixed(1).replace(/\.0$/, '');
  const text = state === 'done' ? `✓ ${doneLabel}` : state === 'holding' ? 'Keep holding…' : label;
  return (
    <button
      type="button"
      className={`dl-hold dl-tone--${tone}`}
      data-state={state}
      disabled={disabled}
      aria-label={state === 'done' ? doneLabel : `${label}. Press and hold for ${secs} seconds`}
      aria-live="polite"
      onPointerDown={(e) => { if (!(e.button > 0)) { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); start(); } }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
      onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } }}
      onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); cancel(); } }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="dl-hold__label">{icon && <span aria-hidden>{icon}</span>}{text}</span>
      <motion.span className="dl-hold__fill" style={{ clipPath: clip }} aria-hidden>
        <span className="dl-hold__label">{icon && <span>{icon}</span>}{text}</span>
      </motion.span>
    </button>
  );
}
