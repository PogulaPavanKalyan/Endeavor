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
        bypass: (req, res, proxyOptions) => {
          // Resolve local filesystem path for the upload file
          const localPath = path.join(__dirname, '..', 'backend', req.url.split('?')[0]);
          const alternateLocalPath = path.join(__dirname, '..', req.url.split('?')[0]);
          if (!fs.existsSync(localPath) && !fs.existsSync(alternateLocalPath)) {
            // File does not exist locally, redirect to the live staging server
            res.writeHead(302, {
              Location: `https://intelevoresearch.org${req.url}`
            });
            res.end();
            return false;
          }
          return null; // Proceed with proxying to live
        }
      }
    }
  }
})
