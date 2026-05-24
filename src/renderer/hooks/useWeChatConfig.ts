import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'wechat-config';

export interface WeChatConfig {
  appId: string;
  appSecret: string;
  author: string;
  thumbMediaId: string;
}

const defaultConfig: WeChatConfig = {
  appId: '',
  appSecret: '',
  author: '',
  thumbMediaId: ''
};

/**
 * 微信公众号配置管理Hook
 * 管理 appId、appSecret、author、thumbMediaId 等配置的持久化存储
 * 在 Electron 模式下会同步到文件，在 Web 模式下只使用 localStorage
 */
export function useWeChatConfig() {
  const [config, setConfig] = useState<WeChatConfig>(defaultConfig);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  /**
   * 从本地存储或 Electron 文件加载配置
   */
  const loadConfig = useCallback(() => {
    try {
      // Electron 模式下优先从文件读取
      if (window.electronAPI?.wechatReadConfig) {
        window.electronAPI.wechatReadConfig().then((fileConfig: WeChatConfig | null) => {
          if (fileConfig) {
            setConfig({ ...defaultConfig, ...fileConfig });
          }
        }).catch((error: unknown) => {
          console.error('从文件加载配置失败:', error);
          // 降级到 localStorage
          const savedConfig = localStorage.getItem(STORAGE_KEY);
          if (savedConfig) {
            setConfig({ ...defaultConfig, ...JSON.parse(savedConfig) });
          }
        });
      } else {
        // Web 模式直接使用 localStorage
        const savedConfig = localStorage.getItem(STORAGE_KEY);
        if (savedConfig) {
          setConfig({ ...defaultConfig, ...JSON.parse(savedConfig) });
        }
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  }, []);

  /**
   * 保存配置到本地存储和 Electron 文件
   */
  const saveConfig = useCallback((newConfig: WeChatConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);

      // Electron 模式下同步到文件
      if (window.electronAPI?.wechatWriteConfig) {
        window.electronAPI.wechatWriteConfig(newConfig).catch((error: unknown) => {
          console.error('保存配置到文件失败:', error);
        });
      }
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  }, []);

  /**
   * 部分更新配置并保存
   */
  const updateConfig = useCallback((partial: Partial<WeChatConfig>) => {
    const newConfig = { ...config, ...partial };
    saveConfig(newConfig);
  }, [config, saveConfig]);

  /**
   * 初始化时加载配置
   */
  useEffect(() => {
    loadConfig();
    setIsLoaded(true);
  }, [loadConfig]);

  return {
    config,
    isLoaded,
    loadConfig,
    saveConfig,
    updateConfig
  };
}