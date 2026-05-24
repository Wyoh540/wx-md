# Electron Main Process

**Domain**: Electron main process with IPC handlers for file operations.

## Structure

```
src/main/
├── index.ts          # 356 lines — all IPC handlers, window management
├── preloadPath.ts    # Preload script path resolution
└── wechat.ts         # WeChat API wrappers
```

## IPC Handlers

All handlers registered in `index.ts` via `ipcMain.handle()`:

| Channel | Handler | Notes |
|---------|---------|-------|
| `open-file` | File dialog → read content | Sets `currentFilePath` |
| `save-file` | Write to `currentFilePath` | Returns false if no path |
| `save-file-as` | Save dialog → write | Updates `currentFilePath` |
| `open-directory` | Directory dialog | Returns single path |
| `read-directory` | Recursive dir scan | Depth limit: 15; skips `node_modules` and dotfiles |
| `read-file` | Read file by path | Returns null on failure |
| `save-file-by-path` | Write file by path | Used by tab save |
| `create-file` | Write empty file | Returns filePath or null |
| `create-directory` | `fs.mkdir(recursive)` | Returns dirPath or null |
| `delete-file` | `fs.unlink` | |
| `delete-directory` | `fs.rm(recursive, force)` | |
| `rename-file` | `fs.rename` | |
| `rename-directory` | `fs.rename` | |
| `read-workspace-state` | Read `~/.wx-md/workspace-state.json` | Returns null if not exists |
| `write-workspace-state` | Write workspace state | Creates `~/.wx-md/` if needed |
| `close-window` | `mainWindow.destroy()` | |
| `wechat-*` | Delegates to `wechat.ts` | See wechat.ts |

## Conventions

- IPC channel naming: kebab-case (`action-name`)
- All file I/O uses `fs.promises`
- Error handling: `try/catch` with `console.error`, return null/false on failure
- `currentFilePath` tracks the last opened file for `save-file` convenience

## Anti-Patterns

- Never enable `nodeIntegration: true` — use `contextBridge` via preload
- Never set `contextIsolation: false`
- Window close handler **must not** call `app.quit()` directly — send `save-workspace-state` to renderer first

## Notes

- `MAIN_WINDOW_VITE_DEV_SERVER_URL` and `MAIN_WINDOW_VITE_NAME` are injected by Electron Forge Vite plugin
- Dev mode loads URL; production loads file from `../renderer/{NAME}/index.html`
- `webSecurity` is disabled only in development for local file access
