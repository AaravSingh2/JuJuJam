// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // You can explicitly point to your PostCSS config if needed
  css: {
    postcss: './postcss.config.js'
  }
})