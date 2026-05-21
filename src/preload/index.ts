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
