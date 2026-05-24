# Custom React Hooks

**Domain**: State management and side effects for the renderer process.

## Structure

```
src/renderer/hooks/
├── useStore.ts            # 250 lines — localStorage persistence
├── useTabs.ts             # 128 lines — multi-tab management
├── useFileTree.ts         # 148 lines — file explorer state
├── useWorkspaceState.ts   # 45 lines — workspace save/restore
├── useCopy.ts             # Clipboard / WeChat format copy
├── useElectronFile.ts     # Electron vs web branching
├── useWeChatDraft.ts      # WeChat draft article helpers
└── useWeChatConfig.ts     # WeChat settings persistence
```

## Hook Dependencies

```
useStore ──→ localStorage (theme, content, settings)
useTabs ──→ window.electronAPI.readFile (open tab)
useFileTree ──→ window.electronAPI.* (file ops)
useWorkspaceState ──→ window.electronAPI.* (state persistence)
```

## Key Patterns

- **useStore**: Two-way sync. Settings loaded from localStorage → applied to ThemeContext on init; user changes → saved to store + ThemeContext updated.
- **useTabs**: `tabsRef` mirrors `tabs` state for synchronous access in callbacks. `openFile()` checks `tabsRef.current` for duplicates before creating new tab.
- **useFileTree**: `loadDirectory()` reads tree but **does not** set `rootPath`. Caller must call `setRootPath()` separately.
- **useWorkspaceState**: `onSaveWorkspaceState()` registers a listener for the `save-workspace-state` custom event dispatched by preload script before window close.

## Anti-Patterns

- Do **not** add Redux/Zustand — project uses Context + custom hooks intentionally
- Do **not** call `loadDirectory()` expecting it to set `rootPath` — it only updates `tree`
- `useTabs.openFile()` must check `tabsRef.current` (not `tabs` state) to avoid stale closures

## Notes

- `useElectronFile` is the single source of truth for Electron environment detection
- `useFileTree.setRootPath` is exposed for workspace restoration (MarkdownEditor.tsx)
- All hooks that call `window.electronAPI` silently return null/false when API is unavailable (web mode)
