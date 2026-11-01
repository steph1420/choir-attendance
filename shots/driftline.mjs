// Driftline mock stills. Needs: npx vite (port 5188). Placeholder data only.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const B = 'http://localhost:5188/mock.html', out = process.env.OUT ?? 'shots/driftline/v3'; mkdirSync(out, { recursive: true })
const dev = { phone: { width: 390, height: 844 }, tablet: { width: 1180, height: 820 } }
const jobs = []
const N = 'theme=utopian-night'
jobs.push(['mark-class-collapsed-utopian-night-phone', N, 'phone'])
jobs.push(['mark-class-expanded-utopian-night-phone', N + '&glance=1', 'phone'])
jobs.push(['mark-role-utopian-night-phone', N + '&group=role', 'phone'])
jobs.push(['mark-az-rail-utopian-night-phone', N + '&group=az&hint=0', 'phone'])
jobs.push(['mark-class-collapsed-utopian-day-phone', 'theme=utopian-day', 'phone'])
jobs.push(['mark-az-rail-utopian-day-phone', 'theme=utopian-day&group=az&hint=0', 'phone'])
jobs.push(['mark-class-utopian-night-tablet', N, 'tablet'])
jobs.push(['mark-az-utopian-night-tablet', N + '&group=az', 'tablet'])
jobs.push(['long-press-sheet-utopian-night-phone', N + '&screen=long', 'phone'])
jobs.push(['long-press-sheet-utopian-day-phone', 'theme=utopian-day&screen=long', 'phone'])
jobs.push(['undo-history-sheet-utopian-night-phone', N + '&screen=steps', 'phone'])
jobs.push(['screen-history-utopian-night-phone', N + '&screen=history', 'phone'])
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
for (const [name, qs, d, st] of jobs) {
  const ctx = await br.newContext({ viewport: dev[d], deviceScaleFactor: 2, reducedMotion: 'reduce', hasTouch: true })
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('PAGEERR', name, e.message))
  await p.goto(`${B}?${qs}`, { waitUntil: 'networkidle' })
  if (st === 'hold') { const h = p.locator('button', { hasText: 'Hold to clear' }).first(); await h.scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 120)); const b = await h.boundingBox(); await p.mouse.move(b.x + 40, b.y + 20); await p.mouse.down(); await p.waitForTimeout(330); await p.screenshot({ path: `${out}/${name}.png` }); await p.mouse.up() }
  else { if (st === 'bottom' || name.startsWith('screen-settings')) await p.evaluate(() => window.scrollTo(0, 400)); await p.waitForTimeout(500); await p.screenshot({ path: `${out}/${name}.png` }) }
  console.log('shot', name); await ctx.close()
}
await br.close()
