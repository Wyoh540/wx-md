import { useState, useCallback, useRef, useEffect } from 'react';
import type { Tab } from '@/types';

/**
 * 多标签页状态管理 Hook
 */
export const useTabs = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const tabsRef = useRef<Tab[]>(tabs);

  // Keep ref in sync with state
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  /**
   * 打开文件为新标签，如已打开则激活对应标签
   */
  const openFile = useCallback(async (filePath: string) => {
    const existing = tabsRef.current.find(t => t.filePath === filePath);
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
  }, []);

  /**
   * 关闭标签，如有未保存内容则弹出确认
   */
  const closeTab = useCallback((id: string) => {
    const tab = tabsRef.current.find(t => t.id === id);
    if (!tab) return;

    if (tab.isDirty) {
      const confirmed = window.confirm(`"${tab.title}" 有未保存的更改，确定关闭？`);
      if (!confirmed) return;
    }

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
    setActiveTabId,
    openFile,
    closeTab,
    setTabContent,
    saveTab,
  };
};
