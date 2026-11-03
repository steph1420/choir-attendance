import { chromium } from 'playwright-core'
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const V = { phone: { viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8 }, wide: { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 } }
for (const [w, f, n] of [['phone', 0, 'R6-rollcall-phone-open'], ['phone', 1, 'R6-rollcall-phone-remarks-focused'], ['wide', 1, 'R6-rollcall-wide-remarks-focused']]) { const p = await (await br.newContext(V[w])).newPage(); await p.goto(`file://${process.cwd()}/rows.html?v=6&ex=1&w=${w}&f=${f}`); await p.waitForTimeout(200); await p.screenshot({ path: `${n}.png` }) }
const p = await (await br.newContext({ viewport: { width: 560, height: 420 }, deviceScaleFactor: 2.8 })).newPage(); await p.goto(`file://${process.cwd()}/navstrip.html`); await p.screenshot({ path: 'R6-nav-label-options.png', fullPage: true })
await br.close()
