import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: false
  },
  server: mode === 'development' ? {
    host: true,
    allowedHosts: ['localhost', "centaurial-gus-stickiest.ngrok-free.dev"],
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: process.env.VITE_WS_URL,
        ws: true, 
        changeOrigin: true,
        secure: false,
      },
    },
  } : undefined,
  plugins: [react()],
}));