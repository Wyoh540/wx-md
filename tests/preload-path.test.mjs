import test from 'node:test';
import assert from 'node:assert/strict';

test('getPreloadScriptPath should resolve forge vite preload bundle name', async () => {
  const mod = await import('../src/main/preloadPath.ts');

  assert.equal(mod.getPreloadScriptPath('E:/github/wx-md/.vite/build'), 'E:\\github\\wx-md\\.vite\\build\\index.js');
});
