import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://intelevoresearch.org',
        changeOrigin: true,
      },
      '/auth': {
        target: 'https://intelevoresearch.org',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://intelevoresearch.org',
        changeOrigin: true,
      }
    }
  }
})
