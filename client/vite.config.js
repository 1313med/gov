import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (/[\\/]node_modules[\\/](recharts|d3-|victory)[\\/]/.test(id)) return 'vendor-charts';
          if (/[\\/]node_modules[\\/](jspdf|html2canvas)[\\/]/.test(id)) return 'vendor-pdf';
          if (/[\\/]node_modules[\\/](socket\.io-client)[\\/]/.test(id)) return 'vendor-socket';
          return 'vendor';
        },
      },
    },
  },
})
