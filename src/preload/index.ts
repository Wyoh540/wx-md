import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI, WeChatDraftArticle, WeChatConfig, WorkspaceState } from '@/types';

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
  createFile: (dirPath: string, fileName: string) => ipcRenderer.invoke('create-file', dirPath, fileName),
  createDirectory: (dirPath: string, dirName: string) => ipcRenderer.invoke('create-directory', dirPath, dirName),
  deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath),
  deleteDirectory: (dirPath: string) => ipcRenderer.invoke('delete-directory', dirPath),
  renameFile: (filePath: string, newName: string) => ipcRenderer.invoke('rename-file', filePath, newName),
  renameDirectory: (dirPath: string, newName: string) => ipcRenderer.invoke('rename-directory', dirPath, newName),
  readWorkspaceState: () => ipcRenderer.invoke('read-workspace-state'),
  writeWorkspaceState: (state: WorkspaceState) => ipcRenderer.invoke('write-workspace-state', state),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  wechatGetAccessToken: (appId: string, appSecret: string) => ipcRenderer.invoke('wechat-get-access-token', appId, appSecret),
  wechatUploadDraft: (accessToken: string, articles: WeChatDraftArticle[]) => ipcRenderer.invoke('wechat-upload-draft', accessToken, articles),
  wechatUploadImages: (accessToken: string, imageSrcs: string[], baseDir?: string) => ipcRenderer.invoke('wechat-upload-images', accessToken, imageSrcs, baseDir),
  wechatReadConfig: () => ipcRenderer.invoke('wechat-read-config'),
  wechatWriteConfig: (config: WeChatConfig) => ipcRenderer.invoke('wechat-write-config', config),
  readFileAsBase64: (filePath: string) => ipcRenderer.invoke('read-file-as-base64', filePath),
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

ipcRenderer.on('save-workspace-state', () => {
  window.dispatchEvent(new Event('save-workspace-state'));
});
