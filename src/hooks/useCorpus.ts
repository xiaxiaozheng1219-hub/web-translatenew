// 私有词汇库 Hook
import { useState, useCallback } from 'react';
import { CorpusEntry, CORPUS_STORAGE_KEY } from '../types/corpus';
import { StorageService } from '../services/storageService';
import { generateUUID } from '../utils/uuid';

export function useCorpus() {
  const [corpusList, setCorpusList] = useState<CorpusEntry[]>(() => {
    return StorageService.get<CorpusEntry[]>(CORPUS_STORAGE_KEY, []);
  });

  const addEntry = useCallback(
    (
      sourcePhrase: string,
      targetPhrase: string,
      lang: 'zh→en' | 'en→zh',
      category: '俚语' | '口头禅' | '称谓' | '其他'
    ) => {
      setCorpusList((prev) => {
        // 检查是否已存在
        const existingIndex = prev.findIndex(
          (item) => item.sourcePhrase === sourcePhrase && item.lang === lang
        );

        if (existingIndex !== -1) {
          // 更新现有记录
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            targetPhrase,
            category,
            createdAt: new Date().toISOString(),
          };
          StorageService.set(CORPUS_STORAGE_KEY, updated);
          return updated;
        } else {
          // 添加新记录
          const newEntry: CorpusEntry = {
            id: generateUUID(),
            sourcePhrase,
            targetPhrase,
            lang,
            category,
            createdAt: new Date().toISOString(),
          };
          const updated = [newEntry, ...prev];
          StorageService.set(CORPUS_STORAGE_KEY, updated);
          return updated;
        }
      });
    },
    []
  );

  const deleteEntry = useCallback((id: string) => {
    setCorpusList((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      StorageService.set(CORPUS_STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setCorpusList([]);
    StorageService.set(CORPUS_STORAGE_KEY, []);
  }, []);

  const importEntries = useCallback((entries: any[], onComplete?: (successCount: number, failCount: number) => void) => {
    setCorpusList((prev) => {
      const merged = [...prev];
      let successCount = 0;
      let failCount = 0;

      entries.forEach((entry) => {
        let source = '';
        let target = '';
        let lang = '';

        const keys = Object.keys(entry);
        for (const key of keys) {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes('source') || lowerKey.includes('original') || lowerKey.includes('src') || lowerKey.includes('原文')) {
            source = String(entry[key] || '').trim();
          } else if (lowerKey.includes('target') || lowerKey.includes('translation') || lowerKey.includes('dest') || lowerKey.includes('译文')) {
            target = String(entry[key] || '').trim();
          } else if (lowerKey.includes('lang') || lowerKey.includes('direction') || lowerKey.includes('dir') || lowerKey.includes('语种') || lowerKey.includes('语言')) {
            lang = String(entry[key] || '').trim();
          }
        }

        if (!source || !target) {
          failCount++;
          return;
        }

        let normalizedLang = '';
        if (!lang) {
          normalizedLang = 'en→zh';
        } else {
          const langLower = lang.toLowerCase();
          if (langLower.includes('zh') && langLower.includes('en')) {
            if (langLower.indexOf('zh') < langLower.indexOf('en')) {
              normalizedLang = 'zh→en';
            } else {
              normalizedLang = 'en→zh';
            }
          } else {
            normalizedLang = 'en→zh';
          }
        }

        const normalizedEntry: CorpusEntry = {
          id: generateUUID(),
          sourcePhrase: source,
          targetPhrase: target,
          lang: normalizedLang as 'zh→en' | 'en→zh',
          category: '其他',
          createdAt: new Date().toISOString(),
        };

        const existingIndex = merged.findIndex(
          (item) => item.sourcePhrase === normalizedEntry.sourcePhrase && item.lang === normalizedEntry.lang
        );

        if (existingIndex !== -1) {
          merged[existingIndex] = normalizedEntry;
        } else {
          merged.push(normalizedEntry);
        }
        successCount++;
      });

      StorageService.set(CORPUS_STORAGE_KEY, merged);

      if (onComplete) {
        onComplete(successCount, failCount);
      }

      return merged;
    });
  }, []);

  const applyCorpus = useCallback(
    (text: string, lang: 'zh→en' | 'en→zh'): string => {
      let result = text;
      corpusList.forEach((entry) => {
        if (entry.lang === lang) {
          result = result.replaceAll(entry.sourcePhrase, entry.targetPhrase);
        }
      });
      return result;
    },
    [corpusList]
  );

  return {
    corpusList,
    addEntry,
    deleteEntry,
    clearAll,
    importEntries,
    applyCorpus,
  };
}