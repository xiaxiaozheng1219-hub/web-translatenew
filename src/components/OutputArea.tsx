// OutputArea 组件 - 译文展示区
import { useState } from 'react';
import { TranslateResult, SimilarRecommendation } from '../types/translate';
import { Button } from './ui/Button';
import { CopyIcon } from './icons';

interface OutputAreaProps {
  result: TranslateResult | null;
  isLoading: boolean;
  error: string | null;
}

export function OutputArea({ result, isLoading, error }: OutputAreaProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (result?.translatedText) {
      await navigator.clipboard.writeText(result.translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRecommendationClick = (recommendation: SimilarRecommendation) => {
    // 这里应该通知父组件使用推荐的译文
    // 暂时先复制到剪贴板
    navigator.clipboard.writeText(recommendation.entry.targetText);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">译文</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    const isApiKeyError = error.includes('API 密钥未配置');
    return (
      <div className="flex flex-col h-full bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">译文</h2>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-danger mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-muted mb-2">{error}</p>
          {isApiKeyError && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left max-w-sm">
              <p className="text-sm font-medium text-accent mb-2">配置指引</p>
              <ul className="text-sm text-muted space-y-1">
                <li>1. 复制 .env.local.example 文件并重命名为 .env.local</li>
                <li>2. 填入您的 API 密钥</li>
                <li>3. 百度翻译: https://fanyi-api.baidu.com/</li>
                <li>4. DeepSeek: https://platform.deepseek.com/</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">译文</h2>
        {result?.translatedText && (
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <CopyIcon className="w-4 h-4 mr-1" />
            {copied ? '已复制' : '复制'}
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-[200px]">
        {!result ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-muted mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-muted">翻译结果将显示在这里</p>
          </div>
        ) : (
          <div className="h-full">
            <div className="p-4 bg-gray-50 rounded-lg min-h-[200px]">
              <p className="text-foreground whitespace-pre-wrap">{result.translatedText}</p>
              {result.fromMemory && (
                <p className="text-xs text-muted mt-2">来自翻译记忆库</p>
              )}
            </div>

            {result.recommendations.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted mb-2">相似历史翻译</h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <button
                      key={rec.entry.id}
                      onClick={() => handleRecommendationClick(rec)}
                      className="w-full p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted line-clamp-1">
                            {rec.entry.sourceText}
                          </p>
                          <p className="text-sm text-foreground mt-1">
                            {rec.entry.targetText}
                          </p>
                        </div>
                        <span className="text-xs text-muted ml-2">
                          {Math.round(rec.similarity * 100)}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}