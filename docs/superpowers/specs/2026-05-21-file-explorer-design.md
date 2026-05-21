# File Explorer & Multi-Tab Design

**Date:** 2026-05-21
**Scope:** Electron desktop app only

---

## Overview

Add a VSCode-style file explorer sidebar with multi-tab editing to the wx-md Electron desktop app. Users can open a root folder, browse a recursive directory tree, and open multiple Markdown files simultaneously in tabs.

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  Toolbar（主题/字体/复制等按钮，全宽）                    │
├──────────┬──────────────────────────────────────────┤
│  侧边栏   │  标签栏（Tab1 | Tab2 | Tab3 × ）          │
│          ├────────────────┬─────────────────────────┤
│  文件树   │  CodeMirror    │  预览面板               │
│          │  编辑器         │                         │
│  [折叠]  │                │                         │
└──────────┴────────────────┴─────────────────────────┘
```

- Sidebar width: 240px, collapsible to 0 with a toggle button on the edge
- TabBar spans full width above editor + preview panes
- When sidebar is collapsed, editor + preview fill the full width

---

## Data Types

```typescript
interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface Tab {
  id: string;
  filePath: string;
  title: string;
  content: string;
  isDirty: boolean;
}
```

---

## IPC API (Main Process)

Two new handlers added to `src/main/index.ts`:

| Channel | Input | Output | Description |
|---------|-------|--------|-------------|
| `open-directory` | — | `string \| null` | Shows OS folder picker, returns selected path |
| `read-directory` | `dirPath: string` | `FileNode[]` | Recursively reads directory, returns tree JSON |

`read-directory` skips hidden files/folders (names starting with `.`) and `node_modules`.

`ElectronAPI` interface extended with:
```typescript
openDirectory(): Promise<string | null>;
readDirectory(dirPath: string): Promise<FileNode[]>;
```

---

## State Management

### `useFileTree` hook
- State: `rootPath: string | null`, `tree: FileNode[]`, `expandedPaths: Set<string>`
- `openFolder()` — calls `openDirectory` IPC, then `readDirectory` IPC, stores result
- `toggleExpand(path)` — toggle directory open/close (local state only, not persisted)
- `refresh()` — re-calls `readDirectory` on current rootPath

### `useTabs` hook
- State: `tabs: Tab[]`, `activeTabId: string | null`
- `openFile(filePath)` — if file already open, activate its tab; otherwise call `open-file` IPC, create new tab
- `closeTab(id)` — if `isDirty`, show confirmation dialog before closing
- `setTabContent(id, content)` — update content + mark `isDirty = true`
- `saveTab(id)` — calls `save-file` IPC, clears `isDirty`
- `saveTabAs(id)` — calls `save-file-as` IPC, updates filePath + title, clears `isDirty`
- Active tab's `content` is passed to CodeMirror as the editor value

Existing `useStore`, `useElectronFile` remain unchanged.

---

## Components

### New Components

**`FileExplorer.tsx`**
- Props: `onFileOpen: (path: string) => void`
- Contains "打开文件夹" button at top
- Renders `FileTree` with current tree data
- Shows toggle button (chevron icon) to collapse/expand the sidebar
- When no folder is open, shows placeholder text: "点击「打开文件夹」开始"

**`FileTree.tsx`**
- Props: `nodes: FileNode[]`, `expandedPaths: Set<string>`, `onToggle: (path) => void`, `onFileClick: (path) => void`, `activeFilePath?: string`
- Recursive component: directories show expand/collapse arrow + folder icon, files show file icon
- Only `.md`, `.markdown`, `.txt` files are clickable; other file types shown greyed out
- Active file (currently open in active tab) highlighted

**`TabBar.tsx`**
- Props: `tabs: Tab[]`, `activeTabId: string | null`, `onSelect: (id) => void`, `onClose: (id) => void`
- Each tab shows filename, unsaved indicator (`•`) if `isDirty`
- Close button (×) on each tab
- Horizontally scrollable if many tabs open
- Shows "无打开文件" placeholder when no tabs

### Modified Components

**`MarkdownEditor.tsx`**
- Integrates `useFileTree` and `useTabs`
- Layout updated: sidebar + editor area side by side
- Editor content driven by `useTabs` active tab content instead of `useStore` content directly
- CodeMirror `onChange` calls `setTabContent` on active tab
- Sidebar collapse state (`sidebarCollapsed: boolean`) managed here

**`src/renderer/types/index.ts`**
- Add `FileNode`, `Tab` interfaces
- Extend `ElectronAPI` with `openDirectory` and `readDirectory`

**`src/renderer/styles/editor.css`**
- Add `.sidebar`, `.sidebar-collapsed`, `.tab-bar`, `.tab-item`, `.tab-item-active`, `.tab-item-dirty`, `.file-tree`, `.file-tree-node`, `.sidebar-toggle` styles

---

## Error Handling

- `read-directory` IPC: if path unreadable, returns empty array; renderer shows "无法读取目录"
- Closing a dirty tab: confirm dialog "文件未保存，确定关闭？" with 确定 / 取消
- If `open-file` IPC returns null (user cancelled), do not create a tab

---

## Out of Scope

- File system watching / auto-refresh on external changes
- Drag-and-drop file reordering in tabs
- Renaming or deleting files from the explorer
- Web version support
