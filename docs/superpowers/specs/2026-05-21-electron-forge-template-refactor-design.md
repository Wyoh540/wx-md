---
name: electron-forge-template-refactor
description: Refactor wx-md project to use official Electron Forge Vite template directory structure
---

# Electron Forge Template Structure Refactoring

## Overview

Refactor the wx-md project from custom directory structure to the official Electron Forge Vite template structure.

## Target Directory Structure

**Current → Target:**

```
electron/main.ts       → src/main/index.ts
electron/menu.ts       → src/main/menu.ts
electron/preload.ts    → src/preload/index.ts
src/*                  → src/renderer/*
```

**Final structure:**
```
wx-md/
├── src/
│   ├── main/
│   │   ├── index.ts
│   │   └── menu.ts
│   ├── preload/
│   │   └── index.ts
│   └── renderer/
│       ├── App.tsx
│       ├── main.tsx
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── pages/
│       ├── utils/
│       ├── config/
│       ├── types/
│       └── styles/
├── index.html
├── forge.config.cjs
├── vite.main.config.ts
├── vite.preload.config.ts
├── vite.renderer.config.ts
└── package.json
```

## Configuration Updates

### forge.config.cjs

Update entry paths:
```javascript
entry: 'src/main/index.ts',      // was: electron/main.ts
entry: 'src/preload/index.ts',   // was: electron/preload.ts
```

### vite.main.config.ts

Update srcPath:
```typescript
const srcPath = fileURLToPath(new URL('./src/main', import.meta.url));
```

### vite.preload.config.ts

Update srcPath:
```typescript
const srcPath = fileURLToPath(new URL('./src/preload', import.meta.url));
```

### vite.renderer.config.ts

Update root:
```typescript
export default defineConfig({
  root: 'src/renderer',
  // ... rest of config
})
```

### vite.config.ts (web dev)

Remove or keep for web-only development mode.

## Code Updates Required

### Main process imports

Update menu import in `src/main/index.ts`:
```typescript
import { createMenu } from './menu';  // was: ./menu (same, but now in src/main/)
```

### Renderer process

No code changes needed - files are moved to src/renderer/ but internal imports remain relative.

### Type declarations

Update any path-related type declarations.

## Build Verification

After refactoring, verify:
1. `npm run start` - Electron dev mode works
2. `npm run dev` - Web dev mode works (if still supported)
3. `npm run package` - Packaging works
4. `npm run make` - Installer creation works

## Cleanup

Remove empty `electron/` directory after migration.