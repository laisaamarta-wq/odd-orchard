import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Presentation-only Behance case study, built separately so the production
// bundle (vite.config.js) stays byte-for-byte what it was.
//   npm run behance:dev   → http://localhost:5174/behance/
//   npm run build         → also emits dist/behance/
export default defineConfig({
  root: resolve(import.meta.dirname, 'behance'),
  base: '/behance/',
  publicDir: resolve(import.meta.dirname, 'public'),
  plugins: [react()],
  server: { port: 5174 },
  build: {
    outDir: resolve(import.meta.dirname, 'dist/behance'),
    emptyOutDir: false,
    copyPublicDir: false,
  },
})
