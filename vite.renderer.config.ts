import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig } from 'vite';
import { getConfig } from '@electron-forge/plugin-vite/dist/config/vite.renderer.config';

const srcPath = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig((env) => {
  return mergeConfig(getConfig(env), {
    plugins: [react()],
    resolve: {
      alias: {
        '@': srcPath,
      },
    },
    css: {
      modules: false,
    },
    assetsInclude: ['**/*.md', '**/*.min.css'],
    clearScreen: false,
  });
});
