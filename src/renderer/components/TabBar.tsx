import React from 'react';
import type { Tab } from '@/types';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onSelect, onClose }) => {
  if (tabs.length === 0) {
    return (
      <div className="tab-bar tab-bar-empty">
        <span>无打开文件</span>
      </div>
    );
  }

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`tab-item ${tab.id === activeTabId ? 'tab-item-active' : ''}`}
          onClick={() => onSelect(tab.id)}
          title={tab.filePath}
        >
          {tab.isDirty && (
            <span className="tab-dirty-indicator" title="未保存">●</span>
          )}
          <span className="tab-title">{tab.title}</span>
          <button
            className="tab-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
            title="关闭"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default TabBar;
