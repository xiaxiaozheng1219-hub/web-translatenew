// 私有词汇库数据模型
export interface CorpusEntry {
  id: string;
  sourcePhrase: string;
  targetPhrase: string;
  lang: 'zh→en' | 'en→zh';
  category: '俚语' | '口头禅' | '称谓' | '其他';
  createdAt: string;
}

export const CORPUS_STORAGE_KEY = 'corpus_list';