// Headless screenshots of the built app (dist) via system Chrome. Prints progress per shot.
import { chromium } from 'playwright-core'
import { createServer } from 'http'; import { readFileSync, existsSync } from 'fs'; import { extname, join } from 'path'
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }
const srv = createServer((q, r) => { let p = join('dist', decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/') || !existsSync(p)) p = 'dist/index.html'; r.writeHead(200, { 'Content-Type': types[extname(p)] || 'application/octet-stream' }); r.end(readFileSync(p)) }).listen(4173)
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const shot = async (name, vp, q, act) => {
  const c = await b.newContext({ viewport: vp, deviceScaleFactor: 2 }); const p = await c.newPage()
  p.on('pageerror', e => console.log('PAGEERROR', name, e.message))
  await p.goto(`http://localhost:4173/?reset&demo${q}`); await p.waitForSelector('.row', { timeout: 10000 })
  if (act) await act(p); await p.waitForTimeout(150)
  await p.screenshot({ path: `shots/${name}.png` }); console.log('shot', name); await c.close()
}
const phone = { width: 390, height: 844 }, tab = { width: 1180, height: 820 }
await shot('01-phone-section', phone, '')
await shot('02-phone-le-popup', phone, '', p => p.locator('[data-child="X006"] .mk.wide').click())
await shot('03-phone-le-excused-reasons', phone, '', async p => { await p.locator('[data-child="X006"] .mk.wide').click(); await p.getByRole('button', { name: /Excused/ }).click() })
await shot('04-phone-more-menu', phone, '', p => p.locator('[data-child="X006"] .mk.dots').click())
await shot('05-phone-remark-sheet', phone, '', p => p.locator('[data-child="X003"] .row-name').click())
await shot('06-phone-role', phone, '', p => p.getByRole('tab', { name: 'Role' }).click())
await shot('07-phone-az', phone, '', p => p.getByRole('tab', { name: 'A–Z' }).click())
await shot('08-phone-offline', phone, '&offline', p => p.locator('[data-child="X007"] .marks > button').nth(1).click())
await shot('09-tablet-section', tab, '')
await shot('10-phone-le-flip-above', phone, '', async p => { await p.locator('[data-child="X008"]').scrollIntoViewIfNeeded(); await p.evaluate(() => { const r = document.querySelector('[data-child="X009"]'); document.querySelector('.list').scrollTop += r.getBoundingClientRect().top - (innerHeight - 70) }); await p.locator('[data-child="X009"] .mk.wide').click() })
await b.close(); srv.close(); console.log('done')
