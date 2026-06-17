import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://51.21.159.47:8081',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://51.21.159.47:8081',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://51.21.159.47:8081',
        changeOrigin: true,
      }
    }
  }
})
