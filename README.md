# Choir Attendance (A-02)

Phone/tablet web app for choir practice attendance, LUCID design. **v0.1.0 = first milestone: the marking screen.**

## What works (v0.1.0)
- Marking screen: P · A · combined **L/E** (popup right below: Late / Excused + optional reason) · **⋯** (Left early, Add remark/stars, Child history stub, Clear mark).
- Tap a child's name → remark + 1–5 proficiency stars sheet; note dot on rows with a remark/stars.
- Group by **Section / Role / A–Z**; A–Z strip ported from LFPS-SOW v0.45.0 (idle 42, letters ≥ 11px), movable left/right.
- All present (fills only unmarked), optional *Taken by*, live counts (Late = attended, Excused = present by default).
- Saved on the device (localStorage); every change goes into a sync queue; status dot shows Synced / Syncing N / Offline · N queued. Sync uses a **fake** endpoint until you set a real URL.
- Placeholder sample data only (`A-child 01`…). Real names are only read at runtime from the sheet.

## Run
```bash
npm install
npm run dev        # http://localhost:5173  (?reset clears local data, ?demo adds sample marks, ?offline simulates offline)
npm test           # vitest
npm run build      # dist/ opens from any static host / GitHub Pages
node shots/shots.mjs   # headless Chrome screenshots → shots/*.png (needs a build)
```

## Google Sheet setup (draft — not yet connected in v0.1.0)
1. Create a **new** Google Sheet "Choir Attendance" (do not use the school roster sheet).
2. Extensions → Apps Script → paste `apps-script/Code.gs` → run `setup()` once (creates the 8 tabs).
3. Project Settings → Script properties → `ROSTER_SHEET_ID` = the roster sheet's ID (read-only use).
4. Deploy → New deployment → Web app → Execute as *Me*, access *Anyone with the link*. Copy the URL.
5. In the app (v0.2 Settings; for now browser console): `localStorage.setItem('choir-attendance/endpoint', '<URL>')`, reload.
6. Manual fixes: type rows in **Manual Edits**; the next sync applies them and stamps *Applied*.

## Structure
`src/config.ts` (all limits) · `src/data/` model, store (single data layer), sync (interface + Fake + AppsScript), derive · `src/az/` A–Z port · `src/ui/` screens · `test/` · `apps-script/Code.gs`.
