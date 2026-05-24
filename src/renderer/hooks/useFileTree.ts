import { useState, useCallback, useEffect } from 'react';
import type { FileNode } from '@/types';

/**
 * 文件树状态管理 Hook
 */
export const useFileTree = () => {
  const [rootPath, setRootPath] = useState<string | null>(null);
  const [tree, setTree] = useState<FileNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [activeFolderPath, setActiveFolderPath] = useState<string | null>(null);
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
    setActiveFolderPath(null);
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

  const createFile = useCallback(async (dirPath: string, fileName: string): Promise<string | null> => {
    if (!window.electronAPI) return null;
    const filePath = await window.electronAPI.createFile(dirPath, fileName);
    if (filePath) {
      await loadDirectory(rootPath ?? dirPath);
    }
    return filePath;
  }, [rootPath, loadDirectory]);

  const createFolder = useCallback(async (dirPath: string, folderName: string): Promise<string | null> => {
    if (!window.electronAPI) return null;
    const folderPath = await window.electronAPI.createDirectory(dirPath, folderName);
    if (folderPath) {
      setExpandedPaths(prev => new Set(prev).add(folderPath));
      await loadDirectory(rootPath ?? dirPath);
    }
    return folderPath;
  }, [rootPath, loadDirectory]);

  const deleteFile = useCallback(async (filePath: string): Promise<boolean> => {
    if (!window.electronAPI) return false;
    const success = await window.electronAPI.deleteFile(filePath);
    if (success && rootPath) {
      await loadDirectory(rootPath);
    }
    return success;
  }, [rootPath, loadDirectory]);

  const deleteDirectory = useCallback(async (dirPath: string): Promise<boolean> => {
    if (!window.electronAPI) return false;
    const success = await window.electronAPI.deleteDirectory(dirPath);
    if (success && rootPath) {
      setExpandedPaths(prev => {
        const next = new Set(prev);
        next.delete(dirPath);
        return next;
      });
      if (activeFolderPath === dirPath) {
        setActiveFolderPath(null);
      }
      await loadDirectory(rootPath);
    }
    return success;
  }, [rootPath, loadDirectory, activeFolderPath]);

  const renameFile = useCallback(async (filePath: string, newName: string): Promise<boolean> => {
    if (!window.electronAPI) return false;
    const success = await window.electronAPI.renameFile(filePath, newName);
    if (success && rootPath) {
      await loadDirectory(rootPath);
    }
    return success;
  }, [rootPath, loadDirectory]);

  const renameDirectory = useCallback(async (dirPath: string, newName: string): Promise<boolean> => {
    if (!window.electronAPI) return false;
    const success = await window.electronAPI.renameDirectory(dirPath, newName);
    if (success && rootPath) {
      setExpandedPaths(prev => {
        const next = new Set(prev);
        next.delete(dirPath);
        return next;
      });
      if (activeFolderPath === dirPath) {
        setActiveFolderPath(null);
      }
      await loadDirectory(rootPath);
    }
    return success;
  }, [rootPath, loadDirectory, activeFolderPath]);

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
    activeFolderPath,
    isLoading,
    error,
    openFolder,
    toggleExpand,
    refresh,
    loadDirectory,
    createFile,
    createFolder,
    deleteFile,
    deleteDirectory,
    renameFile,
    renameDirectory,
    setActiveFolderPath,
    setRootPath,
  };
};
