// BottomPanel 组件 - 底部折叠面板
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from './icons';

type TabType = 'memory' | 'corpus' | 'data';

interface BottomPanelProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
}

export function BottomPanel({ activeTab, onTabChange, children }: BottomPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    { id: 'memory' as TabType, label: '翻译记忆库' },
    { id: 'corpus' as TabType, label: '私有词汇库' },
    { id: 'data' as TabType, label: '数据管理' },
  ];

  return (
    <div className="border-t border-border bg-white">
      {/* Tab 栏 */}
      <div className="flex items-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-4 py-3 text-sm text-muted hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              if (!isExpanded) setIsExpanded(true);
            }}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-accent'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      {isExpanded && (
        <div className="border-t border-border">
          <div className="max-h-[300px] overflow-y-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}