import React from 'react';
import { cn } from '@/lib/utils';
import type { FileNode } from '@/types';
import { FileText, Image, ChevronRight, ChevronDown } from 'lucide-react';
import { isImageFile, isEditableFile } from '@/utils/fileKind';

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  isExpanded: boolean;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onFileClick: (path: string) => void;
  onFolderClick: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
  onSelect: (path: string) => void;
  selectedPath?: string | null;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = React.memo(({
  node,
  depth,
  isExpanded,
  expandedPaths,
  onToggle,
  onFileClick,
  onFolderClick,
  onContextMenu,
  onSelect,
  selectedPath,
}) => {
  const isActive = node.path === selectedPath;
  const isClickable = node.type === 'file' && (isEditableFile(node.name) || isImageFile(node.name));
  const isImage = node.type === 'file' && isImageFile(node.name);

  const handleClick = () => {
    onSelect(node.path);
    if (node.type === 'directory') {
      onToggle(node.path);
      onFolderClick(node.path);
    } else if (isClickable) {
      onFileClick(node.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    onSelect(node.path);
    onContextMenu(e, node);
  };

  return (
    <div data-file-node="true">
      <div
        className={cn(
          "flex items-center gap-1 rounded-sm py-1 cursor-pointer select-none text-sm mx-1",
          isActive && "bg-primary/10 text-primary font-medium",
          node.type === 'file' && !isClickable && "text-muted-foreground cursor-default",
          !isActive && "hover:bg-accent hover:text-accent-foreground"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        title={node.path}
      >
        <span className="flex-shrink-0 w-4 flex items-center justify-center text-muted-foreground">
          {node.type === 'directory' ? (
            isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : isImage ? (
            <Image className="h-3.5 w-3.5" />
          ) : (
            <FileText className="h-3.5 w-3.5" />
          )}
        </span>
        <span className="truncate">{node.name}</span>
      </div>
      {node.type === 'directory' && isExpanded && node.children?.map(child => (
        <FileTreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          isExpanded={expandedPaths.has(child.path)}
          expandedPaths={expandedPaths}
          onToggle={onToggle}
          onFileClick={onFileClick}
          onFolderClick={onFolderClick}
          onContextMenu={onContextMenu}
          onSelect={onSelect}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  );
});
FileTreeNode.displayName = 'FileTreeNode';

interface FileTreeProps {
  nodes: FileNode[];
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onFileClick: (path: string) => void;
  onFolderClick: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
  onSelect: (path: string) => void;
  selectedPath?: string | null;
}

const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  expandedPaths,
  onToggle,
  onFileClick,
  onFolderClick,
  onContextMenu,
  onSelect,
  selectedPath,
}) => {
  return (
    <div className="py-1">
      {nodes.map(node => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={0}
          isExpanded={expandedPaths.has(node.path)}
          expandedPaths={expandedPaths}
          onToggle={onToggle}
          onFileClick={onFileClick}
          onFolderClick={onFolderClick}
          onContextMenu={onContextMenu}
          onSelect={onSelect}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  );
};

export default FileTree;
