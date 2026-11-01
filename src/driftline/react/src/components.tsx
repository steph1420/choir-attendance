// Driftline Kit components. Styling lives in driftline.css (tokens only). Motion = framer-motion springs on
// transform/opacity only. Every interactive element has a >= --dl-hit-min hit area and an accessible name.
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { haptic } from './haptics';
import { pick, variants } from './motion';
import { initialHeader, nextHeader, type HeaderMode } from './headerMode';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');
export type Tone = 'neutral' | 'accent' | 'positive' | 'warning' | 'danger' | 'special';

/* ---------- Button ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet' | 'danger'; size?: 'md' | 'lg'; icon?: ReactNode };
export function Button({ variant = 'primary', size = 'md', icon, className, children, onClick, ...rest }: BtnProps) {
  return (
    <button {...rest} className={cx('dl-btn', `dl-btn--${variant}`, size === 'lg' && 'dl-btn--lg', className)}
      onClick={(e) => { haptic('tap'); onClick?.(e); }}>
      {icon && <span className="dl-btn__icon" aria-hidden>{icon}</span>}{children}
    </button>
  );
}

/* ---------- Segmented pills (sliding highlight) ---------- */
export function Segmented<T extends string>({ options, value, onChange, label, layoutId }: { options: { id: T; label: string; mark?: boolean }[]; value: T; onChange(v: T): void; label: string; layoutId?: string }) {
  const reduce = useReducedMotion(); const uid = useId();
  return (
    <div role="radiogroup" aria-label={label} className="dl-seg">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={o.id} role="radio" aria-checked={on} className={cx('dl-seg__item', on && 'is-on')}
            onClick={() => { if (!on) { haptic('selection'); onChange(o.id); } }}>
            {on && <motion.span layoutId={layoutId ?? `seg-${uid}`} className="dl-seg__pill" transition={pick('snappy', reduce)} />}
            <span className="dl-seg__label">{o.label}</span>
            {o.mark && <span className="dl-seg__mark" aria-label="today" />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Card ---------- */
export function Card({ title, eyebrow, tone = 'neutral', action, children, glass = true }: { title?: string; eyebrow?: string; tone?: Tone; action?: ReactNode; children?: ReactNode; glass?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.section className={cx('dl-card', `dl-tone--${tone}`, glass && 'dl-card--glass')} initial="hidden" animate="shown" variants={variants.fadeUp} transition={pick('gentle', reduce)}>
      {(title || eyebrow || action) && (
        <header className="dl-card__head">
          <div>{eyebrow && <div className="dl-eyebrow">{eyebrow}</div>}{title && <h3 className="dl-card__title">{title}</h3>}</div>
          {action}
        </header>
      )}
      {children}
    </motion.section>
  );
}

/** Big glanceable number card: the "one number that matters" pattern. */
export function StatCard({ label, value, note, tone }: { label: string; value: ReactNode; note?: string; tone: Tone }) {
  return (
    <div className={cx('dl-stat', `dl-tone--${tone}`)}>
      <div className="dl-stat__label">{label}</div>
      <div className="dl-stat__value">{value}</div>
      {note && <div className="dl-stat__note">{note}</div>}
    </div>
  );
}

/* ---------- Chip ---------- */
export function Chip({ tone = 'neutral', children, onClick, selected }: { tone?: Tone; children: ReactNode; onClick?: () => void; selected?: boolean }) {
  const cls = cx('dl-chip', `dl-tone--${tone}`, selected && 'is-on', onClick && 'dl-chip--btn');
  if (!onClick) return <span className={cls}>{children}</span>;
  return <button className={cls} aria-pressed={!!selected} onClick={() => { haptic('selection'); onClick(); }}>{children}</button>;
}

/* ---------- Status dot (static, never pulses) ---------- */
export function StatusDot({ state, label }: { state: 'live' | 'connecting' | 'offline' | 'error'; label?: string }) {
  const name = label ?? { live: 'Live', connecting: 'Connecting', offline: 'Offline', error: 'Problem' }[state];
  return <span className={cx('dl-dot', `dl-dot--${state}`)} role="status" aria-label={name}><i aria-hidden />{label !== undefined && <span>{label}</span>}</span>;
}

/* ---------- Toggle ---------- */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange(v: boolean): void; label: string }) {
  const reduce = useReducedMotion();
  return (
    <button role="switch" aria-checked={checked} aria-label={label} className={cx('dl-toggle', checked && 'is-on')}
      onClick={() => { haptic('tap'); onChange(!checked); }}>
      <motion.span className="dl-toggle__knob" animate={{ x: checked ? 20 : 0 }} transition={pick('snappy', reduce)} />
    </button>
  );
}

/* ---------- List row ---------- */
export function ListRow({ title, meta, leading, trailing, onClick, tone }: { title: string; meta?: string; leading?: ReactNode; trailing?: ReactNode; onClick?: () => void; tone?: Tone }) {
  const body = (<>
    {leading && <span className={cx('dl-row__lead', tone && `dl-tone--${tone}`)} aria-hidden>{leading}</span>}
    <span className="dl-row__text"><span className="dl-row__title">{title}</span>{meta && <span className="dl-row__meta">{meta}</span>}</span>
    {trailing && <span className="dl-row__trail">{trailing}</span>}
  </>);
  return onClick
    ? <button className="dl-row dl-row--btn" onClick={() => { haptic('tap'); onClick(); }}>{body}</button>
    : <div className="dl-row">{body}</div>;
}

/* ---------- Sheet (bottom on phone, side on wide) ---------- */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose(): void; title: string; children: ReactNode; footer?: ReactNode }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  // Same spring in and out: symmetric dignity.
  return (
    <AnimatePresence>
      {open && (<>
        <motion.div key="scrim" className="dl-scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={pick('smooth', reduce)} />
        <motion.div key="sheet" role="dialog" aria-modal="true" aria-label={title} className="dl-sheet"
          initial={reduce ? { opacity: 0 } : 'hidden'} animate={reduce ? { opacity: 1 } : 'shown'} exit={reduce ? { opacity: 0 } : 'hidden'} variants={variants.sheet} transition={pick('smooth', reduce)}>
          <div className="dl-sheet__grab" aria-hidden />
          <header className="dl-sheet__head"><h2>{title}</h2><button className="dl-iconbtn" aria-label="Close" onClick={onClose}>✕</button></header>
          <div className="dl-sheet__body">{children}</div>
          {footer && <footer className="dl-sheet__foot">{footer}</footer>}
        </motion.div>
      </>)}
    </AnimatePresence>
  );
}

/* ---------- Toast (with Undo: reversible > confirm dialogs) ---------- */
export function Toast({ show, message, tone = 'positive', action, onAction }: { show: boolean; message: string; tone?: Tone; action?: string; onAction?: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="dl-toast-region" aria-live="polite">
      <AnimatePresence>
        {show && (
          <motion.div className={cx('dl-toast', `dl-tone--${tone}`)} initial="hidden" animate="shown" exit="hidden" variants={variants.toast} transition={pick('gentle', reduce)}>
            <i className="dl-toast__dot" aria-hidden /><span>{message}</span>
            {action && <button className="dl-toast__action" onClick={() => { haptic('tap'); onAction?.(); }}>{action}</button>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Bottom dock ---------- */
export function Dock<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; icon: ReactNode; badge?: number; badgeTone?: Tone }[]; value: T; onChange(v: T): void }) {
  const reduce = useReducedMotion();
  return (
    <nav className="dl-dock" aria-label="Main">
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <button key={t.id} className={cx('dl-dock__tab', on && 'is-on')} aria-current={on ? 'page' : undefined}
            onClick={() => { if (!on) { haptic('selection'); onChange(t.id); } }}>
            {on && <motion.span layoutId="dl-dock-pill" className="dl-dock__pill" transition={pick('snappy', reduce)} />}
            <span className="dl-dock__icon" aria-hidden>{t.icon}</span>
            <span className="dl-dock__label">{t.label}</span>
            {!!t.badge && <span className={cx('dl-badge', `dl-tone--${t.badgeTone ?? 'warning'}`)} aria-label={`${t.badge} pending`}>{t.badge}</span>}
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- Header: FULL <-> floating PILL island ---------- */
export function useHeaderMode(scroller?: () => HTMLElement | Window): HeaderMode {
  const [mode, setMode] = useState<HeaderMode>('FULL');
  const st = useRef(initialHeader());
  useEffect(() => {
    const el = scroller?.() ?? window;
    const getY = () => (el === window ? window.scrollY : (el as HTMLElement).scrollTop);
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const n = nextHeader(st.current, getY(), performance.now());
        st.current = n; setMode(n.mode);
      });
    };
    el.addEventListener('scroll', on, { passive: true });
    return () => { el.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, [scroller]);
  return mode;
}

export function Header({ mode, brand, title, actions, context, pillLabel, status, onPillTap }: {
  mode: HeaderMode; brand: ReactNode; title: string; actions?: ReactNode; context?: ReactNode; pillLabel: string; status?: ReactNode; onPillTap?: () => void;
}) {
  const reduce = useReducedMotion();
  return (<>
    {/* Constant-height slot: the page never reflows when the header leaves (BUG-29 fix). */}
    <div className="dl-header-slot" aria-hidden />
    <motion.header className="dl-header" aria-hidden={mode === 'PILL'} inert={mode === 'PILL' ? true : undefined}
      animate={{ y: mode === 'FULL' ? 0 : -24, opacity: mode === 'FULL' ? 1 : 0 }} transition={pick('smooth', reduce)}
      style={{ pointerEvents: mode === 'FULL' ? 'auto' : 'none' }}>
      <div className="dl-header__row">
        <div className="dl-header__brand">{brand}<h1 className="dl-header__title">{title}</h1></div>
        <div className="dl-header__actions">{status}{actions}</div>
      </div>
      {context && <div className="dl-header__context">{context}</div>}
    </motion.header>
    <AnimatePresence>
      {mode === 'PILL' && (
        <motion.button key="pill" className="dl-island" onClick={() => { haptic('selection'); onPillTap?.(); }} aria-label={`${pillLabel}. Show header`}
          initial={reduce ? { opacity: 0 } : 'hidden'} animate={reduce ? { opacity: 1 } : 'shown'} exit={reduce ? { opacity: 0 } : 'hidden'} variants={variants.island} transition={pick('island', reduce)} whileTap={{ scale: 0.96 }}>
          {status}<span className="dl-island__label">{pillLabel}</span><span aria-hidden className="dl-island__chev">⌄</span>
        </motion.button>
      )}
    </AnimatePresence>
  </>);
}

/* ---------- Reveal column (replaces width-animating name column, UI-14) ---------- */
/** Fixed-width column that slides/fades with transform; neighbours never re-layout during motion. */
export function RevealColumn({ open, width, children }: { open: boolean; width: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className="dl-reveal" style={{ width }} animate={{ x: open ? 0 : -width * 0.35, opacity: open ? 1 : 0 }} transition={pick('smooth', reduce)} aria-hidden={!open}>
      {children}
    </motion.div>
  );
}
