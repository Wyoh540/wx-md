import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
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
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
});