import { chromium } from 'playwright-core'
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const V = { phone: { viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8 }, wide: { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 } }
for (const [w, t, n] of [['phone', 0, 'R7-register-phone-bubbles'], ['phone', 1, 'R7-register-phone-bubble-tapped'], ['wide', 0, 'R7-register-wide-bubbles'], ['phone', '0&p=1', 'R7-register-phone-bubbles-popin']]) { const p = await (await br.newContext(V[w])).newPage(); await p.goto(`file://${process.cwd()}/rows.html?v=7&ex=1&f=1&w=${w}&t=${t}`); await p.waitForTimeout(200); await p.screenshot({ path: `${n}.png` }) }
await br.close()
