import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '')

  return {
    base: '/eticket/',
    plugins: [react(),tailwindcss(),],
    server: {
      allowedHosts: [process.env.ALLOWED_HOST, `.${process.env.ALLOWED_HOST}`],
      // allowedHosts: [env.ALLOWED_HOST, `.${env.ALLOWED_HOST}`],
    },
  }
})