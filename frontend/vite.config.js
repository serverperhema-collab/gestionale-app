import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://127.0.0.1:3002',
      '/uploads': 'http://127.0.0.1:3002',
      '/portal-auth.js': 'http://127.0.0.1:3002',
      '^/commerciale(?:\\.html)?(?:\\?|$)': 'http://127.0.0.1:3002',
      '^/cliente(?:\\.html)?(?:\\?|$)': 'http://127.0.0.1:3002'
    }
  }
})
