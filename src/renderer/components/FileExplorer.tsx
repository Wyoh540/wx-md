import React from 'react';
import FileTree from './FileTree';
import { useFileTree } from '../hooks/useFileTree';

interface FileExplorerProps {
  onFileOpen: (filePath: string) => void;
  activeFilePath?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileOpen, activeFilePath }) => {
  const {
    rootPath,
    tree,
    expandedPaths,
    isLoading,
    error,
    openFolder,
    toggleExpand,
    refresh,
  } = useFileTree();

  const rootName = rootPath ? rootPath.split(/[\\/]/).pop() : null;

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <span className="file-explorer-title">资源管理器</span>
        <div className="file-explorer-actions">
          {rootPath && (
            <button
              className="file-explorer-action-btn"
              onClick={refresh}
              title="刷新"
            >
              ↻
            </button>
          )}
          <button
            className="file-explorer-action-btn"
            onClick={() => void openFolder()}
            title="打开文件夹"
          >
            ⊕
          </button>
        </div>
      </div>

      {rootName && (
        <div className="file-explorer-root-name" title={rootPath ?? ''}>
          {rootName}
        </div>
      )}

      {isLoading && (
        <div className="file-explorer-status">加载中...</div>
      )}

      {error && (
        <div className="file-explorer-status file-explorer-error">{error}</div>
      )}

      {!rootPath && !isLoading && (
        <div className="file-explorer-empty">
          <p>点击 ⊕ 打开文件夹</p>
        </div>
      )}

      {rootPath && !isLoading && (
        <FileTree
          nodes={tree}
          expandedPaths={expandedPaths}
          onToggle={toggleExpand}
          onFileClick={onFileOpen}
          activeFilePath={activeFilePath}
        />
      )}
    </div>
  );
};

export default FileExplorer;
