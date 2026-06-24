// 常量定义
export const STORAGE_KEYS = {
  MEMORY: 'translate_memory_list',
  CORPUS: 'corpus_list',
  ENGINE: 'translate_engine',
  LANG: 'translate_lang',
} as const;

export const DEFAULT_VALUES = {
  ENGINE: 'baidu' as const,
  LANG: 'zh→en' as const,
} as const;

export const SIMILARITY_THRESHOLD = 0.4;
export const MAX_RECOMMENDATIONS = 3;
export const MAX_TEXT_LENGTH = 5000;