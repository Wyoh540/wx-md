import React from 'react';
import FileTree from './FileTree';
import { useFileTree } from '../hooks/useFileTree';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderOpen, RefreshCw } from 'lucide-react';

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
    <Card className="h-full rounded-none border-0 border-r flex flex-col">
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          资源管理器
        </CardTitle>
        <div className="flex items-center gap-1">
          {rootPath && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={refresh}
              title="刷新"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => void openFolder()}
            title="打开文件夹"
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      {rootName && (
        <div className="px-3 py-1.5 text-xs font-semibold text-foreground border-b truncate" title={rootPath ?? ''}>
          {rootName}
        </div>
      )}

      <CardContent className="flex-1 p-0 overflow-hidden">
        {isLoading && (
          <div className="p-4 text-xs text-muted-foreground text-center">加载中...</div>
        )}

        {error && (
          <div className="p-4 text-xs text-destructive text-center">{error}</div>
        )}

        {!rootPath && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground">点击打开文件夹按钮<br />浏览 Markdown 文件</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => void openFolder()}
            >
              <FolderOpen className="h-3.5 w-3.5 mr-1" />
              打开文件夹
            </Button>
          </div>
        )}

        {rootPath && !isLoading && !error && (
          <ScrollArea className="h-full">
            <FileTree
              nodes={tree}
              expandedPaths={expandedPaths}
              onToggle={toggleExpand}
              onFileClick={onFileOpen}
              activeFilePath={activeFilePath}
            />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default FileExplorer;
