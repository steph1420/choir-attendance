import { createRoot } from 'react-dom/client'
import '../driftline/tokens/dist/tokens.css'
import '../driftline/react/src/driftline.css'
import './mock.css'
import { ThemeProvider } from '../driftline/react/src'
import { MockApp } from './MockApp'
const q = new URLSearchParams(location.search)
createRoot(document.getElementById('root')!).render(
  <ThemeProvider initial={{ theme: q.get('theme') ?? 'utopian-night' }}><MockApp q={q} /></ThemeProvider>)
