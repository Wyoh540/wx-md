import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron-renderer';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      outDir: isElectron ? 'dist' : 'dist',
      emptyOutDir: true,
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
      // 禁用 CSS 模块化，确保 .min.css 文件能够被正确导入
      modules: false,
    },
    // 确保静态资源能够被正确加载
    assetsInclude: ['**/*.md', '**/*.min.css'],
    // 配置公共基础路径
    base: '/',
    ...(isElectron && {
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      },
    }),
  };
})