import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    hmr: {
      overlay: false // Tắt error overlay nếu muốn
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Bỏ qua warnings từ browser extensions
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        warn(warning)
      }
    }
  }
})
