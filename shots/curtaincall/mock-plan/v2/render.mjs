// Run from this folder: node render.mjs   (playwright-core + /usr/bin/google-chrome)
import { chromium } from '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs'
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const N = { 1: 'P1-today-now-next', 2: 'P2-plan-duties-by-committee', 3: 'P3-duty-sheet', 4: 'P4-plan-practice-schedule-day', 5: 'P5-plan-important-dates', 6: 'P6-notices-list', 7: 'P7-show-programme-duties' }
const TH = { 'utopian-day': 'day', 'utopian-night': 'night' }
for (const [t, tn] of Object.entries(TH)) for (const s of Object.keys(N)) {
  const p = await (await br.newContext({ viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8 })).newPage()
  p.on('pageerror', e => console.log(s, t, e.message))
  await p.goto(`file://${process.cwd()}/plan.html?s=${s}&t=${t}`); await p.waitForTimeout(250)
  await p.screenshot({ path: `${N[s]}-phone-${tn}-v2.png` })
}
await br.close()
