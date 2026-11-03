// CurtainCall stage 1b stills. Needs: npx vite --port 5189. Sample data only.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const out = 'shots/curtaincall/stage1b'; mkdirSync(out, { recursive: true })
const dev = { phone: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } }
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
for (const d of ['phone', 'desktop']) for (const [n, qs] of [['today', ''], ['costumes', '&tab=show'], ['props', '&tab=show&show=props'], ['notes', '&tab=notes'], ['costume-edit', '&tab=show']]) {
  const ctx = await br.newContext({ viewport: dev[d], deviceScaleFactor: 2, reducedMotion: 'reduce' })
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('PAGEERR', n, e.message))
  await p.goto(`http://localhost:5189/?reset&demo${qs}`, { waitUntil: 'networkidle' })
  if (n === 'costume-edit') await p.click('.cc-item >> nth=1')
  await p.waitForTimeout(500); await p.screenshot({ path: `${out}/${d}-${n}.png` }); console.log('shot', d, n); await ctx.close()
}
await br.close()
