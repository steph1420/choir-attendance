// WCAG 2.x contrast check for every theme x pair in tokens.json. Exits 1 on any failure.
import { loadTokens, solid, ratio } from './lib.mjs';
const t = loadTokens();
let fails = 0; const rows = [];
for (const theme of Object.keys(t.themes)) {
  for (const [fg, bg, min] of t.contrast.pairs) {
    const r = ratio(solid(t, theme, fg), solid(t, theme, bg));
    const ok = r >= min; if (!ok) fails++;
    rows.push({ theme, fg, bg, ratio: +r.toFixed(2), min, ok });
  }
}
if (process.argv.includes('--md')) {
  console.log('| theme | foreground | on | ratio | needs | |\n|---|---|---|---|---|---|');
  for (const r of rows) console.log(`| ${r.theme} | ${r.fg} | ${r.bg} | ${r.ratio} | ${r.min} | ${r.ok ? 'pass' : '**FAIL**'} |`);
} else {
  for (const r of rows.filter((x) => !x.ok)) console.log(`FAIL ${r.theme}: ${r.fg} on ${r.bg} = ${r.ratio} (< ${r.min})`);
  console.log(`contrast: ${rows.length - fails}/${rows.length} pairs pass across ${Object.keys(t.themes).length} themes`);
}
process.exit(fails ? 1 : 0);
