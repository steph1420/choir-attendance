import { chromium } from 'playwright-core'
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const V = { phone: { viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8 }, wide: { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 } }
const names = { 1: 'comfy-tint-swipe', 2: 'compact-bar-cycle', 3: 'pill-expand', 4: 'slim-check-pane' }
for (const v of [1, 2, 3, 4]) for (const w of ['phone', 'wide']) { const p = await (await br.newContext(V[w])).newPage(); await p.goto(`file://${process.cwd()}/rows.html?v=${v}&w=${w}`); await p.waitForTimeout(200); await p.screenshot({ path: `R${v}-${names[v]}-${w}.png` }) }
await br.close()
