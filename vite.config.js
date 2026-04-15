import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/claude': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/claude/, ''),
      },
      '/api/yt': {
        target: 'https://www.youtube.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yt/, ''),
        // Ask YouTube for uncompressed responses to avoid gzip double-decode issues
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Accept-Encoding', 'identity');
            proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
          });
        },
      },
    },
  },
})
