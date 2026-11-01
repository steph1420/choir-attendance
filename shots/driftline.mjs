// Driftline mock stills. Needs: npx vite (port 5188). Placeholder data only.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const B = 'http://localhost:5188/mock.html', out = 'shots/driftline'; mkdirSync(out, { recursive: true })
const dev = { phone: { width: 390, height: 844 }, tablet: { width: 1180, height: 820 } }
const jobs = []
for (const v of ['a', 'b']) for (const ab of ['grey', 'rose']) {
  for (const th of ['utopian-night', 'utopian-day']) jobs.push([`mark-q29${v}-q30${ab === 'grey' ? 'a' : 'b'}-${th}-phone`, `variant=${v}&absent=${ab}&theme=${th}&toast=1`, 'phone'])
  jobs.push([`mark-q29${v}-q30${ab === 'grey' ? 'a' : 'b'}-utopian-night-tablet`, `variant=${v}&absent=${ab}&theme=utopian-night&toast=1`, 'tablet'])
}
jobs.push(['clear-hold-utopian-night-phone', 'theme=utopian-night&absent=rose', 'phone', 'hold'])
for (const s of ['remark', 'members', 'history', 'reports', 'daily', 'settings']) jobs.push([`screen-${s}-utopian-night-phone`, `screen=${s}&absent=rose&theme=utopian-night`, 'phone'])
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
for (const [name, qs, d, st] of jobs) {
  const ctx = await br.newContext({ viewport: dev[d], deviceScaleFactor: 2, reducedMotion: 'reduce', hasTouch: true })
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('PAGEERR', name, e.message))
  await p.goto(`${B}?${qs}`, { waitUntil: 'networkidle' })
  if (st === 'hold') { const h = p.locator('button', { hasText: 'Hold to clear' }).first(); await h.scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 120)); const b = await h.boundingBox(); await p.mouse.move(b.x + 40, b.y + 20); await p.mouse.down(); await p.waitForTimeout(330); await p.screenshot({ path: `${out}/${name}.png` }); await p.mouse.up() }
  else { await p.waitForTimeout(500); await p.screenshot({ path: `${out}/${name}.png` }) }
  console.log('shot', name); await ctx.close()
}
await br.close()
