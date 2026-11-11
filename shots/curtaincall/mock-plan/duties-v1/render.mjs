// node render.mjs  (playwright-core + /usr/bin/google-chrome). Mock "today" = Wed 19 Aug 2026.
import { chromium } from '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs'
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const N = { A1: 'D-A1-cards-night', A2: 'D-A2-table-night', A3: 'D-A3-sheet-night', A4: 'D-A4-compact-night', A4P: 'D-A4-compact-panel-night', A5: 'D-A5-timeline-night', B: 'D-B-by-date-night', C: 'D-C-by-teacher-night', D: 'D-D-tiles-night', DS: 'D-D-tiles-sheet-night' }
for (const v of Object.keys(N)) {
  const p = await (await br.newContext({ viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8 })).newPage()
  p.on('pageerror', e => console.log(v, e.message))
  await p.goto(`file://${process.cwd()}/duties.html?v=${v}`); await p.waitForTimeout(250)
  await p.screenshot({ path: `${N[v]}.png` })
}
await br.close()
