// Theme controller (PROPOSED v0.2.0): the user picks a FAMILY and a SIDE (night | day | system).
// 'system' follows the OS between the two sides of the chosen family. data-theme="<family>-<side>" on <html>.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { FAMILIES, THEME_ALIASES, type FamilyId, type ThemeId } from '../../tokens/dist/tokens';

export type Side = 'night' | 'day' | 'system';
export type Density = 'comfortable' | 'compact' | 'stage';
export interface Prefs { family: FamilyId; side: Side; density: Density }
export const STORAGE_KEY = 'driftline:prefs:v2';
export const LEGACY_KEY = 'driftline:prefs:v1';
export const DEFAULT_PREFS: Prefs = { family: 'utopian', side: 'system', density: 'comfortable' };

export const isFamily = (f: unknown): f is FamilyId => FAMILIES.some((x) => x.id === f);
export function resolveTheme(family: FamilyId, side: Side, prefersLight: boolean): ThemeId {
  const s = side === 'system' ? (prefersLight ? 'day' : 'night') : side;
  return `${family}-${s}` as ThemeId;
}
/** Parse a theme id (or v0.1 alias) into family + side. */
export function parseThemeId(id: string): { family: FamilyId; side: 'night' | 'day' } | null {
  const real = THEME_ALIASES[id] ?? id;
  const m = real.match(/^(.*)-(night|day)$/);
  return m && isFamily(m[1]) ? { family: m[1], side: m[2] as 'night' | 'day' } : null;
}
const isDensity = (d: unknown): d is Density => d === 'comfortable' || d === 'compact' || d === 'stage';

export function loadPrefs(storage: Pick<Storage, 'getItem'> | undefined): Prefs {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return { family: isFamily(p.family) ? p.family : DEFAULT_PREFS.family, side: ['night', 'day', 'system'].includes(p.side) ? p.side : 'system', density: isDensity(p.density) ? p.density : 'comfortable' };
    }
    const legacy = storage?.getItem(LEGACY_KEY); // migrate v0.1 {theme, density}
    if (legacy) {
      const p = JSON.parse(legacy);
      const parsed = typeof p.theme === 'string' ? parseThemeId(p.theme) : null;
      return { ...(parsed ?? { family: DEFAULT_PREFS.family, side: 'system' as Side }), density: isDensity(p.density) ? p.density : 'comfortable' };
    }
  } catch { /* junk -> defaults */ }
  return { ...DEFAULT_PREFS };
}

interface Ctx extends Prefs { theme: ThemeId; setFamily(f: FamilyId): void; setSide(s: Side): void; setDensity(d: Density): void }
const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children, initial }: { children: ReactNode; initial?: Partial<Prefs> & { theme?: string } }) {
  const stored = typeof window === 'undefined' ? { ...DEFAULT_PREFS } : loadPrefs(window.localStorage);
  const fromId = initial?.theme ? parseThemeId(initial.theme) : null;
  const [family, setFamily] = useState<FamilyId>(initial?.family ?? fromId?.family ?? stored.family);
  const [side, setSide] = useState<Side>(initial?.side ?? fromId?.side ?? stored.side);
  const [density, setDensity] = useState<Density>(initial?.density ?? stored.density);
  const [light, setLight] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: light)').matches);
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-color-scheme: light)');
    const on = () => setLight(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  const theme = resolveTheme(family, side, light);
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = theme; el.dataset.family = family; el.dataset.density = density;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ family, side, density })); } catch { /* private mode */ }
  }, [theme, family, side, density]);
  const value = useMemo(() => ({ family, side, density, theme, setFamily, setSide, setDensity }), [family, side, density, theme]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
export function useTheme(): Ctx {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error('useTheme needs <ThemeProvider>');
  return c;
}
