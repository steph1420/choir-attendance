// Shared token resolver used by build.mjs and contrast.mjs. Pure functions, no DOM.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const here = dirname(fileURLToPath(import.meta.url));
/** Load tokens and flatten families {night, day} into themes "<family>-<side>". */
export function loadTokens() {
  const t = JSON.parse(readFileSync(join(here, '..', 'tokens.json'), 'utf8'));
  t.themes = {};
  for (const [fam, f] of Object.entries(t.families)) {
    for (const side of ['night', 'day']) {
      if (!f[side]) throw new Error(`family ${fam} is missing its ${side} side`);
      t.themes[`${fam}-${side}`] = { ...f[side], family: fam, side, tier: f.tier, name: `${f.name} ${side === 'night' ? 'Night' : 'Day'}` };
    }
  }
  return t;
}

/** Resolve "{group.step}" references against the primitive tier. */
export function resolveRef(value, primitive) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{([a-z]+)\.([0-9]+)\}/g, (m, g, s) => {
    const v = primitive[g]?.[s];
    if (!v) throw new Error(`Unknown primitive ${m}`);
    return v;
  });
}

export function resolveTheme(tokens, name) {
  const t = tokens.themes[name];
  if (!t) throw new Error(`Unknown theme ${name}`);
  const out = {};
  for (const [k, v] of Object.entries(t.color)) out[k] = resolveRef(v, tokens.primitive);
  return out;
}

/** Parse #rgb/#rrggbb/rgba() into {r,g,b,a} (0-255, a 0-1). Returns null for gradients/none. */
export function parseColor(s) {
  s = String(s).trim();
  let m = s.match(/^#([0-9a-f]{6})$/i);
  if (m) { const n = parseInt(m[1], 16); return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: 1 }; }
  m = s.match(/^#([0-9a-f]{3})$/i);
  if (m) { const [r, g, b] = m[1].split('').map((c) => parseInt(c + c, 16)); return { r, g, b, a: 1 }; }
  m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (m) { const p = m[1].split(',').map((x) => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; }
  return null;
}

export const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1,
});
export const mix = (a, b, pct) => ({ r: a.r * pct + b.r * (1 - pct), g: a.g * pct + b.g * (1 - pct), b: a.b * pct + b.b * (1 - pct), a: 1 });

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
export const luminance = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
export function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Solid colour for a role in a theme, composited over the page background. "chip:x" = soft chip fill. */
export function solid(tokens, theme, role) {
  const c = resolveTheme(tokens, theme);
  const bg = parseColor(c.bg);
  if (role.startsWith('chip:')) {
    const status = parseColor(c[role.slice(5)]);
    const base = over(parseColor(c['surface-solid']), bg);
    const pct = (tokens.themes[theme].mode === 'dark' ? tokens.component.chip['mix-dark'] : tokens.component.chip['mix-light']) / 100;
    return mix(status, base, pct);
  }
  const p = parseColor(c[role]);
  if (!p) throw new Error(`${theme}.${role} is not a flat colour`);
  // surfaces sit on bg; text sits on whatever it is measured against (caller composites again)
  return over(p, bg);
}
