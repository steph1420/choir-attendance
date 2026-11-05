import { chromium } from 'playwright-core'
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const V = { phone: { viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8 }, wide: { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 } }
const N = { 1: 'K1-by-item', 2: 'K2-by-child-open', 3: 'K3-note-circles', 4: 'K4-item-details-fields', 5: 'K5-add-item-source', 6: 'K6-measurements-history', 7: 'K7-empty-state', 8: 'K8-rename-terminology', 9: 'K9-lost-item' }
const jobs = Object.keys(N).map(s => [s, 'phone']).concat([['1', 'wide'], ['2', 'wide']])
for (const [s, w] of jobs) { const p = await (await br.newContext(V[w])).newPage(); p.on('pageerror', e => console.log(s, w, e.message)); await p.goto(`file://${process.cwd()}/costumes.html?s=${s}&w=${w}`); await p.waitForTimeout(200); await p.screenshot({ path: `${N[s]}-${w}-v2.png` }) }
await br.close()
