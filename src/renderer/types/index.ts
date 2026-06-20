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

// 文件树节点
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

// 标签页
export interface Tab {
  id: string;
  filePath: string;
  title: string;
  content: string;
  isDirty: boolean;
}

// 微信公众号配置
export interface WeChatConfig {
  appId: string;
  appSecret: string;
  author: string;
  thumbMediaId: string;
}

// 微信公众号草稿文章
export interface WeChatDraftArticle {
  title: string;
  author: string;
  digest: string;
  content: string;
  thumb_media_id: string;
  need_open_comment: number;
  only_fans_can_comment: number;
}

// 微信公众号 access_token 响应
export interface WeChatTokenResponse {
  access_token?: string;
  expires_in?: number;
  errcode?: number;
  errmsg?: string;
}

// 微信公众号草稿上传响应
export interface WeChatDraftResponse {
  media_id?: string;
  errcode?: number;
  errmsg?: string;
}

// 微信图片上传映射
export interface WeChatImageUploadMap {
  originalSrc: string;
  wechatUrl: string;
}

// 工作区状态
export interface WorkspaceState {
  rootPath: string | null;
  openFilePaths: string[];
  activeFilePath: string | null;
  expandedPaths: string[];
  selectedPath: string | null;
}

/**
 * Electron API 类型定义
 * 通过 contextBridge 暴露给渲染进程的 API 接口
 */
export interface ElectronAPI {
  /** 打开本地 Markdown 文件，返回文件内容，用户取消则返回 null */
  openFile(): Promise<string | null>;

  /** 保存当前内容到已关联的文件路径 */
  saveFile(content: string): Promise<boolean>;

  /** 弹出另存为对话框，保存到用户选择的路径 */
  saveFileAs(content: string): Promise<boolean>;

  /** 获取应用版本号 */
  getAppVersion(): Promise<string>;

  /** 检查是否在 Electron 环境中运行 */
  isElectron(): Promise<boolean>;

  /** 弹出文件夹选择对话框，返回选中路径，取消则返回 null */
  openDirectory(): Promise<string | null>;

  /** 递归读取目录结构，返回文件树节点数组 */
  readDirectory(dirPath: string): Promise<FileNode[]>;

  /** 按路径读取文件内容，失败则返回 null */
  readFile(filePath: string): Promise<string | null>;

  /** 按路径保存文件内容 */
  saveFileByPath(filePath: string, content: string): Promise<boolean>;

  /** 获取微信公众号 access_token */
  wechatGetAccessToken(appId: string, appSecret: string): Promise<WeChatTokenResponse>;

  /** 上传图文消息草稿到微信公众号 */
  wechatUploadDraft(accessToken: string, articles: WeChatDraftArticle[]): Promise<WeChatDraftResponse>;

  /** 批量上传文章中的图片到微信素材库 */
  wechatUploadImages(accessToken: string, imageSrcs: string[], baseDir?: string): Promise<WeChatImageUploadMap[]>;

  /** 读取微信公众号配置 */
  wechatReadConfig(): Promise<WeChatConfig | null>;

  /** 保存微信公众号配置 */
  wechatWriteConfig(config: WeChatConfig): Promise<boolean>;

  /** 读取本地文件并返回 base64 编码内容 */
  readFileAsBase64(filePath: string): Promise<string | null>;

  /** 创建新文件，返回创建的文件路径，失败返回 null */
  createFile(dirPath: string, fileName: string): Promise<string | null>;

  /** 创建新目录，返回创建的目录路径，失败返回 null */
  createDirectory(dirPath: string, dirName: string): Promise<string | null>;

  /** 删除文件，成功返回 true */
  deleteFile(filePath: string): Promise<boolean>;

  /** 删除目录，成功返回 true */
  deleteDirectory(dirPath: string): Promise<boolean>;

  /** 重命名文件，成功返回 true */
  renameFile(filePath: string, newName: string): Promise<boolean>;

  /** 重命名目录，成功返回 true */
  renameDirectory(dirPath: string, newName: string): Promise<boolean>;

  /** 读取工作区状态 */
  readWorkspaceState(): Promise<WorkspaceState | null>;

  /** 保存工作区状态 */
  writeWorkspaceState(state: WorkspaceState): Promise<boolean>;

  /** 关闭窗口 */
  closeWindow(): Promise<void>;

  /** 将 HTML 写入系统剪贴板 */
  writeClipboardHtml(html: string): Promise<boolean>;
}

/**
 * 扩展 Window 接口以包含 electronAPI
 */
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}