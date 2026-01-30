import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ai/', // GitHub Pages: https://<user>.github.io/ai/
})
