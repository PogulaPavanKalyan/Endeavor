import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('gsap') || id.includes('aos')) {
              return 'vendor-animation';
            }
            if (id.includes('react-slick') || id.includes('slick-carousel')) {
              return 'vendor-slick';
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://intelevoresearch.org',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'https://intelevoresearch.org',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://intelevoresearch.org',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
