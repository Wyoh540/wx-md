import React from 'react';

export interface IConfigOption<VT = string> {
    label: string
    value: VT
    desc: string
}

// 预览模式类型
export type PreviewMode = 'responsive' | 'mobile' | 'wide';

// 下拉菜单项类型
export type DropdownItem = {
  label: string;
  action?: () => void;
  subMenu?: DropdownItem[];
  checked?: boolean;
  value?: string;
  url?: string;   // 链接URL，用于跳转类型的菜单项
  isLink?: boolean; // 标识是否为链接类型的菜单项
};

// 主题样式接口
export interface ThemeStyles {
  // 基础变量
  base: React.CSSProperties;

  // Markdown元素样式
  elements: {
    // 标题样式
    h1?: React.CSSProperties;
    h2?: React.CSSProperties;
    h3?: React.CSSProperties;
    h4?: React.CSSProperties;
    h5?: React.CSSProperties;
    h6?: React.CSSProperties;

    // 段落样式
    p?: React.CSSProperties;

    // 引用样式
    blockquote?: React.CSSProperties;
    blockquote_p?: React.CSSProperties;

    // 代码样式
    code?: React.CSSProperties;
    code_span?: React.CSSProperties;
    pre_code?: React.CSSProperties;

    // 列表样式
    ul?: React.CSSProperties;
    ol?: React.CSSProperties;
    li?: React.CSSProperties;

    // 表格样式
    table?: React.CSSProperties;
    th?: React.CSSProperties;
    td?: React.CSSProperties;

    // 其他元素
    a?: React.CSSProperties;
    img?: React.CSSProperties;
    figcaption?: React.CSSProperties; // 图片标题样式
    hr?: React.CSSProperties;
    strong?: React.CSSProperties;
    em?: React.CSSProperties;
    del?: React.CSSProperties;
    footnotes?: React.CSSProperties;
  }
}

/**
 * Electron API 类型定义
 * 通过 contextBridge 暴露给渲染进程的 API 接口
 */
export interface ElectronAPI {
  /**
   * 打开本地 Markdown 文件
   * @returns 文件内容，如果用户取消则返回 null
   */
  openFile(): Promise<string | null>;

  /**
   * 保存当前内容到文件
   * @param content 要保存的 Markdown 内容
   * @returns 是否保存成功
   */
  saveFile(content: string): Promise<boolean>;

  /**
   * 另存为文件
   * @param content 要保存的 Markdown 内容
   * @returns 是否保存成功
   */
  saveFileAs(content: string): Promise<boolean>;

  /**
   * 获取应用版本号
   * @returns 版本字符串
   */
  getAppVersion(): Promise<string>;

  /**
   * 检查是否在 Electron 环境中运行
   */
  isElectron(): Promise<boolean>;
}

/**
 * 扩展 Window 接口以包含 electronAPI
 */
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}