// CurtainCall stage 1a stills. Needs: npx vite --port 5189. Sample data only.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const out = 'shots/curtaincall/stage1a'; mkdirSync(out, { recursive: true })
const dev = { phone: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } }
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
for (const d of ['phone', 'desktop']) for (const [n, qs] of [['today', ''], ['quicknote', '&note'], ['template-picker', '&first']]) {
  const ctx = await br.newContext({ viewport: dev[d], deviceScaleFactor: 2, reducedMotion: 'reduce' })
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('PAGEERR', n, e.message))
  await p.goto(`http://localhost:5189/?reset${qs === '&first' ? '' : '&demo'}${qs === '&note' ? '&note' : ''}`, { waitUntil: 'networkidle' })
  if (qs === '&note') { await p.fill('textarea', 'Check Soprano risers before Friday'); await p.click('.cc-sheet button'); await p.waitForSelector('.cc-notes li') }
  await p.waitForTimeout(400); await p.screenshot({ path: `${out}/${d}-${n}.png` }); console.log('shot', d, n); await ctx.close()
}
await br.close()
