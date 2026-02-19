import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: false
  },
  server: {
    host: true,
    port: 5173
  },
  plugins: [react()],
})
