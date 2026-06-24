// CorpusTab 组件 - 私有词汇库 Tab
import { useState, useRef } from 'react';
import { CorpusEntry } from '../types/corpus';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { DeleteIcon, AddIcon, UploadIcon, DownloadIcon } from './icons';
import { CSVService } from '../services/csvService';

interface CorpusTabProps {
  corpusList: CorpusEntry[];
  onAddEntry: (sourcePhrase: string, targetPhrase: string, lang: 'zh→en' | 'en→zh', category: '俚语' | '口头禅' | '称谓' | '其他') => void;
  onDeleteEntry: (id: string) => void;
  onImportEntries: (entries: CorpusEntry[]) => void;
  onClearAll: () => void;
}

export function CorpusTab({
  corpusList,
  onAddEntry,
  onDeleteEntry,
  onImportEntries,
  onClearAll,
}: CorpusTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sourcePhrase: '',
    targetPhrase: '',
    lang: 'zh→en' as 'zh→en' | 'en→zh',
    category: '其他' as '俚语' | '口头禅' | '称谓' | '其他',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSubmit = () => {
    if (formData.sourcePhrase.trim() && formData.targetPhrase.trim()) {
      onAddEntry(
        formData.sourcePhrase,
        formData.targetPhrase,
        formData.lang,
        formData.category
      );
      setFormData({
        sourcePhrase: '',
        targetPhrase: '',
        lang: 'zh→en',
        category: '其他',
      });
      setShowAddModal(false);
    }
  };

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

  const handleExport = () => {
    CSVService.exportCorpus(corpusList);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        console.log('CSV Content:', content);
        const entries = CSVService.parseCSV<CorpusEntry>(content);
        console.log('Parsed entries:', entries);
        onImportEntries(entries);
      } catch (error) {
        console.error('Failed to parse CSV:', error);
        alert('CSV 文件格式错误，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <AddIcon className="w-4 h-4 mr-1" />
            添加词条
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <UploadIcon className="w-4 h-4 mr-1" />
            导入 CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={corpusList.length === 0}>
            <DownloadIcon className="w-4 h-4 mr-1" />
            导出 CSV
          </Button>
        </div>

        {corpusList.length > 0 && (
          <Button variant="danger" size="sm" onClick={() => setShowClearDialog(true)}>
            一键清空
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {corpusList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted">暂无私有词汇，添加常用短语后可自动替换</p>
        </div>
      ) : (
        <div className="space-y-2">
          {corpusList.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-success rounded">
                      {item.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-accent rounded">
                      {item.lang}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-1">
                    {item.sourcePhrase} → {item.targetPhrase}
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

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加私有词汇"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              原文短语
            </label>
            <input
              type="text"
              value={formData.sourcePhrase}
              onChange={(e) => setFormData({ ...formData, sourcePhrase: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="例如：what's up"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              固定译文
            </label>
            <input
              type="text"
              value={formData.targetPhrase}
              onChange={(e) => setFormData({ ...formData, targetPhrase: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="例如：最近怎么样"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              语种方向
            </label>
            <select
              value={formData.lang}
              onChange={(e) => setFormData({ ...formData, lang: e.target.value as any })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="zh→en">中文 → 英文</option>
              <option value="en→zh">英文 → 中文</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              分类
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="俚语">俚语</option>
              <option value="口头禅">口头禅</option>
              <option value="称谓">称谓</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              取消
            </Button>
            <Button onClick={handleAddSubmit}>
              保存
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={onClearAll}
        title="确认清空"
        message="确定清空所有私有词汇？此操作不可恢复。"
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="确认删除"
        message="确定删除这条词汇？此操作不可恢复。"
      />
    </div>
  );
}