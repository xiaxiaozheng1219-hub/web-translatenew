// 翻译记忆库 Hook
import { useState, useCallback } from 'react';
import { MemoryEntry, MEMORY_STORAGE_KEY } from '../types/memory';
import { StorageService } from '../services/storageService';
import { generateUUID } from '../utils/uuid';

export function useMemory() {
  const [memoryList, setMemoryList] = useState<MemoryEntry[]>(() => {
    return StorageService.get<MemoryEntry[]>(MEMORY_STORAGE_KEY, []);
  });

  const saveToMemory = useCallback(
    (sourceText: string, targetText: string, lang: 'zh→en' | 'en→zh') => {
      setMemoryList((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.sourceText === sourceText && item.lang === lang
        );

        if (existingIndex !== -1) {
          // 更新现有记录
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            targetText,
            useCount: updated[existingIndex].useCount + 1,
            createdAt: new Date().toISOString(),
          };
          StorageService.set(MEMORY_STORAGE_KEY, updated);
          return updated;
        } else {
          // 添加新记录
          const newEntry: MemoryEntry = {
            id: generateUUID(),
            sourceText,
            targetText,
            lang,
            useCount: 1,
            createdAt: new Date().toISOString(),
          };
          const updated = [newEntry, ...prev];
          StorageService.set(MEMORY_STORAGE_KEY, updated);
          return updated;
        }
      });
    },
    []
  );

  const findExactMatch = useCallback(
    (sourceText: string, lang: 'zh→en' | 'en→zh'): MemoryEntry | null => {
      return memoryList.find(
        (item) => item.sourceText === sourceText && item.lang === lang
      ) || null;
    },
    [memoryList]
  );

  const deleteEntry = useCallback((id: string) => {
    setMemoryList((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      StorageService.set(MEMORY_STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setMemoryList([]);
    StorageService.set(MEMORY_STORAGE_KEY, []);
  }, []);

  const importEntries = useCallback((entries: MemoryEntry[]) => {
    setMemoryList((prev) => {
      const merged = [...prev];

      entries.forEach((entry) => {
        if (!entry.sourceText || !entry.targetText || !entry.lang) {
          return;
        }

        if (!['zh→en', 'en→zh'].includes(entry.lang)) {
          return;
        }

        const normalizedEntry: MemoryEntry = {
          id: generateUUID(),
          sourceText: entry.sourceText.trim(),
          targetText: entry.targetText.trim(),
          lang: entry.lang as 'zh→en' | 'en→zh',
          useCount: parseInt(entry.useCount?.toString() || '1'),
          createdAt: entry.createdAt || new Date().toISOString(),
        };

        const existingIndex = merged.findIndex(
          (item) => item.sourceText === normalizedEntry.sourceText && item.lang === normalizedEntry.lang
        );

        if (existingIndex !== -1) {
          merged[existingIndex] = normalizedEntry;
        } else {
          merged.push(normalizedEntry);
        }
      });

      StorageService.set(MEMORY_STORAGE_KEY, merged);
      return merged;
    });
  }, []);

  return {
    memoryList,
    saveToMemory,
    findExactMatch,
    deleteEntry,
    clearAll,
    importEntries,
  };
}