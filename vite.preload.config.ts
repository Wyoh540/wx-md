import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import { getConfig } from '@electron-forge/plugin-vite/dist/config/vite.preload.config';

const srcPath = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig((env) => {
  return mergeConfig(getConfig(env), {
    resolve: {
      alias: {
        '@': srcPath,
      },
    },
  });
});
