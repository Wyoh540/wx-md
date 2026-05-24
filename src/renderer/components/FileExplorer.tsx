import React, { useState } from 'react';
import FileTree from './FileTree';
import type { FileNode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderOpen, RefreshCw, FilePlus, FolderPlus } from 'lucide-react';
import CreateItemDialog from './CreateItemDialog';

interface FileExplorerProps {
  onFileOpen: (filePath: string) => void;
  activeFilePath?: string;
  rootPath: string | null;
  tree: FileNode[];
  expandedPaths: Set<string>;
  isLoading: boolean;
  error: string | null;
  openFolder: () => void;
  toggleExpand: (nodePath: string) => void;
  refresh: () => void;
  createFile: (fileName: string) => Promise<string | null>;
  createFolder: (folderName: string) => Promise<string | null>;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  onFileOpen,
  activeFilePath,
  rootPath,
  tree,
  expandedPaths,
  isLoading,
  error,
  openFolder,
  toggleExpand,
  refresh,
  createFile,
  createFolder,
}) => {

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');

  const rootName = rootPath ? rootPath.split(/[\\/]/).pop() : null;

  const handleCreateFile = () => {
    setCreateType('file');
    setCreateDialogOpen(true);
  };

  const handleCreateFolder = () => {
    setCreateType('folder');
    setCreateDialogOpen(true);
  };

  const handleCreateConfirm = async (name: string) => {
    if (createType === 'file') {
      const filePath = await createFile(name);
      if (filePath) onFileOpen(filePath);
    } else {
      await createFolder(name);
    }
  };

  return (
    <Card className="h-full rounded-none border-0 border-r flex flex-col">
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          资源管理器
        </CardTitle>
        <div className="flex items-center gap-1">
          {rootPath && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCreateFile}
                title="新建文件"
              >
                <FilePlus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCreateFolder}
                title="新建文件夹"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={refresh}
                title="刷新"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </>
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
      <CreateItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title={createType === 'file' ? '新建文件' : '新建文件夹'}
        label={createType === 'file' ? '文件名' : '文件夹名'}
        onConfirm={handleCreateConfirm}
      />
    </Card>
  );
};

export default FileExplorer;
