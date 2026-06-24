// 翻译核心逻辑 Hook
import { useState, useCallback } from 'react';
import { useMemory } from './useMemory';
import { useCorpus } from './useCorpus';
import { TranslateApiService } from '../services/translateApi';
import { SimilarityService } from '../services/similarityService';
import { TranslateResult, LangDirection, Engine } from '../types/translate';
import { MAX_RECOMMENDATIONS, SIMILARITY_THRESHOLD } from '../utils/constants';

export function useTranslate() {
  const { memoryList, saveToMemory, findExactMatch } = useMemory();
  const { applyCorpus } = useCorpus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async (
      text: string,
      lang: LangDirection,
      engine: Engine
    ): Promise<TranslateResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: 私有词汇替换
        const processedText = applyCorpus(text, lang);

        // Step 2: 记忆库精准匹配
        const exactMatch = findExactMatch(processedText, lang);
        if (exactMatch) {
          setIsLoading(false);
          return {
            translatedText: exactMatch.targetText,
            fromMemory: true,
            fromCache: false,
            engine: 'memory',
            recommendations: [],
          };
        }

        // Step 3: 相似推荐
        const recommendations = SimilarityService.findSimilar(
          processedText,
          lang,
          memoryList,
          MAX_RECOMMENDATIONS,
          SIMILARITY_THRESHOLD
        );

        // Step 4: API 翻译
        const [from, to] = lang.split('→') as ['zh' | 'en', 'zh' | 'en'];
        const response = await TranslateApiService.translate({
          text: processedText,
          from,
          to,
          engine,
        });

        // Step 5: 自动存入记忆库
        saveToMemory(text, response.translatedText, lang);

        setIsLoading(false);
        return {
          translatedText: response.translatedText,
          fromMemory: false,
          fromCache: false,
          engine,
          recommendations,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '翻译失败';
        setError(errorMessage);
        setIsLoading(false);
        throw err;
      }
    },
    [memoryList, saveToMemory, findExactMatch, applyCorpus]
  );

  return {
    translate,
    isLoading,
    error,
    memoryList,
  };
}