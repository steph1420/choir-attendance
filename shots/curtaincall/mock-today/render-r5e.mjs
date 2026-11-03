import { chromium } from 'playwright-core'
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const V = { phone: { viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8 }, wide: { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 } }
const nm = { 1: 'segmented-more', 2: 'big-grid-time', 3: 'pills-sheet', 4: 'lift-tabs' }
const jobs = []; for (const e of [1, 2, 3, 4]) for (const w of ['phone', 'wide']) jobs.push([e, w, ''])
jobs.push([3, 'phone', 'sheet'], [3, 'wide', 'sheet'])
for (const [e, w, x] of jobs) { const p = await (await br.newContext(V[w])).newPage(); await p.goto(`file://${process.cwd()}/rows.html?v=5&ex=1&e=${e}&w=${w}${x ? '&sheet=1' : ''}`); await p.waitForTimeout(200); await p.screenshot({ path: `R5-E${e}-${nm[e]}-${w}${x ? '-details-sheet' : ''}.png` }) }
await br.close()
