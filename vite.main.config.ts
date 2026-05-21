import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import { getConfig } from '@electron-forge/plugin-vite/dist/config/vite.main.config';

const srcPath = fileURLToPath(new URL('./src/main', import.meta.url));

export default defineConfig((env) => {
  return mergeConfig(getConfig(env), {
    resolve: {
      alias: {
        '@': srcPath,
      },
    },
    build: {
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs',
        },
      },
    },
  });
});
