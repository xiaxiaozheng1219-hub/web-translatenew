// DataManageTab 组件 - 数据管理 Tab
import { useRef } from 'react';
import { MemoryEntry } from '../types/memory';
import { CorpusEntry } from '../types/corpus';
import { Button } from './ui/Button';
import { UploadIcon, DownloadIcon } from './icons';
import { CSVService } from '../services/csvService';

interface DataManageTabProps {
  memoryList: MemoryEntry[];
  corpusList: CorpusEntry[];
  onImportMemory: (entries: MemoryEntry[]) => void;
  onImportCorpus: (entries: CorpusEntry[]) => void;
}

export function DataManageTab({
  memoryList,
  corpusList,
  onImportMemory,
  onImportCorpus,
}: DataManageTabProps) {
  const memoryInputRef = useRef<HTMLInputElement>(null);
  const corpusInputRef = useRef<HTMLInputElement>(null);

  const handleExportMemory = () => {
    if (memoryList.length === 0) {
      alert('暂无记忆库数据可导出');
      return;
    }
    CSVService.exportMemory(memoryList);
  };

  const handleExportCorpus = () => {
    if (corpusList.length === 0) {
      alert('暂无词汇库数据可导出');
      return;
    }
    CSVService.exportCorpus(corpusList);
  };

  const handleImportMemory = () => {
    memoryInputRef.current?.click();
  };

  const handleImportCorpus = () => {
    corpusInputRef.current?.click();
  };

  const handleMemoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const entries = CSVService.parseCSV<MemoryEntry>(content);
        onImportMemory(entries);
        alert(`成功导入 ${entries.length} 条记忆库记录`);
      } catch (error) {
        console.error('Failed to parse CSV:', error);
        alert('CSV 文件格式错误，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  const handleCorpusFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const entries = CSVService.parseCSV<CorpusEntry>(content);
        onImportCorpus(entries);
        alert(`成功导入 ${entries.length} 条词汇库记录`);
      } catch (error) {
        console.error('Failed to parse CSV:', error);
        alert('CSV 文件格式错误，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  const dataCards = [
    {
      title: '翻译记忆库',
      description: '管理历史翻译记录，支持导入导出',
      count: memoryList.length,
      onExport: handleExportMemory,
      onImport: handleImportMemory,
    },
    {
      title: '私有词汇库',
      description: '管理自定义词汇，支持批量导入导出',
      count: corpusList.length,
      onExport: handleExportCorpus,
      onImport: handleImportCorpus,
    },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataCards.map((card, index) => (
          <div
            key={index}
            className="p-6 bg-gray-50 rounded-xl border border-border"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-muted">{card.description}</p>
              </div>
              <div className="text-2xl font-bold text-accent">
                {card.count}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={card.onExport}
                disabled={card.count === 0}
                className="flex-1"
              >
                <DownloadIcon className="w-4 h-4 mr-1" />
                导出
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={card.onImport}
                className="flex-1"
              >
                <UploadIcon className="w-4 h-4 mr-1" />
                导入
              </Button>
            </div>

            <input
              ref={index === 0 ? memoryInputRef : corpusInputRef}
              type="file"
              accept=".csv"
              onChange={index === 0 ? handleMemoryFileChange : handleCorpusFileChange}
              className="hidden"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-foreground mb-2">数据备份说明</h4>
        <ul className="text-sm text-muted space-y-1">
          <li>• 导出的 CSV 文件可用于数据备份或在其他设备上恢复</li>
          <li>• 导入时会自动去重，相同原文的记录会被覆盖</li>
          <li>• 建议定期导出备份，避免数据丢失</li>
        </ul>
      </div>
    </div>
  );
}