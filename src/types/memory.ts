// 翻译记忆库数据模型
export interface MemoryEntry {
  id: string;
  sourceText: string;
  targetText: string;
  lang: 'zh→en' | 'en→zh';
  useCount: number;
  createdAt: string;
}

export const MEMORY_STORAGE_KEY = 'translate_memory_list';