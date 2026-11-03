// Scripted touch tests for Today scroll/snap (Steve t43u–t47u). Sample data only (?local). Phone 451x993 @2.8.
import { chromium } from 'playwright-core'
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const ctx = await br.newContext({ viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8, isMobile: true, hasTouch: true })
const p = await ctx.newPage(); await p.goto('http://localhost:5189/?local&reset&demo', { waitUntil: 'networkidle' }); await p.waitForTimeout(400)
const cdp = await ctx.newCDPSession(p); const res = []; const ok = (n, c, i = '') => res.push(`${c ? 'PASS' : 'FAIL'} ${n} — ${i}`)
const R = await p.locator('.cc-groups').evaluate(e => e.offsetTop)
const st = () => p.locator('.cc-today').evaluate(e => e.scrollTop)
// swipe: finger moves dy (negative = finger up = scroll down) over ms
async function swipe(dy, ms, x = 225, y0 = 600) { const n = Math.max(4, Math.round(ms / 16)); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
  for (let i = 1; i <= n; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + dy * i / n }] }); await p.waitForTimeout(ms / n) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }
async function trace(ms) { const t = []; const e = Date.now() + ms; while (Date.now() < e) { t.push(Math.round(await st())); await p.waitForTimeout(16) } return t }
ok('starts with full panel', (await st()) === 0, `R=${R}`)
for (let i = 0; i < 5; i++) { await swipe(-400, 200) ; await p.waitForTimeout(300) }
await p.waitForTimeout(1500); const deep = await st(); ok('swipes down into the list', deep > R + 300, `scrollTop ${deep}`)
// fast fling up
await swipe(380, 90, 225, 300); const tr = await trace(1600); const min = Math.min(...tr), end = tr.at(-1)
ok('fast fling up rests at first section header', Math.abs(end - R) <= 2, `end ${end}, R ${R}`)
ok('fling spring-peeks the panel (overshoot) then snaps back', min < R - 4, `deepest peek ${R - min}px`)
const top0 = await p.locator('.cc-today').evaluate(e => e.getBoundingClientRect().top); const h0 = await p.locator('.cc-ghead').first().evaluate(e => e.getBoundingClientRect().top)
ok('first header at top of screen area', Math.abs(h0 - top0) <= 2, `${h0} vs ${top0}`)
await p.screenshot({ path: 'shots/curtaincall/qa/phone-21-snap-rest.png' })
// slow drag up from list also stops at R
await swipe(-600, 400); await p.waitForTimeout(1200); await swipe(250, 900, 225, 300); await swipe(250, 900, 225, 300); await swipe(250, 900, 225, 300); await p.waitForTimeout(1200)
ok('slow upward scroll also stops at resting point', Math.abs((await st()) - R) <= 2, `${await st()}`)
// new swipe down from rest reveals panel
await swipe(500, 400, 225, 250); await p.waitForTimeout(1500); ok('second swipe from rest reveals full panel', (await st()) <= 2, `${await st()}`)
await p.screenshot({ path: 'shots/curtaincall/qa/phone-22-panel-revealed.png' })
console.log(res.join('\n')); console.log('trace', tr.join(',')); await br.close()
