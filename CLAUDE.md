# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Web Development
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build production web version (outputs to `dist/`)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint with TypeScript checking

### Electron Desktop App
- `npm run start` - Start Electron app in development mode
- `npm run package` - Package Electron app (outputs to `out/`)
- `npm run make` - Build distributable Electron installers

### Docker Deployment
- `docker build -t your-repo/wx-md:latest .` - Build Docker image
- `docker buildx build --platform linux/amd64,linux/arm64 -t your-repo/wx-md:latest --push .` - Build and push multi-platform image
- `make build` - Build project via Makefile
- `make all` - Build, login to registry, build Docker image, and push (requires `DOCKER_PASSWORD` env var)

## Architecture

This is a dual-platform Markdown editor with web and Electron desktop variants. The project uses a shared React codebase with Electron-specific wrapping.

### Core Architecture

**Dual Platform Setup**
- Web: Standard Vite + React setup
- Electron: Uses Electron Forge with Vite plugin for multi-process builds
- Three Vite configs: `vite.main.config.ts` (main process), `vite.preload.config.ts` (preload script), `vite.renderer.config.ts` (renderer process)
- Build mode detection via `process.env.NODE_ENV` and Vite mode

**Theme System**
- ThemeContext (src/contexts/ThemeContext.tsx) manages real-time theme state
- useStore hook (src/hooks/useStore.ts) persists theme/content to localStorage
- Two-way sync: Settings loaded from store → applied to ThemeContext on init; user changes → saved to store + ThemeContext updated
- Theme styles applied as inline styles in preview area (not CSS classes) to match WeChat rendering behavior
- Theme variables processed in getThemeConfig() - CSS variables like `var(--md-theme-color)` are resolved, `em` units converted to `px`

**Markdown Rendering Pipeline**
- src/utils/render.ts: Core rendering with Marked.js → custom renderer → theme styles → DOMPurify sanitization
- src/utils/loadCodeTheme.ts: Dynamic code syntax highlighting theme loading (highlight.js)
- All styling applied as inline HTML styles (not CSS) for WeChat compatibility
- Mac-style code window decorations injected via inline SVG

**State Management Pattern**
- Context API for runtime state (ThemeContext)
- Custom hooks for persistence (useStore, useCopy, useElectronFile)
- No external state management library

### Key Components

**src/pages/MarkdownEditor.tsx**
- Main editor component that orchestrates ThemeContext, useStore, useCopy, and rendering
- Wraps actual editor in ThemeProvider for context availability
- CodeMirror editor (left) + preview pane (right) with three preview modes (responsive/mobile/wide)

**electron/main.ts**
- Electron main process with file I/O via IPC
- Exposes APIs: `open-file`, `save-file`, `save-file-as`, `get-app-version`, `is-electron`
- Menu system in electron/menu.ts
- Preload script bridges IPC calls to window.electronAPI

**src/hooks/useElectronFile.ts**
- Detects Electron environment and provides file operations
- Gracefully handles web-only mode when Electron API unavailable

### File Structure Notes

- `src/config/theme.ts` - Theme style definitions (not theme switching logic)
- `src/config/config.ts` - Default constants
- `src/types/index.ts` - TypeScript interfaces including ElectronAPI
- `public/` - Static assets served directly
- `deploy/` - Docker compose configuration

### Important Constraints

- All preview styling must use inline styles, not CSS classes (WeChat requirement)
- When adding new Markdown elements, update ThemeStyles interface in src/types/index.ts AND add render handling in src/utils/render.ts
- Theme variable resolution (`var(--md-theme-color)`) and unit conversion (`em` → `px`) happens in ThemeContext.getThemeConfig()
- CodeMirror is for editing only - preview rendering is completely separate via render.ts