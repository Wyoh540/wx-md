import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  resolve: {
    alias: {
      '@': '/src/renderer',
    },
  },
  server: {
    watch: {
      ignored: ['**/node_modules/**']
    }
  },
  optimizeDeps: {
    exclude: []
  },
  css: {
    modules: false,
  },
  assetsInclude: ['**/*.md', '**/*.min.css'],
  base: '/',
});