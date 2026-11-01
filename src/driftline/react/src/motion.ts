// Motion presets. Springs come from tokens; symmetric by construction (same transition both ways).
import type { Transition } from 'framer-motion';
import { SPRINGS, DURATION } from '../../tokens/dist/tokens';

export const spring = SPRINGS as unknown as Record<keyof typeof SPRINGS, Transition>;
/** Reduced-motion substitute: a short opacity-only crossfade, no travel. */
export const reduced: Transition = { duration: DURATION.instant / 1000 };
export const pick = (name: keyof typeof SPRINGS, reduce: boolean | null): Transition => (reduce ? reduced : spring[name]);

/** GPU-only variants (transform + opacity). Never width/height/top/left. */
export const variants = {
  fadeUp: { hidden: { opacity: 0, y: 12 }, shown: { opacity: 1, y: 0 } },
  sheet: { hidden: { y: '100%' }, shown: { y: 0 } },
  island: { hidden: { opacity: 0, y: -16, scale: 0.92 }, shown: { opacity: 1, y: 0, scale: 1 } },
  toast: { hidden: { opacity: 0, y: 24, scale: 0.96 }, shown: { opacity: 1, y: 0, scale: 1 } },
} as const;
