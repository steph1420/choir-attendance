import { chromium } from 'playwright-core'
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const V = { phone: { viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8 }, wide: { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 } }
const names = { 1: 'rows-greeting', 2: 'face-grid', 3: 'whos-missing' }
for (const c of [1, 2, 3]) for (const w of ['phone', 'wide']) { const p = await (await br.newContext(V[w])).newPage(); await p.goto(`file://${process.cwd()}/today.html?c=${c}&w=${w}`); await p.waitForTimeout(200); await p.screenshot({ path: `C${c}-${names[c]}-${w}.png` }) }
await br.close()
