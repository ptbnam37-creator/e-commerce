import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    base: command === 'serve' ? '/' : '/e-commerce/',
    plugins: [react()],
    server: {
      allowedHosts: ['.ngrok-free.dev', '.ngrok.io'],
    },
  }
})
