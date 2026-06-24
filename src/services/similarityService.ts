// 模糊匹配算法服务
import { MemoryEntry } from '../types/memory';
import { SimilarRecommendation } from '../types/translate';

export class SimilarityService {
  // 计算 Levenshtein 距离
  private static levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0)
    );

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
        }
      }
    }

    return dp[m][n];
  }

  // 计算相似度分数 (0-1)
  private static similarityScore(source: string, target: string): number {
    const maxLen = Math.max(source.length, target.length);
    if (maxLen === 0) return 1;
    return 1 - this.levenshteinDistance(source, target) / maxLen;
  }

  // 从记忆库中查找最相似的 N 条记录
  static findSimilar(
    text: string,
    lang: string,
    memoryList: MemoryEntry[],
    topN: number = 3,
    threshold: number = 0.4
  ): SimilarRecommendation[] {
    return memoryList
      .filter((entry) => entry.lang === lang)
      .map((entry) => ({
        entry,
        similarity: this.similarityScore(text, entry.sourceText),
      }))
      .filter((item) => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  }
}