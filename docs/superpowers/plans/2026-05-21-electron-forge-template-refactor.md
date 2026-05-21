# Electron Forge Template Structure Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor wx-md project from custom directory structure to official Electron Forge Vite template structure

**Architecture:** Move electron/ code to src/main/ and src/preload/, move React app to src/renderer/, update all configuration files to reflect new paths

**Tech Stack:** Electron Forge, Vite, TypeScript, React

---

## File Structure Map

**Files to create:**
- `src/main/index.ts` - Main process entry (moved from electron/main.ts)
- `src/main/menu.ts` - Menu configuration (moved from electron/menu.ts)
- `src/preload/index.ts` - Preload script (moved from electron/preload.ts)

**Files to modify:**
- `forge.config.cjs` - Update entry paths for main and preload
- `vite.main.config.ts` - Update srcPath to src/main
- `vite.preload.config.ts` - Update srcPath to src/preload
- `vite.renderer.config.ts` - Update root to src/renderer
- `vite.config.ts` - Update or clarify web-only dev mode

**Directories to move:**
- `electron/*` → `src/main/*` and `src/preload/*`
- `src/*` → `src/renderer/*`

---

## Task 1: Create src/main directory and move main process files

**Files:**
- Move: `electron/main.ts` → `src/main/index.ts`
- Move: `electron/menu.ts` → `src/main/menu.ts`

- [ ] **Step 1: Create src/main directory**

```bash
mkdir -p src/main
```

Expected: Directory created

- [ ] **Step 2: Move main.ts to src/main/index.ts**

```bash
mv electron/main.ts src/main/index.ts
```

Expected: File moved

- [ ] **Step 3: Move menu.ts to src/main/menu.ts**

```bash
mv electron/menu.ts src/main/menu.ts
```

Expected: File moved

- [ ] **Step 4: Verify menu import in src/main/index.ts**

```bash
grep "import.*menu" src/main/index.ts
```

Expected: Output shows `import { createMenu } from './menu';` (no change needed, relative import stays same)

- [ ] **Step 5: Verify src/main directory contents**

```bash
ls -la src/main/
```

Expected: Output shows `index.ts` and `menu.ts`

- [ ] **Step 6: Commit main process migration**

```bash
git add src/main/ electron/main.ts electron/menu.ts
git commit -m "refactor: move main process code to src/main/

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Expected: Commit created

---

## Task 2: Create src/preload directory and move preload script

**Files:**
- Move: `electron/preload.ts` → `src/preload/index.ts`

- [ ] **Step 1: Create src/preload directory**

```bash
mkdir -p src/preload
```

Expected: Directory created

- [ ] **Step 2: Move preload.ts to src/preload/index.ts**

```bash
mv electron/preload.ts src/preload/index.ts
```

Expected: File moved

- [ ] **Step 3: Verify src/preload directory contents**

```bash
ls -la src/preload/
```

Expected: Output shows `index.ts`

- [ ] **Step 4: Commit preload migration**

```bash
git add src/preload/ electron/preload.ts
git commit -m "refactor: move preload script to src/preload/

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Expected: Commit created

---

## Task 3: Move renderer code to src/renderer

**Files:**
- Move: `src/*` → `src/renderer/*`

- [ ] **Step 1: Create src/renderer directory**

```bash
mkdir -p src/renderer
```

Expected: Directory created

- [ ] **Step 2: Move all renderer files to src/renderer**

```bash
mv src/App.tsx src/components src/config src/contexts src/hooks src/pages src/styles src/types src/utils src/main.tsx src/vite-env.d.ts src/assets src/renderer/
```

Expected: All files moved to src/renderer/

- [ ] **Step 3: Verify src/renderer directory contents**

```bash
ls -la src/renderer/
```

Expected: Output shows App.tsx, main.tsx, components/, contexts/, hooks/, pages/, utils/, config/, types/, styles/, vite-env.d.ts, assets/

- [ ] **Step 4: Commit renderer migration**

```bash
git add src/renderer/
git commit -m "refactor: move renderer code to src/renderer/

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Expected: Commit created

---

## Task 4: Update forge.config.cjs entry paths

**Files:**
- Modify: `forge.config.cjs`

- [ ] **Step 1: Read current forge.config.cjs**

```bash
cat forge.config.cjs
```

Expected: Shows current configuration with `electron/main.ts` and `electron/preload.ts`

- [ ] **Step 2: Update main entry path in forge.config.cjs**

```bash
sed -i "s|entry: 'electron/main.ts'|entry: 'src/main/index.ts'|g" forge.config.cjs
```

Expected: Entry path updated

- [ ] **Step 3: Update preload entry path in forge.config.cjs**

```bash
sed -i "s|entry: 'electron/preload.ts'|entry: 'src/preload/index.ts'|g" forge.config.cjs
```

Expected: Entry path updated

- [ ] **Step 4: Verify changes in forge.config.cjs**

```bash
grep -A 10 "build:" forge.config.cjs
```

Expected: Shows `entry: 'src/main/index.ts'` and `entry: 'src/preload/index.ts'`

- [ ] **Step 5: Commit forge.config.cjs changes**

```bash
git add forge.config.cjs
git commit -m "refactor: update forge.config entry paths to new structure

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Expected: Commit created

---

## Task 5: Update vite.main.config.ts

**Files:**
- Modify: `vite.main.config.ts`

- [ ] **Step 1: Read current vite.main.config.ts**

```bash
cat vite.main.config.ts
```

Expected: Shows current srcPath pointing to `./src`

- [ ] **Step 2: Update srcPath to point to src/main**

```bash
sed -i "s|new URL('./src', import.meta.url)|new URL('./src/main', import.meta.url)|g" vite.main.config.ts
```

Expected: srcPath updated

- [ ] **Step 3: Verify changes in vite.main.config.ts**

```bash
grep "srcPath" vite.main.config.ts
```

Expected: Shows `new URL('./src/main', import.meta.url)`

- [ ] **Step 4: Commit vite.main.config.ts changes**

```bash
git add vite.main.config.ts
git commit -m "refactor: update vite.main.config.ts srcPath to src/main

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Expected: Commit created

---

## Task 6: Update vite.preload.config.ts

**Files:**
- Modify: `vite.preload.config.ts`

- [ ] **Step 1: Read current vite.preload.config.ts**

```bash
cat vite.preload.config.ts
```

Expected: Shows current srcPath pointing to `./src`

- [ ] **Step 2: Update srcPath to point to src/preload**

```bash
sed -i "s|new URL('./src', import.meta.url)|new URL('./src/preload', import.meta.url)|g" vite.preload.config.ts
```

Expected: srcPath updated

- [ ] **Step 3: Verify changes in vite.preload.config.ts**

```bash
grep "srcPath" vite.preload.config.ts
```

Expected: Shows `new URL('./src/preload', import.meta.url)`

- [ ] **Step 4: Commit vite.preload.config.ts changes**

```bash
git add vite.preload.config.ts
git commit -m "refactor: update vite.preload.config.ts srcPath to src/preload

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Expected: Commit created

---

## Task 7: Update vite.renderer.config.ts

**Files:**
- Modify: `vite.renderer.config.ts`

- [ ] **Step 1: Read current vite.renderer.config.ts**

```bash
cat vite.renderer.config.ts
```

Expected: Shows current configuration

- [ ] **Step 2: Update root to src/renderer**

```bash
sed -i "s|root: 'src'|root: 'src/renderer'|g" vite.renderer.config.ts
```

Expected: root path updated

- [ ] **Step 3: Verify changes in vite.renderer.config.ts**

```bash
grep "root:" vite.renderer.config.ts
```

Expected: Shows `root: 'src/renderer'`

- [ ] **Step 4: Commit vite.renderer.config.ts changes**

```bash
git add vite.renderer.config.ts
git commit -m "refactor: update vite.renderer.config.ts root to src/renderer

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Expected: Commit created

---

## Task 8: Update vite.config.ts for web dev mode

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Read current vite.config.ts**

```bash
cat vite.config.ts
```

Expected: Shows current web dev configuration

- [ ] **Step 2: Update root to src/renderer and alias**

```bash
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  resolve: {
    alias: {
      '@': '/src/renderer',
    },
  },
  server: {
    watch: {
      ignored: ['**/node_modules/**']
    }
  },
  optimizeDeps: {
    exclude: []
  },
  css: {
    modules: false,
  },
  assetsInclude: ['**/*.md', '**/*.min.css'],
  base: '/',
});
EOF
```

Expected: vite.config.ts updated

- [ ] **Step 3: Verify changes in vite.config.ts**

```bash
cat vite.config.ts
```

Expected: Shows root: 'src/renderer' and alias pointing to src/renderer

- [ ] **Step 4: Commit vite.config.ts changes**

```bash
git add vite.config.ts
git commit -m "refactor: update vite.config.ts root and alias for web dev

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Expected: Commit created

---

## Task 9: Update index.html path references

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Read current index.html**

```bash
cat index.html
```

Expected: Shows current HTML entry point

- [ ] **Step 2: Update script src path to src/renderer/main.tsx**

```bash
sed -i "s|src=\"/src/main.tsx\"|src=\"/src/renderer/main.tsx\"|g" index.html
```

Expected: Script path updated

- [ ] **Step 3: Verify changes in index.html**

```bash
grep "script" index.html
```

Expected: Shows `src="/src/renderer/main.tsx"`

- [ ] **Step 4: Commit index.html changes**

```bash
git add index.html
git commit -m "refactor: update index.html script path to src/renderer

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Expected: Commit created

---

## Task 10: Test Electron dev mode

**Files:**
- No files modified - verification task

- [ ] **Step 1: Clean previous build artifacts**

```bash
rm -rf .vite out
```

Expected: Build artifacts removed

- [ ] **Step 2: Run Electron dev mode**

```bash
npm run start
```

Expected: Electron app launches successfully

Wait 10 seconds for app to fully load, then verify window opens

- [ ] **Step 3: Stop Electron app**

Press Ctrl+C to stop

Expected: App stops gracefully

---

## Task 11: Test web dev mode

**Files:**
- No files modified - verification task

- [ ] **Step 1: Clean previous build artifacts**

```bash
rm -rf dist
```

Expected: Build artifacts removed

- [ ] **Step 2: Run web dev mode**

```bash
npm run dev
```

Expected: Vite dev server starts on http://localhost:5173

Wait 5 seconds for server to start

- [ ] **Step 3: Stop web dev server**

Press Ctrl+C to stop

Expected: Server stops gracefully

---

## Task 12: Test packaging

**Files:**
- No files modified - verification task

- [ ] **Step 1: Clean previous packaging artifacts**

```bash
rm -rf out
```

Expected: Packaging artifacts removed

- [ ] **Step 2: Run Electron package command**

```bash
npm run package
```

Expected: Build completes successfully, out/ directory created with packaged app

- [ ] **Step 3: Verify out directory contents**

```bash
ls -la out/
```

Expected: Shows packaged application files

---

## Task 13: Test installer creation

**Files:**
- No files modified - verification task

- [ ] **Step 1: Run Electron make command**

```bash
npm run make
```

Expected: Build completes successfully, installer created in make/ directory

- [ ] **Step 2: Verify make directory contents**

```bash
ls -la make/
```

Expected: Shows installer files (e.g., squirrel setup.exe)

---

## Task 14: Cleanup empty electron directory

**Files:**
- Remove: `electron/` directory

- [ ] **Step 1: Verify electron directory is empty**

```bash
ls -la electron/
```

Expected: Directory is empty (no .ts files)

- [ ] **Step 2: Remove empty electron directory**

```bash
rmdir electron/
```

Expected: Directory removed

- [ ] **Step 3: Commit cleanup**

```bash
git add electron/
git commit -m "refactor: remove empty electron directory

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Expected: Commit created

---

## Task 15: Final verification

**Files:**
- No files modified - final verification task

- [ ] **Step 1: Verify final directory structure**

```bash
ls -la src/
ls -la src/main/
ls -la src/preload/
ls -la src/renderer/
```

Expected:
- src/ contains main/, preload/, renderer/
- src/main/ contains index.ts, menu.ts
- src/preload/ contains index.ts
- src/renderer/ contains App.tsx, main.tsx, components/, contexts/, hooks/, pages/, utils/, config/, types/, styles/

- [ ] **Step 2: Verify git status is clean**

```bash
git status
```

Expected: No uncommitted changes

- [ ] **Step 3: Run all build commands once more**

```bash
npm run build
```

Expected: Web build completes successfully

```bash
npm run start &
```

Wait 10 seconds

```bash
pkill -f electron
```

Expected: Electron builds and runs successfully

- [ ] **Step 4: Create summary commit**

```bash
git commit --allow-empty -m "refactor: complete Electron Forge template structure migration

All files moved to official Electron Forge Vite template structure:
- electron/ → src/main/ and src/preload/
- src/ → src/renderer/
- All configuration files updated

Verified:
- npm run start (Electron dev) ✓
- npm run dev (Web dev) ✓
- npm run build (Web build) ✓

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Expected: Commit created

---

## Self-Review

**Spec coverage:**
- Directory structure migration: Tasks 1-3
- Configuration updates: Tasks 4-9
- Build verification: Tasks 10-13
- Cleanup: Task 14
- Final verification: Task 15

**Placeholder scan:**
- No TBD/TODO found
- All code blocks are complete
- All file paths are exact
- All commands are complete

**Type consistency:**
- src/main/index.ts (not main.ts)
- src/preload/index.ts (not preload.ts)
- All paths consistent across tasks

**Scope check:**
- Plan covers complete refactoring in single execution
- Each task is self-contained and verifiable
- Tasks can be executed independently