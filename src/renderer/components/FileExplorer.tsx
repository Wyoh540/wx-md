import React, { useState, useCallback, useEffect, useRef } from 'react';
import FileTree from './FileTree';
import type { FileNode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderOpen, RefreshCw, FilePlus, FolderPlus } from 'lucide-react';
import CreateItemDialog from './CreateItemDialog';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  createFile: (dirPath: string, fileName: string) => Promise<string | null>;
  createFolder: (dirPath: string, folderName: string) => Promise<string | null>;
  deleteFile: (filePath: string) => Promise<boolean>;
  deleteDirectory: (dirPath: string) => Promise<boolean>;
  renameFile: (filePath: string, newName: string) => Promise<boolean>;
  renameDirectory: (dirPath: string, newName: string) => Promise<boolean>;
  setActiveFolderPath: (path: string | null) => void;
}

const getParentDir = (p: string) => {
  const lastSep = Math.max(p.lastIndexOf('\\'), p.lastIndexOf('/'));
  return lastSep > 0 ? p.slice(0, lastSep) : p;
};

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
  deleteFile,
  deleteDirectory,
  renameFile,
  renameDirectory,
  setActiveFolderPath,
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [createTargetDir, setCreateTargetDir] = useState<string>('');

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameNode, setRenameNode] = useState<FileNode | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteNode, setDeleteNode] = useState<FileNode | null>(null);

  const contextMenuNodeRef = useRef<FileNode | null>(null);

  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const rootName = rootPath ? rootPath.split(/[\\/]/).pop() : null;

  // 同步标签页的激活文件到资源管理器选中状态
  useEffect(() => {
    if (activeFilePath) {
      setSelectedPath(activeFilePath);
    }
  }, [activeFilePath]);

  const handleCreateFile = () => {
    if (!rootPath) return;
    setCreateType('file');
    setCreateTargetDir(rootPath);
    setCreateDialogOpen(true);
  };

  const handleCreateFolder = () => {
    if (!rootPath) return;
    setCreateType('folder');
    setCreateTargetDir(rootPath);
    setCreateDialogOpen(true);
  };

  const handleCreateConfirm = async (name: string) => {
    if (createType === 'file') {
      const filePath = await createFile(createTargetDir, name);
      if (filePath) onFileOpen(filePath);
    } else {
      await createFolder(createTargetDir, name);
    }
  };

  const handleContextMenu = useCallback((_e: React.MouseEvent, node: FileNode) => {
    contextMenuNodeRef.current = node;
  }, []);

  const handleMenuNewFile = () => {
    const node = contextMenuNodeRef.current;
    const targetDir = node
      ? (node.type === 'directory' ? node.path : getParentDir(node.path))
      : (rootPath ?? '');
    if (!targetDir) return;
    setCreateType('file');
    setCreateTargetDir(targetDir);
    setCreateDialogOpen(true);
  };

  const handleMenuNewFolder = () => {
    const node = contextMenuNodeRef.current;
    const targetDir = node
      ? (node.type === 'directory' ? node.path : getParentDir(node.path))
      : (rootPath ?? '');
    if (!targetDir) return;
    setCreateType('folder');
    setCreateTargetDir(targetDir);
    setCreateDialogOpen(true);
  };

  const handleMenuRename = () => {
    const node = contextMenuNodeRef.current;
    if (!node) return;
    setRenameNode(node);
    setRenameDialogOpen(true);
  };

  const handleMenuDelete = () => {
    const node = contextMenuNodeRef.current;
    if (!node) return;
    setDeleteNode(node);
    setDeleteDialogOpen(true);
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!renameNode) return;
    if (renameNode.type === 'file') {
      await renameFile(renameNode.path, newName);
    } else {
      await renameDirectory(renameNode.path, newName);
    }
    setRenameDialogOpen(false);
    setRenameNode(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteNode) return;
    if (deleteNode.type === 'file') {
      await deleteFile(deleteNode.path);
    } else {
      await deleteDirectory(deleteNode.path);
    }
    setDeleteDialogOpen(false);
    setDeleteNode(null);
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
          <ContextMenu onOpenChange={(open) => {
            if (!open) {
              contextMenuNodeRef.current = null;
            }
          }}>
            <ContextMenuTrigger className="h-full block">
              <ScrollArea className="h-full">
                <div>
                  <FileTree
                    nodes={tree}
                    expandedPaths={expandedPaths}
                    onToggle={toggleExpand}
                    onFileClick={(path) => {
                      setSelectedPath(path);
                      onFileOpen(path);
                    }}
                    onFolderClick={(path) => {
                      setSelectedPath(path);
                      setActiveFolderPath(path);
                    }}
                    onContextMenu={handleContextMenu}
                    onSelect={setSelectedPath}
                    selectedPath={selectedPath}
                  />
                </div>
              </ScrollArea>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                disabled={contextMenuNodeRef.current?.type !== 'file'}
                onSelect={() => {
                  const node = contextMenuNodeRef.current;
                  if (node?.type === 'file') onFileOpen(node.path);
                }}
              >
                打开
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={handleMenuNewFile}>新建文件</ContextMenuItem>
              <ContextMenuItem onSelect={handleMenuNewFolder}>新建文件夹</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                disabled={!contextMenuNodeRef.current}
                onSelect={handleMenuRename}
              >
                重命名
              </ContextMenuItem>
              <ContextMenuItem
                disabled={!contextMenuNodeRef.current}
                onSelect={handleMenuDelete}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                删除
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={refresh}>刷新</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </CardContent>

      <CreateItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title={createType === 'file' ? '新建文件' : '新建文件夹'}
        label={createType === 'file' ? '文件名' : '文件夹名'}
        onConfirm={handleCreateConfirm}
      />

      <CreateItemDialog
        open={renameDialogOpen}
        onOpenChange={(open) => {
          setRenameDialogOpen(open);
          if (!open) setRenameNode(null);
        }}
        title="重命名"
        label="新名称"
        defaultName={renameNode?.name ?? ''}
        onConfirm={handleRenameConfirm}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 "{deleteNode?.name}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default FileExplorer;
