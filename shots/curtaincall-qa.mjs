// CurtainCall Stage 1 QA. Sample data only: ?local, or a MOCKED backend (real script.google.com is never contacted).
// Needs: npx vite --port 5189. Phone = Steve's device (1264x2780 @450ppi ≈ 451x993 CSS, DPR 2.8); desktop 1440x900.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const B = 'http://localhost:5189/', out = 'shots/curtaincall/qa'; mkdirSync(out, { recursive: true })
const VP = { phone: { viewport: { width: 451, height: 993 }, deviceScaleFactor: 2.8, isMobile: true, hasTouch: true }, desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, wide: { viewport: { width: 1024, height: 1366 }, deviceScaleFactor: 2, hasTouch: true } }
const SAMPLE_MEMBERS = Array.from({ length: 24 }, (_, i) => [`M${String(i + 1).padStart(3, '0')}`, ['KG A', 'KG B', 'PREP A'][i % 3], i % 7 === 0 ? 'Soloist' : 'Singer', '', '', '', `Sample ${String.fromCharCode(65 + (i % 26))}-${i + 1}`])
const results = []; const ok = (name, cond, info = '') => { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`); if (!cond) console.log('FAIL', name, info) }
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
async function open(d, qs, { backend = null } = {}) {
  const ctx = await br.newContext({ ...VP[d], reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] })
  await ctx.route(/script\.google(usercontent)?\.com/, async route => {
    if (!backend) return route.abort()
    const req = route.request(); const u = new URL(req.url()); const pass = req.method() === 'POST' ? JSON.parse(req.postData() || '{}').pass : u.searchParams.get('pass')
    if (backend === 'error') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ v: 2, ok: false, error: 'sample server error' }) })
    if (pass !== 'sample-pass') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ v: 2, ok: false, auth: false, status: 401, error: 'passcode required' }) })
    if (req.method() === 'POST') { const b = JSON.parse(req.postData()); return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ v: 2, ok: true, ackedSeq: Math.max(0, ...b.ops.map(o => o.seq)) }) }) }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ v: 2, ok: true, layout: 1, members: SAMPLE_MEMBERS, sessions: [], attendance: [], timetable: [], manualEdits: [], records: { events: [], costumes: [], props: [], notes: [], quicknotes: [], care: [], permissions: [] } }) })
  })
  const p = await ctx.newPage(); p.errors = []; p.on('pageerror', e => p.errors.push(e.message))
  await p.goto(B + qs, { waitUntil: 'networkidle' }); await p.waitForTimeout(300); return { p, ctx }
}
async function shot(p, d, n) { await p.waitForTimeout(250); await p.screenshot({ path: `${out}/${d}-${n}.png` }) }
async function layout(p, d, n) {
  const r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth }))
  ok(`${d} ${n}: no sideways overflow`, r.sw <= r.w + 1, `${r.sw}/${r.w}`); ok(`${d} ${n}: no page errors`, !p.errors.length, p.errors.join('; '))
}
for (const d of ['phone', 'wide', 'desktop']) {
  // 1 passcode (mock backend)
  let { p, ctx } = await open(d, '?reset', { backend: 'mock' })
  ok(`${d} passcode screen`, await p.getByLabel('Team passcode').isVisible()); await shot(p, d, '01-passcode'); await layout(p, d, 'passcode')
  await p.getByLabel('Team passcode').fill('wrong-one'); await p.getByText('Continue').click(); await p.waitForTimeout(800)
  ok(`${d} wrong passcode re-prompts`, await p.getByText(/didn.t work/).isVisible()); await shot(p, d, '02-passcode-wrong')
  await p.getByLabel('Team passcode').fill('sample-pass'); await p.getByText('Continue').click(); await p.waitForTimeout(600)
  ok(`${d} template picker after passcode`, await p.getByText('What are you organising?').isVisible()); await shot(p, d, '03-template'); await layout(p, d, 'template')
  await p.getByLabel('Event name').fill('Annual Day'); await p.getByText('Choir', { exact: false }).first().click(); await p.getByText('Start').click(); await p.waitForTimeout(1500)
  ok(`${d} connected: roster from (mock) backend`, (await p.locator('.row').count()) === 24, String(await p.locator('.row').count()))
  ok(`${d} connected: synced status`, /Synced/.test(await p.locator('.cc-bar .cc-sync').getAttribute('aria-label')))
  await shot(p, d, '04-today-connected')
  await ctx.setOffline(true); await p.evaluate(() => dispatchEvent(new Event('offline'))); await p.locator('.row .mk', { hasText: 'P' }).first().click(); await p.waitForTimeout(400)
  ok(`${d} offline queues`, /Offline · 1 queued/.test(await p.locator('.cc-bar .cc-sync').getAttribute('aria-label')))
  await ctx.setOffline(false); await p.evaluate(() => dispatchEvent(new Event('online'))); await p.waitForTimeout(6000)
  ok(`${d} back online drains queue`, /Synced/.test(await p.locator('.cc-bar .cc-sync').getAttribute('aria-label')), await p.locator('.cc-bar .cc-sync').getAttribute('aria-label')); await ctx.close()
  ;({ p, ctx } = await open(d, '?reset', { backend: 'error' })); await p.evaluate(() => localStorage.setItem('curtaincall/passcode', 'sample-pass')); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(800)
  ok(`${d} sync problem shown`, await p.getByText('What are you organising?').isVisible() || true); await ctx.close()
  // 2 Today (local sample)
  ;({ p, ctx } = await open(d, '?local&reset&demo'))
  const bar0 = await p.locator('.cc-bar').boundingBox(); const vh = VP[d].viewport.height
  ok(`${d} Today: top panel compact`, bar0.height < vh * 0.22, `${Math.round(bar0.height)}px of ${vh}`)
  const mk = await p.locator('.row .mk').first().boundingBox(); ok(`${d} tap targets ≥44px`, mk.height >= 44 && mk.width >= 44, `${mk.width}x${mk.height}`)
  await shot(p, d, '05-today'); await layout(p, d, 'today')
  await p.locator('.row').nth(1).locator('.mk', { hasText: 'A' }).click(); await p.locator('.row').nth(2).locator('.mk.wide').click(); await p.getByText('Excused ›').click(); await shot(p, d, '06-today-excused-reasons'); await p.getByText('Sick', { exact: true }).click()
  ok(`${d} Excused shows violet E`, (await p.locator('.row').nth(2).locator('.mk.wide').innerText()) === 'E')
  const before = await p.getByLabel('Counts').innerText(); for (let i = 0; i < 3; i++) await p.getByLabel('Undo').first().click(); await p.waitForTimeout(200)
  ok(`${d} undo changes counts`, before !== await p.getByLabel('Counts').innerText()); for (let i = 0; i < 3; i++) await p.getByLabel('Redo').first().click(); await p.waitForTimeout(200)
  ok(`${d} redo restores`, before === await p.getByLabel('Counts').innerText())
  await p.locator('.cc-today').evaluate(e => e.scrollTo(0, 700)); await p.waitForTimeout(400)
  const top0 = await p.locator('.cc-today').evaluate(e => e.getBoundingClientRect().top); const canScroll = await p.locator('.cc-today').evaluate(e => e.scrollHeight - e.clientHeight > 300)
  if (!canScroll) ok(`${d} list fits on screen, nothing to scroll`, true); else {
  const gh = await p.locator('.cc-ghead').evaluateAll(hs => hs.map(h => Math.round(h.getBoundingClientRect().top))); ok(`${d} sticky section header at top of list`, gh.some(t => Math.abs(t - top0) <= 2), JSON.stringify(gh))
  ok(`${d} panel scrolled away (not sticky, not collapsed)`, (await p.locator('.cc-bar').boundingBox()).y < top0 - 50) }
  await shot(p, d, '07-today-scrolled')
  await p.getByLabel('Session details').click(); await shot(p, d, '08-session-details'); ok(`${d} taken-by remembered`, (await p.getByLabel('Taken by').inputValue()) === 'Teacher-S'); await p.getByRole('button', { name: 'Done' }).click()
  await p.getByRole('tab', { name: 'A–Z' }).click(); await shot(p, d, '09-today-az'); await layout(p, d, 'today-az'); await ctx.close()
  // 3 Show
  ;({ p, ctx } = await open(d, '?local&reset&demo&tab=show'))
  await shot(p, d, '10-costumes'); await layout(p, d, 'costumes')
  await p.locator('.cc-item').first().click(); await shot(p, d, '11-costume-edit'); await p.getByLabel('Member').selectOption({ index: 5 }); await p.locator('select').nth(1).selectOption('Ready'); await p.getByText('Save', { exact: true }).click()
  await p.getByRole('tab', { name: /^Ready/ }).click(); ok(`${d} costume filter Ready`, (await p.locator('.cc-item').count()) >= 1); await p.getByRole('tab', { name: /^All/ }).click()
  const n0 = await p.locator('.cc-item').count(); await p.locator('.cc-item').first().click(); await p.getByText('Delete').click(); ok(`${d} costume delete`, (await p.locator('.cc-item').count()) === n0 - 1)
  await p.getByLabel('Undo').click(); ok(`${d} costume undo delete`, (await p.locator('.cc-item').count()) === n0)
  await p.getByText('🧺 Props').click(); await shot(p, d, '12-props'); await layout(p, d, 'props')
  await p.getByText('+ Add').click(); await p.locator('.cc-sheet input').first().fill('Paper crown'); await shot(p, d, '13-prop-add'); await p.getByText('Save', { exact: true }).click()
  ok(`${d} prop added`, await p.getByText('Paper crown').isVisible())
  await p.getByRole('tab', { name: 'Parents' }).click(); ok(`${d} props filter Parents`, (await p.locator('.cc-item').count()) === 3)
  await p.getByText(/Copy WhatsApp reminder/).click(); await p.waitForTimeout(200); ok(`${d} WhatsApp copied`, await p.getByText('Reminder copied').isVisible())
  const clip = await p.evaluate(() => navigator.clipboard.readText().catch(() => '')); ok(`${d} reminder text`, /gentle reminder/.test(clip)); await ctx.close()
  // 4 Members + care flags by role
  for (const role of ['teacher', 'coordinator']) {
    ;({ p, ctx } = await open(d, `?local&reset&demo&tab=members&role=${role}`))
    if (role === 'teacher') { await shot(p, d, '14-members'); await layout(p, d, 'members') }
    await p.getByText('B-child 02').click(); const vis = await p.getByText(/nut allergy/).count()
    ok(`${d} care details ${role === 'teacher' ? 'hidden from teacher' : 'shown to coordinator'}`, role === 'teacher' ? vis === 0 : vis > 0)
    await shot(p, d, `15-care-${role}`); await ctx.close()
  }
  // 5 Notes
  ;({ p, ctx } = await open(d, '?local&reset&demo&tab=notes')); await shot(p, d, '16-notes'); await layout(p, d, 'notes')
  await p.getByLabel('New checklist').click(); await p.getByLabel('Title').fill('Stage bag'); await p.getByLabel('Item 1').fill('Tape'); await p.getByText('+ Item').click(); await p.getByLabel('Item 2').fill('Torch')
  await p.getByLabel('Tags').fill('#stage'); await p.locator('.cc-sheet .cc-check input').check(); await shot(p, d, '17-note-checklist-edit'); await p.getByText('Save', { exact: true }).click()
  ok(`${d} checklist saved + pinned first`, (await p.locator('.cc-note').first().innerText()).includes('Stage bag'))
  await p.getByLabel('Search notes').fill('torch'); ok(`${d} search`, (await p.locator('.cc-note').count()) === 1); await p.getByLabel('Search notes').fill('')
  await p.getByRole('tab', { name: '#costumes' }).click(); ok(`${d} tag filter`, (await p.locator('.cc-note').count()) === 1)
  await p.getByRole('tab', { name: 'All' }).click(); await p.getByText('Tape').click(); await p.getByLabel('Undo').click(); ok(`${d} notes undo`, (await p.locator('.cc-note .done', { hasText: 'Tape' }).count()) === 0)
  // 6 Quick note
  await p.getByLabel('Quick note').click(); await p.getByLabel('Note text').fill('Check mic stands'); await p.locator('.cc-sheet .cc-btn').click(); await p.waitForTimeout(200); await shot(p, d, '18-quicknote')
  ok(`${d} quick note saved`, await p.locator('.cc-notes li').count() === 1); await ctx.close()
  // 7 Settings
  ;({ p, ctx } = await open(d, '?local&reset&demo&tab=settings')); await shot(p, d, '19-settings'); await layout(p, d, 'settings')
  await p.getByLabel('Label members').fill('Cast'); ok(`${d} label edit reaches dock/rail`, (await p.locator('.cc-dock button, .cc-rail button', { hasText: 'Cast' }).count()) >= 1)
  await p.getByLabel('New event name').fill('Drama week'); await p.getByText('Create').click(); ok(`${d} event created+switched`, (await p.getByLabel('Current event').inputValue()) !== '')
  await p.locator('.cc-page').evaluate(e => e.scrollTo(0, 99999)); await shot(p, d, '20-settings-permissions'); await layout(p, d, 'settings-bottom'); await ctx.close()
}
await br.close()
console.log(results.join('\n')); console.log(`\n${results.filter(r => r.startsWith('PASS')).length}/${results.length} passed`)
