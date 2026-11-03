// Boot guard: any startup crash (module-level code in app.tsx, stale data) shows ErrorScreen, never a blank page.
import { createRoot } from 'react-dom/client'
import { ErrorScreen } from './cc/ErrorScreen'
const show = (e: unknown) => { const el = document.getElementById('root')!; if (el.dataset.crashed) return; el.dataset.crashed = '1'; el.innerHTML = ''; createRoot(el).render(<ErrorScreen error={e} />) }
import('./app').catch(show)
