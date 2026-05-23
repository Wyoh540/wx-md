import path from 'path';

export function getPreloadScriptPath(dirname: string): string {
  return path.join(dirname, 'index.js');
}
