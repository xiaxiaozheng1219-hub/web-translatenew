// MemoryTab 组件 - 翻译记忆库 Tab
import { useState } from 'react';
import { MemoryEntry } from '../types/memory';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { DeleteIcon, SearchIcon } from './icons';
import { useMemory } from '../hooks/useMemory';

interface MemoryTabProps {
  memoryList: MemoryEntry[];
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
}

export function MemoryTab({ memoryList, onDeleteEntry, onClearAll }: MemoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredList = memoryList.filter((item) =>
    item.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.targetText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDeleteEntry(deleteId);
    }
    setShowDeleteDialog(false);
    setDeleteId(null);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="搜索翻译记录..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {memoryList.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowClearDialog(true)}
          >
            一键清空
          </Button>
        )}
      </div>

      {filteredList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted">
            {searchQuery ? '未找到匹配的翻译记录' : '暂无翻译记录，开始翻译后自动保存'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-accent rounded">
                      {item.lang}
                    </span>
                    <span className="text-xs text-muted">
                      使用 {item.useCount} 次
                    </span>
                    <span className="text-xs text-muted">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-1 line-clamp-2">
                    {item.sourceText}
                  </p>
                  <p className="text-sm text-muted line-clamp-2">
                    {item.targetText}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteClick(item.id)}
                  className="text-muted hover:text-danger transition-colors flex-shrink-0"
                >
                  <DeleteIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={onClearAll}
        title="确认清空"
        message="确定清空所有翻译记忆？此操作不可恢复。"
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="确认删除"
        message="确定删除这条翻译记录？此操作不可恢复。"
      />
    </div>
  );
}