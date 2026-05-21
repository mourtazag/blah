import { defineConfig } from 'vite'

export default defineConfig({
  root: 'playground',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
})
