// 翻译相关类型
import { MemoryEntry } from './memory';

export type LangDirection = 'zh→en' | 'en→zh';
export type Engine = 'baidu' | 'deepseek' | 'memory';

export interface TranslateRequest {
  text: string;
  from: 'zh' | 'en';
  to: 'zh' | 'en';
  engine: Engine;
}

export interface TranslateResponse {
  translatedText: string;
  engine: string;
  fromMemory: boolean;
}

export interface TranslateResult {
  translatedText: string;
  fromMemory: boolean;
  fromCache: boolean;
  engine: Engine;
  recommendations: SimilarRecommendation[];
}

export interface SimilarRecommendation {
  entry: MemoryEntry;
  similarity: number;
}