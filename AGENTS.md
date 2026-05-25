# AGENTS.md

Compact instruction file for OpenCode / Claude Code sessions.

## Commands

- Electron dev: `npm run start`
- Type-check: `npm run build` (`tsc --noEmit`)
- Lint: `npm run lint` (ESLint flat config, zero warnings enforced)
- Electron package: `npm run package` → `out/`
- Electron make: `npm run make`

## Source Layout

- `src/renderer/` — React app (Electron renderer process).
- `src/main/` — Electron main process (Node APIs).
- `src/preload/` — Electron preload script (`contextBridge`).

## Build System

**HTML entry point**
- `index.html` (project root) — Electron renderer entry (`vite.renderer.config.ts`).

**Vite configs**
- `vite.main.config.ts` — Main process. `@` alias resolves to `src/main/`.
- `vite.preload.config.ts` — Preload script. `@` alias resolves to `src/renderer/`.
- `vite.renderer.config.ts` — Renderer process. `@` alias resolves to `src/renderer/`.

**Electron Forge**
- Configured in `forge.config.cjs`.

## TypeScript & Lint Constraints

- `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`.
- Never suppress type errors with `as any`, `@ts-ignore`, or `@ts-expect-error`.
- ESLint ignores: `dist`, `src/renderer/dist`, `.vite`, `out`.

## WeChat Rendering Constraints

- Preview HTML must use **inline styles only** — no CSS classes. WeChat strips external CSS.
- When adding new Markdown elements, update both:
  - `src/renderer/types/index.ts` (`ThemeStyles` interface)
  - `src/renderer/utils/render.ts` (render handling)
- See `CLAUDE.md` for the full rendering pipeline.

## State & Styling

- No Redux/Zustand. Uses React Context (`ThemeContext`) + custom hooks (`useStore`, `useCopy`, `useElectronFile`).
- TailwindCSS + PostCSS for UI chrome. Less/CSS for some editor pieces.
- `src/renderer/dist/` exists in source tree but is a stale build artifact; do not edit it.

## Component Hierarchy

```
MarkdownEditor
├── FileExplorer ── FileTree (recursive)
├── TabBar
├── Toolbar
└── CodeMirror + Preview
```

- `FileExplorer` manages selection state (`selectedPath`) and context menu actions.
- `FileTree` is a recursive component; each node wraps in `<div data-file-node>`.

## Right-Click Behavior

- VSCode-style single selection: only one file/folder highlighted at a time.
- Right-click selects the target node immediately.
- Context menu uses `useRef` (not `useState`) for synchronous node access to avoid React batching issues.
- Menu items use `disabled` prop (not conditional rendering) to avoid Radix UI animation glitches.

## Workspace Persistence

- Saved on window close via `save-workspace-state` IPC event → `~/.wx-md/workspace-state.json`.
- Restored on app start: must call `setRootPath(state.rootPath)` before `loadDirectory(state.rootPath)`.
- `loadDirectory` reads the tree but does **not** set `rootPath`.

## Environment Detection

- `useElectronFile.ts` checks `window.electronAPI` to confirm Electron environment.
- File I/O is available only when `window.electronAPI` is present.
