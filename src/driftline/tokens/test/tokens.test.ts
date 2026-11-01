import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// @ts-expect-error plain mjs helper
import { loadTokens, solid, ratio, resolveTheme } from '../scripts/lib.mjs';

const t = loadTokens();
const css = readFileSync(join(__dirname, '..', 'dist', 'tokens.css'), 'utf8');
const themes = Object.keys(t.themes);

describe('tokens', () => {
  it('is versioned SemVer and PROPOSED', () => { expect(t.version).toMatch(/^\d+\.\d+\.\d+$/); expect(t.status).toBe('PROPOSED'); });
  it('every theme defines the same semantic roles', () => {
    const keys = Object.keys(t.themes[themes[0]].color).sort();
    for (const n of themes) expect(Object.keys(t.themes[n].color).sort()).toEqual(keys);
  });
  it('every reference resolves', () => { for (const n of themes) for (const v of Object.values<string>(resolveTheme(t, n))) expect(v).not.toMatch(/\{[a-z]+\./); });
  it('css has a block per theme and no raw slate classes', () => {
    for (const n of themes) expect(css).toContain(`[data-theme="${n}"]`);
    expect(css).not.toMatch(/slate-\d/);
  });
  it('every family has a night and a day side of the right mode', () => {
    for (const [id, f] of Object.entries<any>(t.families)) { expect(f.night.mode, id).toBe('dark'); expect(f.day.mode, id).toBe('light'); }
  });
  it('v0.1 aliases point at real themes', () => { for (const v of Object.values<string>(t.aliases)) expect(themes).toContain(v); });
  it('touch floor is at least 44', () => { expect(t.scale.hit.min).toBeGreaterThanOrEqual(44); for (const d of Object.values<any>(t.scale.density)) expect(d.control).toBeGreaterThanOrEqual(44); });
  it('smallest type is 12px, body is 16px', () => { expect(Math.min(...Object.values<any>(t.scale.type).map((x) => x.size))).toBe(12); expect(t.scale.type.body.size).toBe(16); });
  it('attention is one-shot by default and capped', () => { expect(t.motion.attention.beats).toBe(1); expect(t.motion.attention.maxBeats).toBeLessThanOrEqual(3); });
  it('day themes: active pill text is readable (the original bug)', () => {
    for (const n of themes.filter((x) => t.themes[x].mode === 'light')) expect(ratio(solid(t, n, 'on-accent'), solid(t, n, 'accent-fill'))).toBeGreaterThanOrEqual(4.5);
  });
  it('all declared contrast pairs pass in all themes', () => {
    for (const n of themes) for (const [fg, bg, min] of t.contrast.pairs) expect(ratio(solid(t, n, fg), solid(t, n, bg)), `${n} ${fg}/${bg}`).toBeGreaterThanOrEqual(min);
  });
  it('contrast math matches known values', () => { expect(ratio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 0); });
});
