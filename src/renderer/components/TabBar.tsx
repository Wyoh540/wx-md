import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Tab } from '@/types';
import { X, Circle } from 'lucide-react';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onSelect, onClose }) => {
  if (tabs.length === 0) {
    return (
      <div className="flex items-center px-3 h-9 border-b bg-muted/50 text-xs text-muted-foreground">
        <span>无打开文件</span>
      </div>
    );
  }

  return (
    <div className="flex items-center overflow-x-auto border-b bg-muted/50 scrollbar-thin">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={cn(
            "group flex items-center gap-1.5 px-3 h-9 cursor-pointer select-none text-xs border-r transition-colors min-w-[120px] max-w-[200px]",
            tab.id === activeTabId
              ? "bg-background text-foreground border-b-2 border-b-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={() => onSelect(tab.id)}
          title={tab.filePath}
        >
          {tab.isDirty && (
            <Circle className="h-2 w-2 fill-primary text-primary flex-shrink-0" />
          )}
          <span className="truncate flex-1">{tab.title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default TabBar;
