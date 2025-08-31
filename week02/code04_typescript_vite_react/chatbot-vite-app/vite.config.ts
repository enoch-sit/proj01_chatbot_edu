import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Use same port as CRA for consistency
    open: true, // Auto-open browser
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Generate source maps for debugging
  },
  css: {
    devSourcemap: true, // CSS source maps in development
  }
})
