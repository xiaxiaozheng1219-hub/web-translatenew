'use client';

import { useState, useCallback, useEffect } from 'react';
import { Header } from '../components/Header';
import { InputArea } from '../components/InputArea';
import { OutputArea } from '../components/OutputArea';
import { BottomPanel } from '../components/BottomPanel';
import { MemoryTab } from '../components/MemoryTab';
import { CorpusTab } from '../components/CorpusTab';
import { DataManageTab } from '../components/DataManageTab';
import { ToastContainer } from '../components/ui/Toast';

import { useTranslate } from '../hooks/useTranslate';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useMemory } from '../hooks/useMemory';
import { useCorpus } from '../hooks/useCorpus';
import { useLocalStorage } from '../hooks/useLocalStorage';

import { Engine, LangDirection, TranslateResult } from '../types/translate';
import { STORAGE_KEYS, DEFAULT_VALUES } from '../utils/constants';

type ToastType = 'success' | 'error' | 'info';

export default function Home() {
  // 状态管理
  const [inputText, setInputText] = useState('');
  const [translateResult, setTranslateResult] = useState<TranslateResult | null>(null);
  const [engine, setEngine] = useState<Engine>(DEFAULT_VALUES.ENGINE);
  const [lang, setLang] = useState<LangDirection>(DEFAULT_VALUES.LANG);
  const [activeTab, setActiveTab] = useState<'memory' | 'corpus' | 'data'>('memory');
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Hooks
  const { translate, isLoading, error, memoryList } = useTranslate();
  const { state: speechState, start: startSpeech, stop: stopSpeech, clear: clearSpeech, setEngine: setSpeechEngine, setLang: setSpeechLang } = useSpeechRecognition();
  const { deleteEntry: deleteMemoryEntry, clearAll: clearAllMemory, importEntries: importMemoryEntries } = useMemory();
  const { addEntry: addCorpusEntry, deleteEntry: deleteCorpusEntry, clearAll: clearAllCorpus, importEntries: importCorpusEntries, corpusList } = useCorpus();

  // 确保只在客户端挂载后渲染 FloatPanel
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 初始化设置
  useEffect(() => {
    const savedEngine = localStorage.getItem(STORAGE_KEYS.ENGINE);
    const savedLang = localStorage.getItem(STORAGE_KEYS.LANG);

    if (savedEngine) setEngine(savedEngine as Engine);
    if (savedLang) setLang(savedLang as LangDirection);
  }, []);

  // 同步语音识别的引擎和语言设置
  useEffect(() => {
    setSpeechEngine(engine);
    setSpeechLang(lang);
  }, [engine, lang, setSpeechEngine, setSpeechLang]);

  // Toast 功能
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // 翻译处理
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    try {
      const result = await translate(inputText, lang, engine);
      setTranslateResult(result);

      if (result.fromMemory) {
        showToast('来自翻译记忆库', 'success');
      } else {
        showToast('翻译完成', 'success');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '翻译失败', 'error');
    }
  }, [inputText, lang, engine, translate, showToast]);

  // 记忆库操作
  const handleDeleteMemoryEntry = useCallback((id: string) => {
    deleteMemoryEntry(id);
    showToast('记录已删除', 'success');
  }, [deleteMemoryEntry, showToast]);

  const handleClearAllMemory = useCallback(() => {
    clearAllMemory();
    showToast('记忆库已清空', 'success');
  }, [clearAllMemory, showToast]);

  // 词汇库操作
  const handleAddCorpusEntry = useCallback((
    sourcePhrase: string,
    targetPhrase: string,
    lang: LangDirection,
    category: '俚语' | '口头禅' | '称谓' | '其他'
  ) => {
    addCorpusEntry(sourcePhrase, targetPhrase, lang, category);
    showToast('词条已添加', 'success');
  }, [addCorpusEntry, showToast]);

  const handleDeleteCorpusEntry = useCallback((id: string) => {
    deleteCorpusEntry(id);
    showToast('词条已删除', 'success');
  }, [deleteCorpusEntry, showToast]);

  const handleClearAllCorpus = useCallback(() => {
    clearAllCorpus();
    showToast('词汇库已清空', 'success');
  }, [clearAllCorpus, showToast]);

  const handleImportCorpusEntries = useCallback((entries: any[]) => {
    importCorpusEntries(entries, (successCount, failCount) => {
      if (successCount > 0) {
        showToast(`成功导入 ${successCount} 条词条${failCount > 0 ? `，跳过 ${failCount} 条无效数据` : ''}`, 'success');
      } else {
        showToast('未导入任何有效数据，请检查 CSV 文件格式', 'error');
      }
    });
  }, [importCorpusEntries, showToast]);

  // 数据管理操作
  const handleImportMemoryEntries = useCallback((entries: any[]) => {
    importMemoryEntries(entries);
    showToast(`成功导入 ${entries.length} 条记录`, 'success');
  }, [importMemoryEntries, showToast]);

  // 动态导入 FloatPanel
  const [FloatPanel, setFloatPanel] = useState<any>(null);

  useEffect(() => {
    if (isMounted) {
      import('../components/FloatPanel').then((module) => {
        setFloatPanel(() => module.FloatPanel);
      });
    }
  }, [isMounted]);

  return (
    <div className="min-h-screen bg-background">
      <Header engine={engine} onEngineChange={setEngine} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 主内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InputArea
            text={inputText}
            onTextChange={setInputText}
            lang={lang}
            onLangChange={setLang}
            onTranslate={handleTranslate}
            isLoading={isLoading}
          />

          <OutputArea
            result={translateResult}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* 底部面板 */}
        <BottomPanel activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'memory' && (
            <MemoryTab
              memoryList={memoryList}
              onDeleteEntry={handleDeleteMemoryEntry}
              onClearAll={handleClearAllMemory}
            />
          )}

          {activeTab === 'corpus' && (
            <CorpusTab
              corpusList={corpusList}
              onAddEntry={handleAddCorpusEntry}
              onDeleteEntry={handleDeleteCorpusEntry}
              onImportEntries={handleImportCorpusEntries}
              onClearAll={handleClearAllCorpus}
            />
          )}

          {activeTab === 'data' && (
            <DataManageTab
              memoryList={memoryList}
              corpusList={corpusList}
              onImportMemory={handleImportMemoryEntries}
              onImportCorpus={handleImportCorpusEntries}
            />
          )}
        </BottomPanel>
      </main>

      {/* 语音悬浮窗 */}
      {isMounted && FloatPanel && (
        <FloatPanel
          speechState={speechState}
          onStart={startSpeech}
          onStop={stopSpeech}
          onClear={clearSpeech}
        />
      )}

      {/* Toast 容器 */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}