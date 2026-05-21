import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import { promises as fs } from 'fs';
import started from 'electron-squirrel-startup';
import { createMenu } from './menu';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (started) {
  app.quit();
}

let currentFilePath: string | null = null;
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: process.env.NODE_ENV !== 'development',
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  createMenu(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('open-file', async () => {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'Markdown 文件', extensions: ['md', 'markdown', 'txt'] },
      { name: '所有文件', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    currentFilePath = filePath;
    return content;
  } catch (error) {
    console.error('读取文件失败:', error);
    return null;
  }
});

ipcMain.handle('save-file', async (_event, content: string) => {
  if (!currentFilePath) {
    return false;
  }

  try {
    await fs.writeFile(currentFilePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error('保存文件失败:', error);
    return false;
  }
});

ipcMain.handle('save-file-as', async (_event, content: string) => {
  if (!mainWindow) return false;

  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Markdown 文件', extensions: ['md'] },
      { name: '所有文件', extensions: ['*'] },
    ],
    defaultPath: currentFilePath || undefined,
  });

  if (result.canceled || !result.filePath) {
    return false;
  }

  try {
    await fs.writeFile(result.filePath, content, 'utf-8');
    currentFilePath = result.filePath;
    return true;
  } catch (error) {
    console.error('保存文件失败:', error);
    return false;
  }
});

ipcMain.handle('get-app-version', async () => app.getVersion());
ipcMain.handle('is-electron', async () => true);

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

  const readDir = async (currentPath: string, depth = 0): Promise<FileNode[]> => {
    if (depth > 15) return [];
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      const nodes: FileNode[] = [];
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isDirectory() && !entry.isSymbolicLink()) {
          const children = await readDir(fullPath, depth + 1);
          nodes.push({ name: entry.name, path: fullPath, type: 'directory', children });
        } else if (!entry.isDirectory()) {
          nodes.push({ name: entry.name, path: fullPath, type: 'file' });
        }
      }
      return nodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('读取目录失败:', error);
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
  } catch (error) {
    console.error('按路径读取文件失败:', error);
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
  } catch (error) {
    console.error('按路径保存文件失败:', error);
    return false;
  }
});
