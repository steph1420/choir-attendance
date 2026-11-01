// Driftline mock stills. Needs: npx vite (port 5188). Placeholder data only.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const B = 'http://localhost:5188/mock.html', out = process.env.OUT ?? 'shots/driftline/v2'; mkdirSync(out, { recursive: true })
const dev = { phone: { width: 390, height: 844 }, tablet: { width: 1180, height: 820 } }
const jobs = []
for (const th of ['utopian-night', 'utopian-day']) { jobs.push([`mark-${th}-phone`, `theme=${th}`, 'phone']); jobs.push([`long-press-sheet-${th}-phone`, `screen=long&theme=${th}`, 'phone']) }
jobs.push(['mark-utopian-night-tablet', 'theme=utopian-night', 'tablet'])
jobs.push(['mark-utopian-day-tablet', 'theme=utopian-day', 'tablet'])
jobs.push(['mark-late-on-utopian-night-phone', 'theme=utopian-night&late=1', 'phone'])
jobs.push(['long-press-sheet-late-on-utopian-night-phone', 'screen=long&late=1&theme=utopian-night', 'phone'])
jobs.push(['clear-hold-utopian-night-phone', 'theme=utopian-night', 'phone', 'hold'])
for (const s of ['settings', 'history', 'reports', 'remark']) jobs.push([`screen-${s}-utopian-night-phone`, `screen=${s}&theme=utopian-night`, 'phone'])
jobs.push(['screen-settings-utopian-day-phone', 'screen=settings&theme=utopian-day', 'phone', 'bottom'])
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
