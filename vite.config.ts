import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ base: './', plugins: [react()], define: { __BUILD__: JSON.stringify(new Date().toISOString().slice(0, 16)) }, test: { environment: 'jsdom', globals: true } } as never)
