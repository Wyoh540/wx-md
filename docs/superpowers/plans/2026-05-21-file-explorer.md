# File Explorer & Multi-Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a collapsible VSCode-style file explorer sidebar with multi-tab editing to the Electron desktop app.

**Architecture:** Left sidebar (240px, collapsible) with recursive directory tree → clicking a `.md`/`.txt` file opens it in a new tab above the editor. Tab state managed by `useTabs` hook; directory tree managed by `useFileTree` hook. Four new IPC channels in main process handle folder/file I/O by path.

**Tech Stack:** React, TypeScript, Electron IPC, `fs/promises`, existing CodeMirror + Vite setup

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/renderer/types/index.ts` | Add `FileNode`, `Tab` types; extend `ElectronAPI` |
| Modify | `src/preload/index.ts` | Expose 4 new IPC calls via contextBridge |
| Modify | `src/main/index.ts` | Add `open-directory`, `read-directory`, `read-file`, `save-file-by-path` IPC handlers |
| Modify | `src/main/menu.ts` | Add "打开文件夹" menu item |
| Create | `src/renderer/hooks/useTabs.ts` | Manages open tabs, active tab, dirty state |
| Create | `src/renderer/hooks/useFileTree.ts` | Manages directory tree, expanded state, folder open |
| Create | `src/renderer/components/FileTree.tsx` | Recursive tree node renderer |
| Create | `src/renderer/components/FileExplorer.tsx` | Sidebar container: header, open-folder button, tree |
| Create | `src/renderer/components/TabBar.tsx` | Tab strip with active/dirty indicators and close buttons |
| Modify | `src/renderer/pages/MarkdownEditor.tsx` | Wire in sidebar, tabbar, new layout, content routing |
| Modify | `src/renderer/styles/editor.css` | New styles for sidebar, file tree, tab bar |

---

### Task 1: Add Types and Update Preload

**Files:**
- Modify: `src/renderer/types/index.ts`
- Modify: `src/preload/index.ts`

- [ ] **Step 1: Add `FileNode` and `Tab` types, extend `ElectronAPI` in `src/renderer/types/index.ts`**

Append to the end of the file (before the `declare global` block):

```typescript
// 文件树节点
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

// 标签页
export interface Tab {
  id: string;
  filePath: string;
  title: string;
  content: string;
  isDirty: boolean;
}
```

Replace the `ElectronAPI` interface with:

```typescript
export interface ElectronAPI {
  openFile(): Promise<string | null>;
  saveFile(content: string): Promise<boolean>;
  saveFileAs(content: string): Promise<boolean>;
  getAppVersion(): Promise<string>;
  isElectron(): Promise<boolean>;
  openDirectory(): Promise<string | null>;
  readDirectory(dirPath: string): Promise<FileNode[]>;
  readFile(filePath: string): Promise<string | null>;
  saveFileByPath(filePath: string, content: string): Promise<boolean>;
}
```

- [ ] **Step 2: Expose new IPC methods in `src/preload/index.ts`**

Replace the full file with:

```typescript
import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '@/types';

const electronAPI: ElectronAPI = {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (content: string) => ipcRenderer.invoke('save-file', content),
  saveFileAs: (content: string) => ipcRenderer.invoke('save-file-as', content),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  isElectron: () => ipcRenderer.invoke('is-electron'),
  openDirectory: () => ipcRenderer.invoke('open-directory'),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  saveFileByPath: (filePath: string, content: string) => ipcRenderer.invoke('save-file-by-path', filePath, content),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

ipcRenderer.on('menu-open-file', () => {
  window.dispatchEvent(new Event('menu-open-file'));
});

ipcRenderer.on('menu-save-file', () => {
  window.dispatchEvent(new Event('menu-save-file'));
});

ipcRenderer.on('menu-save-file-as', () => {
  window.dispatchEvent(new Event('menu-save-file-as'));
});

ipcRenderer.on('menu-open-directory', () => {
  window.dispatchEvent(new Event('menu-open-directory'));
});
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/types/index.ts src/preload/index.ts
git commit -m "feat: add FileNode/Tab types and new IPC methods to preload"
```

---

### Task 2: Add IPC Handlers in Main Process and Menu

**Files:**
- Modify: `src/main/index.ts`
- Modify: `src/main/menu.ts`

- [ ] **Step 1: Add four new IPC handlers to `src/main/index.ts`**

After the existing `ipcMain.handle('is-electron', ...)` line, append:

```typescript
/**
 * IPC: 打开文件夹选择对话框
 */
ipcMain.handle('open-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

/**
 * IPC: 递归读取目录结构
 */
ipcMain.handle('read-directory', async (_event, dirPath: string) => {
  interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
  }

  const readDir = async (currentPath: string): Promise<FileNode[]> => {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      const nodes: FileNode[] = [];
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          const children = await readDir(fullPath);
          nodes.push({ name: entry.name, path: fullPath, type: 'directory', children });
        } else {
          nodes.push({ name: entry.name, path: fullPath, type: 'file' });
        }
      }
      return nodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    } catch {
      return [];
    }
  };

  return readDir(dirPath);
});

/**
 * IPC: 按路径读取文件内容
 */
ipcMain.handle('read-file', async (_event, filePath: string) => {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
});

/**
 * IPC: 按路径保存文件内容
 */
ipcMain.handle('save-file-by-path', async (_event, filePath: string, content: string) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
});
```

- [ ] **Step 2: Add "打开文件夹" to the menu in `src/main/menu.ts`**

In the `文件` submenu, insert after the `打开...` item (before the first separator):

```typescript
{
  label: '打开文件夹...',
  accelerator: 'CmdOrCtrl+Shift+O',
  click: () => {
    if (!mainWindow) return;
    mainWindow.webContents.send('menu-open-directory');
  },
},
```

- [ ] **Step 3: Commit**

```bash
git add src/main/index.ts src/main/menu.ts
git commit -m "feat: add open-directory, read-directory, read-file, save-file-by-path IPC handlers"
```

---

### Task 3: Create `useTabs` Hook

**Files:**
- Create: `src/renderer/hooks/useTabs.ts`

- [ ] **Step 1: Create `src/renderer/hooks/useTabs.ts`**

```typescript
import { useState, useCallback } from 'react';
import type { Tab } from '@/types';

/**
 * 多标签页状态管理 Hook
 */
export const useTabs = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  /**
   * 打开文件为新标签，如已打开则激活对应标签
   */
  const openFile = useCallback(async (filePath: string) => {
    const existing = tabs.find(t => t.filePath === filePath);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const content = await window.electronAPI?.readFile(filePath);
    if (content === null || content === undefined) return;

    const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const title = filePath.split(/[\\/]/).pop() ?? filePath;
    const newTab: Tab = { id, filePath, title, content, isDirty: false };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(id);
  }, [tabs]);

  /**
   * 关闭标签，如有未保存内容则弹出确认
   */
  const closeTab = useCallback((id: string) => {
    const tab = tabs.find(t => t.id === id);
    if (!tab) return;

    if (tab.isDirty) {
      const confirmed = window.confirm(`"${tab.title}" 有未保存的更改，确定关闭？`);
      if (!confirmed) return;
    }

    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    setActiveTabId(prev => {
      if (prev !== id) return prev;
      if (remaining.length === 0) return null;
      return remaining[remaining.length - 1].id;
    });
  }, [tabs]);

  /**
   * 更新标签内容，标记为已修改
   */
  const setTabContent = useCallback((id: string, content: string) => {
    setTabs(prev =>
      prev.map(t => t.id === id ? { ...t, content, isDirty: true } : t)
    );
  }, []);

  /**
   * 保存标签到其原始路径
   */
  const saveTab = useCallback(async (id: string): Promise<boolean> => {
    const tab = tabs.find(t => t.id === id);
    if (!tab) return false;

    const success = await window.electronAPI?.saveFileByPath(tab.filePath, tab.content);
    if (success) {
      setTabs(prev =>
        prev.map(t => t.id === id ? { ...t, isDirty: false } : t)
      );
    }
    return success ?? false;
  }, [tabs]);

  return {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    openFile,
    closeTab,
    setTabContent,
    saveTab,
  };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/hooks/useTabs.ts
git commit -m "feat: create useTabs hook for multi-tab file management"
```

---

### Task 4: Create `useFileTree` Hook

**Files:**
- Create: `src/renderer/hooks/useFileTree.ts`

- [ ] **Step 1: Create `src/renderer/hooks/useFileTree.ts`**

```typescript
import { useState, useCallback, useEffect } from 'react';
import type { FileNode } from '@/types';

/**
 * 文件树状态管理 Hook
 */
export const useFileTree = () => {
  const [rootPath, setRootPath] = useState<string | null>(null);
  const [tree, setTree] = useState<FileNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = useCallback(async (dirPath: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const nodes = await window.electronAPI?.readDirectory(dirPath);
      setTree(nodes ?? []);
    } catch {
      setError('无法读取目录');
      setTree([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openFolder = useCallback(async () => {
    const dirPath = await window.electronAPI?.openDirectory();
    if (!dirPath) return;
    setRootPath(dirPath);
    setExpandedPaths(new Set());
    await loadDirectory(dirPath);
  }, [loadDirectory]);

  const toggleExpand = useCallback((nodePath: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(nodePath)) next.delete(nodePath);
      else next.add(nodePath);
      return next;
    });
  }, []);

  const refresh = useCallback(() => {
    if (rootPath) void loadDirectory(rootPath);
  }, [rootPath, loadDirectory]);

  // 监听菜单"打开文件夹"事件
  useEffect(() => {
    const handler = () => void openFolder();
    window.addEventListener('menu-open-directory', handler);
    return () => window.removeEventListener('menu-open-directory', handler);
  }, [openFolder]);

  return {
    rootPath,
    tree,
    expandedPaths,
    isLoading,
    error,
    openFolder,
    toggleExpand,
    refresh,
  };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/hooks/useFileTree.ts
git commit -m "feat: create useFileTree hook for directory tree management"
```

---

### Task 5: Create `FileTree` Component

**Files:**
- Create: `src/renderer/components/FileTree.tsx`

- [ ] **Step 1: Create `src/renderer/components/FileTree.tsx`**

```tsx
import React from 'react';
import type { FileNode } from '@/types';

const CLICKABLE_EXTENSIONS = /\.(md|markdown|txt)$/i;

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onFileClick: (path: string) => void;
  activeFilePath?: string;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  depth,
  expandedPaths,
  onToggle,
  onFileClick,
  activeFilePath,
}) => {
  const isExpanded = expandedPaths.has(node.path);
  const isActive = node.path === activeFilePath;
  const isClickable = node.type === 'file' && CLICKABLE_EXTENSIONS.test(node.name);

  const handleClick = () => {
    if (node.type === 'directory') onToggle(node.path);
    else if (isClickable) onFileClick(node.path);
  };

  const nodeClasses = [
    'file-tree-node',
    isActive ? 'file-tree-node-active' : '',
    node.type === 'file' && !isClickable ? 'file-tree-node-disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div>
      <div
        className={nodeClasses}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        title={node.path}
      >
        <span className="file-tree-icon">
          {node.type === 'directory'
            ? (isExpanded ? '▾' : '▸')
            : '·'}
        </span>
        <span className="file-tree-name">{node.name}</span>
      </div>
      {node.type === 'directory' && isExpanded && node.children?.map(child => (
        <FileTreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          expandedPaths={expandedPaths}
          onToggle={onToggle}
          onFileClick={onFileClick}
          activeFilePath={activeFilePath}
        />
      ))}
    </div>
  );
};

interface FileTreeProps {
  nodes: FileNode[];
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onFileClick: (path: string) => void;
  activeFilePath?: string;
}

const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  expandedPaths,
  onToggle,
  onFileClick,
  activeFilePath,
}) => {
  return (
    <div className="file-tree">
      {nodes.map(node => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={0}
          expandedPaths={expandedPaths}
          onToggle={onToggle}
          onFileClick={onFileClick}
          activeFilePath={activeFilePath}
        />
      ))}
    </div>
  );
};

export default FileTree;
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/FileTree.tsx
git commit -m "feat: create FileTree recursive directory tree component"
```

---

### Task 6: Create `FileExplorer` Component

**Files:**
- Create: `src/renderer/components/FileExplorer.tsx`

- [ ] **Step 1: Create `src/renderer/components/FileExplorer.tsx`**

```tsx
import React from 'react';
import FileTree from './FileTree';
import { useFileTree } from '../hooks/useFileTree';

interface FileExplorerProps {
  onFileOpen: (filePath: string) => void;
  activeFilePath?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileOpen, activeFilePath }) => {
  const {
    rootPath,
    tree,
    expandedPaths,
    isLoading,
    error,
    openFolder,
    toggleExpand,
    refresh,
  } = useFileTree();

  const rootName = rootPath ? rootPath.split(/[\\/]/).pop() : null;

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <span className="file-explorer-title">资源管理器</span>
        <div className="file-explorer-actions">
          {rootPath && (
            <button
              className="file-explorer-action-btn"
              onClick={refresh}
              title="刷新"
            >
              ↻
            </button>
          )}
          <button
            className="file-explorer-action-btn"
            onClick={() => void openFolder()}
            title="打开文件夹"
          >
            ⊕
          </button>
        </div>
      </div>

      {rootName && (
        <div className="file-explorer-root-name" title={rootPath ?? ''}>
          {rootName}
        </div>
      )}

      {isLoading && (
        <div className="file-explorer-status">加载中...</div>
      )}

      {error && (
        <div className="file-explorer-status file-explorer-error">{error}</div>
      )}

      {!rootPath && !isLoading && (
        <div className="file-explorer-empty">
          <p>点击 ⊕ 打开文件夹</p>
        </div>
      )}

      {rootPath && !isLoading && (
        <FileTree
          nodes={tree}
          expandedPaths={expandedPaths}
          onToggle={toggleExpand}
          onFileClick={onFileOpen}
          activeFilePath={activeFilePath}
        />
      )}
    </div>
  );
};

export default FileExplorer;
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/FileExplorer.tsx
git commit -m "feat: create FileExplorer sidebar component"
```

---

### Task 7: Create `TabBar` Component

**Files:**
- Create: `src/renderer/components/TabBar.tsx`

- [ ] **Step 1: Create `src/renderer/components/TabBar.tsx`**

```tsx
import React from 'react';
import type { Tab } from '@/types';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onSelect, onClose }) => {
  if (tabs.length === 0) {
    return (
      <div className="tab-bar tab-bar-empty">
        <span>无打开文件</span>
      </div>
    );
  }

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`tab-item ${tab.id === activeTabId ? 'tab-item-active' : ''}`}
          onClick={() => onSelect(tab.id)}
          title={tab.filePath}
        >
          {tab.isDirty && (
            <span className="tab-dirty-indicator" title="未保存">●</span>
          )}
          <span className="tab-title">{tab.title}</span>
          <button
            className="tab-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
            title="关闭"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default TabBar;
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/TabBar.tsx
git commit -m "feat: create TabBar component with dirty indicator and close button"
```

---

### Task 8: Update `MarkdownEditor.tsx` Layout and Wire Everything

**Files:**
- Modify: `src/renderer/pages/MarkdownEditor.tsx`

- [ ] **Step 1: Replace `src/renderer/pages/MarkdownEditor.tsx` with the updated version**

```tsx
import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { githubLight } from '@uiw/codemirror-theme-github'
import { EditorView } from '@codemirror/view'
import markdownExample from '../assets/example/markdown.md?raw'
import { renderMarkdown } from '../utils/render'
import Toolbar from '../components/Toolbar'
import FileExplorer from '../components/FileExplorer'
import TabBar from '../components/TabBar'
import { useTheme, ThemeProvider } from '../contexts/ThemeContext'
import { useCopy } from '../hooks/useCopy'
import { useStore } from '../hooks/useStore'
import { useTabs } from '../hooks/useTabs'
import Notification from '../components/Notification'

const MarkdownEditorWithTheme: React.FC = () => {
  return (
    <ThemeProvider>
      <MarkdownEditor />
    </ThemeProvider>
  );
};

const MarkdownEditor: React.FC = () => {
  const previewRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<ReactCodeMirrorRef>(null)

  const {
    currentTheme,
    setTheme,
    setPrimaryColor,
    getThemeConfig,
    getFontFamily,
    getFontSize,
    setFontFamily,
    setFontSize
  } = useTheme();

  const {
    content,
    settings,
    isLoaded,
    saveContent,
    updateThemeColor,
    updateCodeTheme,
    updateFontFamily,
    updateFontSize,
    updateTheme,
    updatePreviewMode
  } = useStore();

  const {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    openFile: openTabFile,
    closeTab,
    setTabContent,
    saveTab,
  } = useTabs();

  const { copyToWechat } = useCopy();

  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 是否在 Electron 环境
  const isElectron = !!window.electronAPI;

  useEffect(() => {
    if (isLoaded && settings) {
      setFontFamily(settings.fontFamily);
      setFontSize(settings.fontSize);
      setPrimaryColor(settings.themeColor);
      setTheme(settings.currentTheme);
    }
  }, [isLoaded, settings, setFontFamily, setFontSize, setPrimaryColor, setTheme]);

  // 无标签时使用 useStore 内容；有激活标签时使用标签内容
  const markdownText = activeTab
    ? activeTab.content
    : (content === null || content === undefined ? markdownExample : content);

  const handleContentChange = useCallback((value: string) => {
    if (activeTabId) {
      setTabContent(activeTabId, value);
    } else {
      saveContent(value);
    }
  }, [activeTabId, setTabContent, saveContent]);

  // Ctrl+S 保存当前标签
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && activeTabId) {
        e.preventDefault();
        void saveTab(activeTabId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, saveTab]);

  const handleCopyToWechat = () => {
    const result = copyToWechat();
    setNotification({
      visible: true,
      message: result
        ? '已复制为微信公众号格式，可直接到公众号后台粘贴'
        : '复制失败，请重试',
      type: result ? 'success' : 'error',
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  const renderedMarkdown = useMemo(() => {
    const themeStyles = getThemeConfig();
    const currentFontFamily = getFontFamily();
    const currentFontSize = getFontSize();
    return renderMarkdown(markdownText, themeStyles, currentFontFamily, currentFontSize);
  }, [markdownText, getThemeConfig, getFontFamily, getFontSize]);

  return (
    <div className="editor-container">
      <Notification
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onClose={handleCloseNotification}
      />

      <Toolbar
        currentTheme={currentTheme}
        setCurrentTheme={updateTheme}
        fontFamily={getFontFamily()}
        setFontFamily={updateFontFamily}
        fontSize={getFontSize()}
        setFontSize={updateFontSize}
        themeColor={settings.themeColor}
        setThemeColor={(color) => {
          updateThemeColor(color);
          setPrimaryColor(color);
        }}
        codeTheme={settings.codeTheme}
        setCodeTheme={updateCodeTheme}
        previewMode={settings.previewMode || 'responsive'}
        togglePreviewMode={updatePreviewMode}
        copyAsWechat={handleCopyToWechat}
        content={markdownText}
        saveContent={saveContent}
      />

      {/* 工具栏以下的主体区域：侧边栏 + 编辑主区 */}
      <div className="editor-body">
        {/* 侧边栏（仅 Electron） */}
        {isElectron && (
          <div className={`sidebar${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
            {!sidebarCollapsed && (
              <FileExplorer
                onFileOpen={(filePath) => void openTabFile(filePath)}
                activeFilePath={activeTab?.filePath}
              />
            )}
          </div>
        )}

        {/* 侧边栏折叠 toggle（仅 Electron） */}
        {isElectron && (
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(v => !v)}
            title={sidebarCollapsed ? '展开资源管理器' : '折叠资源管理器'}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        )}

        {/* 编辑主区：标签栏 + 编辑器 + 预览 */}
        <div className="editor-main">
          {isElectron && (
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelect={setActiveTabId}
              onClose={closeTab}
            />
          )}

          <div className="editor-content">
            <div className="editor-pane">
              <CodeMirror
                ref={editorRef}
                value={markdownText}
                height="100%"
                theme={githubLight}
                extensions={[
                  markdown({ codeLanguages: languages }),
                  EditorView.lineWrapping,
                ]}
                onChange={handleContentChange}
              />
            </div>

            <div
              id="preview"
              ref={previewRef}
              className="preview-pane"
            >
              <div className={`preview-wrapper ${settings.previewMode === 'mobile' ? 'mobile-preview' : 'wide-preview'}`}>
                <div
                  id="output"
                  className="markdown-preview"
                  dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditorWithTheme;
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/pages/MarkdownEditor.tsx
git commit -m "feat: integrate file explorer sidebar and tab bar into MarkdownEditor"
```

---

### Task 9: Add CSS Styles

**Files:**
- Modify: `src/renderer/styles/editor.css`

- [ ] **Step 1: Replace the `.editor-content` margin-top rule and add new layout styles**

Find this existing rule in `editor.css`:

```css
/* 编辑器内容区 */
.editor-content {
  display: flex;
  flex: 1;
  margin-top: var(--header-height, 60px);
}
```

Replace it with:

```css
/* 编辑器内容区（editor-pane + preview-pane 的直接容器） */
.editor-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
```

- [ ] **Step 2: Append all new styles to the end of `editor.css`**

```css
/* ===== 新布局：editor-body ===== */

/* 工具栏下方的整体区域（sidebar + editor-main） */
.editor-body {
  display: flex;
  flex: 1;
  margin-top: var(--header-height, 60px);
  overflow: hidden;
}

/* 编辑主区（tab-bar + editor-content） */
.editor-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

/* ===== 侧边栏 ===== */

.sidebar {
  width: 240px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color, #e0e0e0);
  background-color: #f8f8f8;
  overflow: hidden;
  transition: width 0.2s ease, min-width 0.2s ease;
}

.sidebar-collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
}

.sidebar-toggle {
  width: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border: none;
  border-right: 1px solid var(--border-color, #e0e0e0);
  cursor: pointer;
  font-size: 14px;
  color: #666;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.15s;
}

.sidebar-toggle:hover {
  background: #e0e0e0;
  color: #333;
}

/* ===== 资源管理器 ===== */

.file-explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.file-explorer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
  flex-shrink: 0;
}

.file-explorer-title {
  font-size: 11px;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.file-explorer-actions {
  display: flex;
  gap: 4px;
}

.file-explorer-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  padding: 2px 4px;
  border-radius: 3px;
  line-height: 1;
}

.file-explorer-action-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.file-explorer-root-name {
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
  flex-shrink: 0;
}

.file-explorer-status {
  padding: 8px;
  font-size: 12px;
  color: #888;
}

.file-explorer-error {
  color: #e53e3e;
}

.file-explorer-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 16px;
  text-align: center;
}

.file-explorer-empty p {
  font-size: 12px;
  color: #999;
  line-height: 1.6;
}

/* ===== 文件树 ===== */

.file-tree {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 0;
  font-size: 13px;
}

.file-tree-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
  border-radius: 3px;
  margin: 0 4px;
}

.file-tree-node:hover {
  background-color: #e8e8e8;
}

.file-tree-node-active {
  background-color: #d0e4ff;
  color: #1a56db;
}

.file-tree-node-active:hover {
  background-color: #c0d8ff;
}

.file-tree-node-disabled {
  color: #bbb;
  cursor: default;
}

.file-tree-node-disabled:hover {
  background-color: transparent;
}

.file-tree-icon {
  font-size: 10px;
  width: 12px;
  flex-shrink: 0;
  color: #666;
}

.file-tree-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 标签栏 ===== */

.tab-bar {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
  background-color: #f5f5f5;
  flex-shrink: 0;
  scrollbar-width: thin;
}

.tab-bar::-webkit-scrollbar {
  height: 3px;
}

.tab-bar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.tab-bar-empty {
  padding: 4px 12px;
  font-size: 12px;
  color: #aaa;
  align-items: center;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px 5px 10px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 12px;
  color: #555;
  border-right: 1px solid var(--border-color, #e0e0e0);
  flex-shrink: 0;
  user-select: none;
  max-width: 180px;
}

.tab-item:hover {
  background-color: #ececec;
}

.tab-item-active {
  background-color: #ffffff;
  color: #222;
  border-bottom: 2px solid var(--color-primary, #07c160);
}

.tab-dirty-indicator {
  font-size: 10px;
  color: var(--color-primary, #07c160);
  flex-shrink: 0;
}

.tab-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.tab-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #999;
  padding: 0 2px;
  line-height: 1;
  border-radius: 3px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.tab-close-btn:hover {
  background-color: #ddd;
  color: #333;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/styles/editor.css
git commit -m "feat: add sidebar, file tree, and tab bar CSS styles"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ 多层目录树形结构 → `FileTree` 递归节点 + `useFileTree` 的 `read-directory` IPC
- ✅ 多标签页 → `useTabs` hook + `TabBar` 组件
- ✅ 侧边栏折叠/展开 → `sidebarCollapsed` state + `sidebar-toggle` 按钮 + `.sidebar-collapsed` CSS
- ✅ 点击文件打开 → `onFileClick` → `useTabs.openFile` → `read-file` IPC
- ✅ 未保存提示 → `closeTab` 中 `window.confirm`
- ✅ 非 md/txt 文件灰显不可点 → `CLICKABLE_EXTENSIONS` 检查 + `file-tree-node-disabled`
- ✅ Ctrl+S 保存 → `keydown` 监听 → `saveTab`
- ✅ 菜单"打开文件夹" → `menu.ts` + `menu-open-directory` 事件 → `useFileTree.openFolder`
- ✅ 仅 Electron 渲染侧边栏 → `isElectron = !!window.electronAPI` 判断

**2. Placeholder scan:** 无 TBD/TODO，所有步骤包含完整代码。

**3. Type consistency:**
- `FileNode` / `Tab` 在 Task 1 定义，Task 3–8 全部从 `@/types` 导入
- `useTabs` 返回 `openFile(filePath)` → Task 8 中调用 `openTabFile(filePath)` ✅
- `useTabs` 返回 `saveTab(id)` → Task 8 中 Ctrl+S 调用 `saveTab(activeTabId)` ✅
- `ElectronAPI.saveFileByPath` → `useTabs.saveTab` 中调用 `window.electronAPI?.saveFileByPath` ✅
- `ElectronAPI.readFile` → `useTabs.openFile` 中调用 `window.electronAPI?.readFile` ✅
