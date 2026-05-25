import { useState, useCallback, useRef, useEffect } from 'react';
import type { Tab } from '@/types';

interface ConfirmDialogState {
  id: string;
  title: string;
}

/**
 * 多标签页状态管理 Hook
 */
export const useTabs = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const tabsRef = useRef<Tab[]>(tabs);
  const openInProgressRef = useRef<Set<string>>(new Set());

  // Keep ref in sync with state
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  /**
   * 打开文件为新标签，如已打开则激活对应标签
   */
  const openFile = useCallback(async (filePath: string) => {
    // Gate: prevent concurrent opens for the same file
    if (openInProgressRef.current.has(filePath)) return;

    // Dedup: file already open in a tab?
    const existing = tabsRef.current.find(t => t.filePath === filePath);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    openInProgressRef.current.add(filePath);
    try {
      const content = await window.electronAPI?.readFile(filePath);
      if (content === null || content === undefined) return;

      // Re-check after async gap: another call may have created this tab
      const existingAfterAwait = tabsRef.current.find(t => t.filePath === filePath);
      if (existingAfterAwait) {
        setActiveTabId(existingAfterAwait.id);
        return;
      }

      const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const title = filePath.split(/[\\/]/).pop() ?? filePath;
      const newTab: Tab = { id, filePath, title, content, isDirty: false };

      setTabs(prev => [...prev, newTab]);
      setActiveTabId(id);
    } finally {
      openInProgressRef.current.delete(filePath);
    }
  }, []);

  /**
   * 内部关闭标签（不弹确认）
   */
  const doCloseTab = useCallback((id: string) => {
    setTabs(prev => {
      const remaining = prev.filter(t => t.id !== id);
      setActiveTabId(curr => {
        if (curr !== id) return curr;
        return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      });
      return remaining;
    });
  }, []);

  /**
   * 请求关闭标签，如有未保存内容则设置确认对话框状态
   */
  const requestCloseTab = useCallback((id: string) => {
    const tab = tabsRef.current.find(t => t.id === id);
    if (!tab) return;

    if (tab.isDirty) {
      setConfirmDialog({ id, title: tab.title });
    } else {
      doCloseTab(id);
    }
  }, [doCloseTab]);

  /**
   * 确认关闭未保存标签
   */
  const confirmCloseTab = useCallback(() => {
    if (!confirmDialog) return;
    doCloseTab(confirmDialog.id);
    setConfirmDialog(null);
  }, [confirmDialog, doCloseTab]);

  /**
   * 取消关闭标签
   */
  const cancelCloseTab = useCallback(() => {
    setConfirmDialog(null);
  }, []);

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
    const tab = tabsRef.current.find(t => t.id === id);
    if (!tab) return false;

    const success = await window.electronAPI?.saveFileByPath(tab.filePath, tab.content);
    if (success) {
      setTabs(prev =>
        prev.map(t => t.id === id ? { ...t, isDirty: false } : t)
      );
    }
    return success ?? false;
  }, []);

  return {
    tabs,
    activeTabId,
    activeTab,
    confirmDialog,
    setActiveTabId,
    openFile,
    requestCloseTab,
    confirmCloseTab,
    cancelCloseTab,
    setTabContent,
    saveTab,
  };
};
