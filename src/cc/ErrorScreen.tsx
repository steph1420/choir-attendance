// Calm crash screen (replaces a blank page). Shows the error MESSAGE only, never data.
import { Component, type ReactNode } from 'react'
export function resetDeviceData() {
  const keep = new Set(['curtaincall/passcode', 'choir-attendance/endpoint'])
  try { for (const k of Object.keys(localStorage)) if ((k.startsWith('curtaincall/') || k.startsWith('choir-attendance/')) && !keep.has(k)) localStorage.removeItem(k) } catch { /* ignore */ }
  location.reload()
}
export function ErrorScreen({ error }: { error: unknown }) {
  const msg = (error instanceof Error ? `${error.name}: ${error.message}` : String(error)).slice(0, 300)
  const where = error instanceof Error ? (error.stack ?? '').split('\n').slice(1, 3).map(l => l.trim().replace(/https?:\/\/[^/]+/g, '')).join(' · ').slice(0, 200) : ''
  return <div role="alert" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: 24, background: '#0b0d12', color: '#e8eaf0', fontFamily: 'system-ui, sans-serif', maxWidth: 520, margin: '0 auto' }}>
    <h1 style={{ fontSize: 22, margin: 0 }}>Something went wrong</h1>
    <p style={{ margin: 0, color: '#a9afbd', lineHeight: 1.5 }}>CurtainCall hit a problem on this device. Try Reload first. If it keeps happening, reset this device's app data: everything already saved to the sheet stays safe, only this phone's local copy is cleared (your passcode is kept).</p>
    <button onClick={() => location.reload()} style={{ height: 48, borderRadius: 12, border: 0, background: '#3b82f6', color: '#fff', fontSize: 16, fontWeight: 600 }}>Reload</button>
    <button onClick={() => { if (confirm('Reset this device\'s CurtainCall data? The sheet is not touched.')) resetDeviceData() }} style={{ height: 48, borderRadius: 12, border: '1px solid #3a4150', background: 'transparent', color: '#e8eaf0', fontSize: 15 }}>Reset this device's app data (keeps the sheet safe)</button>
    <p style={{ margin: 0, fontSize: 12, color: '#7d8494' }}>Screenshot this for support:</p>
    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, background: '#151922', padding: 12, borderRadius: 10, color: '#f3b4b4' }}>{msg}{where ? `\n${where}` : ''}{`\nbuild ${__BUILD__}`}</pre>
  </div>
}
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown }
  static getDerivedStateFromError(error: unknown) { return { error } }
  render() { return this.state.error ? <ErrorScreen error={this.state.error} /> : this.props.children }
}
