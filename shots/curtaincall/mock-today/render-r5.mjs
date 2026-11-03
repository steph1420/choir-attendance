import { chromium } from 'playwright-core'
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const V = { phone: { viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8 }, wide: { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 } }
for (const [w, ex, n] of [['phone', 0, 'R5-present-expand-phone-collapsed'], ['phone', 1, 'R5-present-expand-phone-expanded'], ['wide', 1, 'R5-present-expand-wide-expanded']]) { const p = await (await br.newContext(V[w])).newPage(); await p.goto(`file://${process.cwd()}/rows.html?v=5&w=${w}&ex=${ex}`); await p.waitForTimeout(200); await p.screenshot({ path: `${n}.png` }) }
await br.close()
