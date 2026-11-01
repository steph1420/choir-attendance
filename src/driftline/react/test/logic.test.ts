import { nextHeader, initialHeader } from '../src/headerMode';
import { patternFor, setHapticLevel, haptic } from '../src/haptics';
import { resolveTheme, loadPrefs, parseThemeId, STORAGE_KEY, LEGACY_KEY } from '../src/theme';
import { HEADER } from '../../tokens/dist/tokens';

describe('header FULL<->PILL', () => {
  const run = (ys: number[], dt = 300) => { let s = initialHeader(), now = 0; const modes: string[] = []; for (const y of ys) { now += dt; s = nextHeader(s, y, now); modes.push(s.mode); } return modes; };
  it('goes PILL after scrolling down past the threshold', () => { expect(run([0, 40, 120, 200]).at(-1)).toBe('PILL'); });
  it('slow scrolling accumulates (BUG-35)', () => { expect(run(Array.from({ length: 60 }, (_, i) => i * 4)).at(-1)).toBe('PILL'); });
  it('toolbar wobble below ignoreJump never flips (BUG-29)', () => {
    const m = run([0, 200, 400, 400 - (HEADER.ignoreJump - 1), 400, 400 - (HEADER.ignoreJump - 1)]);
    expect(m.slice(2)).toEqual(['PILL', 'PILL', 'PILL', 'PILL']);
  });
  it('scroll up returns FULL', () => { expect(run([0, 200, 400, 300]).at(-1)).toBe('FULL'); });
  it('lock window blocks flapping', () => { expect(run([0, 200, 100], 50).at(-1)).toBe('PILL'); });
  it('top zone always FULL', () => { expect(run([0, 300, 600, 10], 50).at(-1)).toBe('FULL'); });
});

describe('haptics', () => {
  it('grades are distinct and confirm > tap > selection', () => {
    expect(patternFor('selection', 'normal')[0]).toBeLessThan(patternFor('tap', 'normal')[0]);
    expect(patternFor('confirm', 'normal').length).toBeGreaterThan(1);
  });
  it('four levels: off / light / normal / strong (t208u)', () => {
    expect(patternFor('error', 'off')).toEqual([]);
    expect(patternFor('error', 'light')).toHaveLength(1);
    expect(patternFor('confirm', 'normal')).toEqual([12, 40, 18]);
    expect(patternFor('confirm', 'strong')).toEqual([18, 40, 27]);
    expect(Math.max(...patternFor('error', 'strong'))).toBeLessThanOrEqual(80);
  });
  it('safe without navigator.vibrate', () => { setHapticLevel('normal'); expect(haptic('tap')).toBe(false); });
  it('calls vibrate when present', () => {
    const v = vi.fn(() => true); (navigator as any).vibrate = v; expect(haptic('confirm')).toBe(true); expect(v).toHaveBeenCalledWith([12, 40, 18]); delete (navigator as any).vibrate;
  });
});

describe('theme controller (night/day families)', () => {
  it('system follows the OS between the two sides of a family', () => {
    expect(resolveTheme('retro-glass', 'system', true)).toBe('retro-glass-day');
    expect(resolveTheme('retro-glass', 'system', false)).toBe('retro-glass-night');
    expect(resolveTheme('paper', 'night', true)).toBe('paper-night');
  });
  it('parses ids and v0.1 aliases', () => {
    expect(parseThemeId('daybreak')).toEqual({ family: 'utopian', side: 'day' });
    expect(parseThemeId('high-contrast')).toEqual({ family: 'contrast', side: 'day' });
    expect(parseThemeId('neon-night')).toBeNull();
  });
  const store = (o: Record<string, string>) => ({ getItem: (k: string) => o[k] ?? null });
  it('rejects junk prefs', () => {
    expect(loadPrefs(store({ [STORAGE_KEY]: '{"family":"neon","side":"dusk","density":"huge"}' }))).toEqual({ family: 'utopian', side: 'system', density: 'comfortable' });
    expect(loadPrefs(store({ [STORAGE_KEY]: 'not json' })).family).toBe('utopian');
  });
  it('migrates v0.1 prefs', () => {
    expect(loadPrefs(store({ [LEGACY_KEY]: '{"theme":"paper","density":"stage"}' }))).toEqual({ family: 'paper', side: 'day', density: 'stage' });
    expect(loadPrefs(store({ [LEGACY_KEY]: '{"theme":"system"}' })).side).toBe('system');
  });
});
