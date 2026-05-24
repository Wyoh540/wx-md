# AGENTS.md

Compact instruction file for OpenCode / Claude Code sessions.

## Commands

- Web dev: `npm run dev` → http://localhost:5173 (uses `src/renderer/index.html`)
- Electron dev: `npm run start` (uses project-root `index.html`)
- Lint: `npm run lint` (ESLint flat config, zero warnings enforced)
- Web build: `npm run build` → `dist/`
- Electron package: `npm run package` → `out/`
- Electron make: `npm run make`

## Source Layout

- `src/renderer/` — React app. Shared by web and Electron renderer.
- `src/main/` — Electron main process (Node APIs).
- `src/preload/` — Electron preload script (`contextBridge`).

> There is no `electron/` directory at repo root. The `@electron/*` path alias in `tsconfig.json` is stale.

## Build System Quirks

**Two HTML entry points**
- `src/renderer/index.html` — Web-only entry (`vite.config.ts`, `root: 'src/renderer'`).
- `index.html` (project root) — Electron renderer entry (`vite.renderer.config.ts`).

**Three Vite configs for Electron**
- `vite.main.config.ts` — Main process. `@` alias resolves to `src/main/`.
- `vite.preload.config.ts` — Preload script. `@` alias resolves to `src/renderer/`.
- `vite.renderer.config.ts` — Renderer process. `@` alias resolves to `src/renderer/`.

> The web Vite config (`vite.config.ts`) and Electron renderer config (`vite.renderer.config.ts`) are **not** interchangeable. Do not edit one assuming it covers the other.

**Electron Forge**
- Configured in `forge.config.cjs`. Do not confuse with plain Vite commands.

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

- `useElectronFile.ts` checks `window.electronAPI` to branch between Electron and web mode.
- In web mode, all file I/O is disabled gracefully.
