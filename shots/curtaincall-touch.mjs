// Scripted touch tests for Today: NORMAL scroll (Steve t51u removed spring-peek/snap). Sample data only (?local). Phone 451x993 @2.8.
import { chromium } from 'playwright-core'
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const ctx = await br.newContext({ viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8, isMobile: true, hasTouch: true })
const p = await ctx.newPage(); await p.goto('http://localhost:5189/?local&reset&demo', { waitUntil: 'networkidle' }); await p.waitForTimeout(400)
const cdp = await ctx.newCDPSession(p); const res = []; const ok = (n, c, i = '') => res.push(`${c ? 'PASS' : 'FAIL'} ${n} — ${i}`)
const R = await p.locator('.cc-groups').evaluate(e => e.offsetTop); const st = () => p.locator('.cc-today').evaluate(e => e.scrollTop)
async function swipe(dy, ms, y0 = 600) { const n = Math.max(4, Math.round(ms / 16)); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 225, y: y0 }] })
  for (let i = 1; i <= n; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 225, y: y0 + dy * i / n }] }); await p.waitForTimeout(ms / n) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }
for (let i = 0; i < 4; i++) { await swipe(-400, 200); await p.waitForTimeout(300) }
await p.waitForTimeout(1200); const deep = await st(); ok('swipe scrolls the panel away with the list', deep > R + 300, `scrollTop ${deep}, panel ${R}px`)
const h = await p.locator('.cc-ghead').evaluateAll(hs => hs.map(x => Math.round(x.getBoundingClientRect().top))); ok('a section header is sticky at the top', h.includes(0), JSON.stringify(h))
await swipe(deep - R + 60, 900, 150); await p.waitForTimeout(1200); const y = await st(); ok('slow drag up stops where the finger stops (no snap)', Math.abs(y - R) > 10 && y < R + 200, `scrollTop ${y}, old rest ${R}`)
await swipe(500, 400, 250); await p.waitForTimeout(1200); ok('swipe down reaches the full panel', (await st()) <= 2, `${await st()}`)
console.log(res.join('\n')); await br.close()
