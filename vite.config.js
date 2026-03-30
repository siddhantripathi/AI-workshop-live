import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /api/analyze to the n8n webhook during local development
    // so the Vercel serverless function path works identically in dev and prod
    proxy: {
      '/api/analyze': {
        target: 'https://tripps.app.n8n.cloud/webhook/youtube-aggregator',
        changeOrigin: true,
        rewrite: () => '',
      },
    },
  },
})
