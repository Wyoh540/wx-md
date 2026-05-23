import React from 'react';
import { cn } from '@/lib/utils';
import type { FileNode } from '@/types';
import { FileText, ChevronRight, ChevronDown } from 'lucide-react';

const CLICKABLE_EXTENSIONS = /\.(md|markdown|txt)$/i;

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  isExpanded: boolean;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onFileClick: (path: string) => void;
  activeFilePath?: string;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = React.memo(({
  node,
  depth,
  isExpanded,
  expandedPaths,
  onToggle,
  onFileClick,
  activeFilePath,
}) => {
  const isActive = node.path === activeFilePath;
  const isClickable = node.type === 'file' && CLICKABLE_EXTENSIONS.test(node.name);

  const handleClick = () => {
    if (node.type === 'directory') onToggle(node.path);
    else if (isClickable) onFileClick(node.path);
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 rounded-sm py-1 cursor-pointer select-none text-sm mx-1",
          isActive && "bg-primary/10 text-primary font-medium",
          node.type === 'file' && !isClickable && "text-muted-foreground cursor-default",
          !isActive && node.type !== 'file' && "hover:bg-accent hover:text-accent-foreground",
          !isActive && node.type === 'file' && isClickable && "hover:bg-accent hover:text-accent-foreground"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        title={node.path}
      >
        <span className="flex-shrink-0 w-4 flex items-center justify-center text-muted-foreground">
          {node.type === 'directory' ? (
            isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
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
          activeFilePath={activeFilePath}
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
  activeFilePath?: string;
}

const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  expandedPaths,
  onToggle,
  onFileClick,
  activeFilePath,
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
          activeFilePath={activeFilePath}
        />
      ))}
    </div>
  );
};

export default FileTree;
