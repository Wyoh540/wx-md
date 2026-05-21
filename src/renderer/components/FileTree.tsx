import React from 'react';
import type { FileNode } from '@/types';

const CLICKABLE_EXTENSIONS = /\.(md|markdown|txt)$/i;

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onFileClick: (path: string) => void;
  activeFilePath?: string;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  depth,
  expandedPaths,
  onToggle,
  onFileClick,
  activeFilePath,
}) => {
  const isExpanded = expandedPaths.has(node.path);
  const isActive = node.path === activeFilePath;
  const isClickable = node.type === 'file' && CLICKABLE_EXTENSIONS.test(node.name);

  const handleClick = () => {
    if (node.type === 'directory') onToggle(node.path);
    else if (isClickable) onFileClick(node.path);
  };

  const nodeClasses = [
    'file-tree-node',
    isActive ? 'file-tree-node-active' : '',
    node.type === 'file' && !isClickable ? 'file-tree-node-disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div>
      <div
        className={nodeClasses}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        title={node.path}
      >
        <span className="file-tree-icon">
          {node.type === 'directory'
            ? (isExpanded ? '▾' : '▸')
            : '·'}
        </span>
        <span className="file-tree-name">{node.name}</span>
      </div>
      {node.type === 'directory' && isExpanded && node.children?.map(child => (
        <FileTreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          expandedPaths={expandedPaths}
          onToggle={onToggle}
          onFileClick={onFileClick}
          activeFilePath={activeFilePath}
        />
      ))}
    </div>
  );
};

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
    <div className="file-tree">
      {nodes.map(node => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={0}
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
