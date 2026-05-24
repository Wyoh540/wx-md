import { useCallback } from 'react';
import type { WorkspaceState } from '@/types';

/**
 * 工作区状态管理Hook
 * 通过 Electron IPC 实现工作区状态的持久化（保存/读取）
 * 在 Electron 模式下使用文件存储，在 Web 模式下不可用
 */
export function useWorkspaceState() {
  /**
   * 保存工作区状态
   */
  const saveWorkspaceState = useCallback(async (state: WorkspaceState): Promise<boolean> => {
    try {
      if (!window.electronAPI) return false;
      return await window.electronAPI.writeWorkspaceState(state);
    } catch {
      return false;
    }
  }, []);

  /**
   * 读取工作区状态
   */
  const loadWorkspaceState = useCallback(async (): Promise<WorkspaceState | null> => {
    try {
      if (!window.electronAPI) return null;
      return await window.electronAPI.readWorkspaceState();
    } catch {
      return null;
    }
  }, []);

  /**
   * 监听保存工作区状态事件
   * 当窗口即将关闭时，preload 脚本会派发 save-workspace-state 自定义事件
   */
  const onSaveWorkspaceState = useCallback((callback: () => void) => {
    const handler = () => callback();
    window.addEventListener('save-workspace-state', handler);
    return () => window.removeEventListener('save-workspace-state', handler);
  }, []);

  return { saveWorkspaceState, loadWorkspaceState, onSaveWorkspaceState };
}