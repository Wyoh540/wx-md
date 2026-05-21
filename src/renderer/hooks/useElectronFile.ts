import { useCallback, useEffect, useState } from 'react';

/**
 * Electron 文件操作 Hook
 * 提供打开、保存、另存为等文件操作功能
 */
export const useElectronFile = (currentContent: string) => {
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    const checkElectronEnvironment = async () => {
      if (!window.electronAPI) {
        return;
      }

      try {
        const isE = await window.electronAPI.isElectron();
        setIsElectron(isE);

        if (isE) {
          const version = await window.electronAPI.getAppVersion();
          setAppVersion(version);
        }
      } catch (error) {
        console.error('检查 Electron 环境失败:', error);
      }
    };

    void checkElectronEnvironment();
  }, []);

  const openFile = useCallback(async (): Promise<string | null> => {
    if (!window.electronAPI) {
      return null;
    }

    try {
      return await window.electronAPI.openFile();
    } catch (error) {
      console.error('打开文件失败:', error);
      return null;
    }
  }, []);

  const saveFile = useCallback(async (): Promise<boolean> => {
    if (!window.electronAPI) {
      return false;
    }

    try {
      return await window.electronAPI.saveFile(currentContent);
    } catch (error) {
      console.error('保存文件失败:', error);
      return false;
    }
  }, [currentContent]);

  const saveFileAs = useCallback(async (): Promise<boolean> => {
    if (!window.electronAPI) {
      return false;
    }

    try {
      return await window.electronAPI.saveFileAs(currentContent);
    } catch (error) {
      console.error('另存为文件失败:', error);
      return false;
    }
  }, [currentContent]);

  return {
    isElectron,
    appVersion,
    openFile,
    saveFile,
    saveFileAs,
  };
};
