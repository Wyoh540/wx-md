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
    setActiveTabId,
    openFile: openTabFile,
    closeTab,
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
    <div className="editor-container">
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

      {/* 工具栏以下的主体区域：侧边栏 + 编辑主区 */}
      <div className="editor-body">
        {/* 侧边栏（仅 Electron） */}
        {isElectron && (
          <div className={`sidebar${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
            {!sidebarCollapsed && (
              <FileExplorer
                onFileOpen={(filePath) => void openTabFile(filePath)}
                activeFilePath={activeTab?.filePath}
              />
            )}
          </div>
        )}

        {/* 侧边栏折叠 toggle（仅 Electron） */}
        {isElectron && (
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(v => !v)}
            title={sidebarCollapsed ? '展开资源管理器' : '折叠资源管理器'}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        )}

        {/* 编辑主区：标签栏 + 编辑器 + 预览 */}
        <div className="editor-main">
          {isElectron && (
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelect={setActiveTabId}
              onClose={closeTab}
            />
          )}

          <div className="editor-content">
            <div className="editor-pane">
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
              />
            </div>

            <div
              id="preview"
              ref={previewRef}
              className="preview-pane"
            >
              <div className={`preview-wrapper ${settings.previewMode === 'mobile' ? 'mobile-preview' : 'wide-preview'}`}>
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
    </div>
  );
};

export default MarkdownEditorWithTheme;
