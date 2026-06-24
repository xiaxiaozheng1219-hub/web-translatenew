// InputArea 组件 - 原文输入区
import { useState, KeyboardEvent } from 'react';
import { LangDirection } from '../types/translate';
import { Button } from './ui/Button';
import { STORAGE_KEYS, DEFAULT_VALUES } from '../utils/constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface InputAreaProps {
  text: string;
  onTextChange: (text: string) => void;
  lang: LangDirection;
  onLangChange: (lang: LangDirection) => void;
  onTranslate: () => void;
  isLoading: boolean;
}

export function InputArea({
  text,
  onTextChange,
  lang,
  onLangChange,
  onTranslate,
  isLoading,
}: InputAreaProps) {
  const [savedLang, setSavedLang] = useLocalStorage<LangDirection>(
    STORAGE_KEYS.LANG,
    DEFAULT_VALUES.LANG
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (text.trim() && !isLoading) {
        onTranslate();
      }
    }
  };

  const handleLangChange = (newLang: LangDirection) => {
    onLangChange(newLang);
    setSavedLang(newLang);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">原文</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLangChange('zh→en')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              lang === 'zh→en'
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-muted hover:bg-gray-200'
            }`}
          >
            中文 → 英文
          </button>
          <button
            onClick={() => handleLangChange('en→zh')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              lang === 'en→zh'
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-muted hover:bg-gray-200'
            }`}
          >
            英文 → 中文
          </button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入要翻译的文本... (Ctrl + Enter 快速翻译)"
        disabled={isLoading}
        className="flex-1 w-full p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed min-h-[200px]"
      />

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted">
          {text.length} 字符
        </span>
        <Button
          onClick={onTranslate}
          isLoading={isLoading}
          disabled={!text.trim() || isLoading}
          size="lg"
        >
          翻译
        </Button>
      </div>
    </div>
  );
}