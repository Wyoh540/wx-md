import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { githubLight } from '@uiw/codemirror-theme-github'
import { EditorView } from '@codemirror/view'
import markdownExample from '../assets/example/markdown.md?raw'
import { renderMarkdown } from '../utils/render'
import Toolbar from '../components/Toolbar'
import FileExplorer from '../components/FileExplorer'
import TabBar from '../components/TabBar'
import { useTheme, ThemeProvider } from '../contexts/ThemeContext'
import { useCopy } from '../hooks/useCopy'
import { useStore } from '../hooks/useStore'
import { useTabs } from '../hooks/useTabs'
import Notification from '../components/Notification'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const MarkdownEditorWithTheme: React.FC = () => {
  return (
    <ThemeProvider>
      <MarkdownEditor />
    </ThemeProvider>
  );
};

const MarkdownEditor: React.FC = () => {
  const previewRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<ReactCodeMirrorRef>(null)

  const {
    currentTheme,
    setTheme,
    setPrimaryColor,
    getThemeConfig,
    getFontFamily,
    getFontSize,
    setFontFamily,
    setFontSize
  } = useTheme();

  const {
    content,
    settings,
    isLoaded,
    saveContent,
    updateThemeColor,
    updateCodeTheme,
    updateFontFamily,
    updateFontSize,
    updateTheme,
    updatePreviewMode
  } = useStore();

  const {
    tabs,
    activeTabId,
    activeTab,
    confirmDialog,
    setActiveTabId,
    openFile: openTabFile,
    requestCloseTab,
    confirmCloseTab,
    cancelCloseTab,
    setTabContent,
    saveTab,
  } = useTabs();

  const { copyToWechat } = useCopy();

  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 是否在 Electron 环境
  const isElectron = !!window.electronAPI;

  useEffect(() => {
    if (isLoaded && settings) {
      setFontFamily(settings.fontFamily);
      setFontSize(settings.fontSize);
      setPrimaryColor(settings.themeColor);
      setTheme(settings.currentTheme);
    }
  }, [isLoaded, settings, setFontFamily, setFontSize, setPrimaryColor, setTheme]);

  // 无标签时使用 useStore 内容；有激活标签时使用标签内容
  const markdownText = activeTab
    ? activeTab.content
    : (content === null || content === undefined ? markdownExample : content);

  const handleContentChange = useCallback((value: string) => {
    if (activeTabId) {
      setTabContent(activeTabId, value);
    } else {
      saveContent(value);
    }
  }, [activeTabId, setTabContent, saveContent]);

  // Ctrl+S 保存当前标签
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && activeTabId) {
        e.preventDefault();
        void saveTab(activeTabId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, saveTab]);

  const handleCopyToWechat = () => {
    const result = copyToWechat();
    setNotification({
      visible: true,
      message: result
        ? '已复制为微信公众号格式，可直接到公众号后台粘贴'
        : '复制失败，请重试',
      type: result ? 'success' : 'error',
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  const renderedMarkdown = useMemo(() => {
    const themeStyles = getThemeConfig();
    const currentFontFamily = getFontFamily();
    const currentFontSize = getFontSize();
    return renderMarkdown(markdownText, themeStyles, currentFontFamily, currentFontSize);
  }, [markdownText, getThemeConfig, getFontFamily, getFontSize]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Notification
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onClose={handleCloseNotification}
      />

      <Toolbar
        currentTheme={currentTheme}
        setCurrentTheme={updateTheme}
        fontFamily={getFontFamily()}
        setFontFamily={updateFontFamily}
        fontSize={getFontSize()}
        setFontSize={updateFontSize}
        themeColor={settings.themeColor}
        setThemeColor={(color) => {
          updateThemeColor(color);
          setPrimaryColor(color);
        }}
        codeTheme={settings.codeTheme}
        setCodeTheme={updateCodeTheme}
        previewMode={settings.previewMode || 'responsive'}
        togglePreviewMode={updatePreviewMode}
        copyAsWechat={handleCopyToWechat}
        content={markdownText}
        saveContent={saveContent}
      />

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        {isElectron && (
          <div
            className={
              sidebarCollapsed
                ? 'w-0 overflow-hidden'
                : 'w-60 min-w-[240px] flex flex-col border-r'
            }
          >
            {!sidebarCollapsed && (
              <FileExplorer
                onFileOpen={(filePath) => void openTabFile(filePath)}
                activeFilePath={activeTab?.filePath}
              />
            )}
          </div>
        )}

        {/* 侧边栏折叠按钮 */}
        {isElectron && (
          <button
            className="flex items-center justify-center w-3.5 bg-muted border-r hover:bg-accent transition-colors text-muted-foreground text-xs"
            onClick={() => setSidebarCollapsed(v => !v)}
            title={sidebarCollapsed ? '展开资源管理器' : '折叠资源管理器'}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        )}

        {/* 编辑主区 */}
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          {isElectron && (
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelect={setActiveTabId}
              onClose={requestCloseTab}
            />
          )}

          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* 编辑器 */}
            <div className="w-1/2 h-full flex flex-col overflow-hidden border-r">
              <CodeMirror
                ref={editorRef}
                value={markdownText}
                height="100%"
                theme={githubLight}
                extensions={[
                  markdown({ codeLanguages: languages }),
                  EditorView.lineWrapping,
                ]}
                onChange={handleContentChange}
                className="flex-1 h-full [&_.cm-editor]:border-0 [&_.cm-editor]:shadow-none [&_.cm-content]:p-4"
              />
            </div>

            {/* 预览区 */}
            <div
              id="preview"
              ref={previewRef}
              className="w-1/2 h-full overflow-auto bg-background"
            >
              <div
                className={
                  settings.previewMode === 'mobile'
                    ? 'w-[375px] mx-auto min-h-full p-4 border-x shadow-sm bg-background'
                    : 'max-w-[900px] mx-auto min-h-full p-4 border-x shadow-sm bg-background'
                }
              >
                <div
                  id="output"
                  className="markdown-preview"
                  dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 未保存关闭确认对话框 */}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => !open && cancelCloseTab()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>关闭未保存文件</DialogTitle>
            <DialogDescription>
              {confirmDialog && `"${confirmDialog.title}" 有未保存的更改，确定关闭？`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelCloseTab}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmCloseTab}>
              关闭且不保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarkdownEditorWithTheme;
