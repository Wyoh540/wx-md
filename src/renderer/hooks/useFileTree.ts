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
