// 语音识别 Hook
import { useState, useCallback, useRef, useEffect } from 'react';
import { SpeechState } from '../types/speech';
import { useTranslate } from './useTranslate';
import { Engine, LangDirection } from '../types/translate';

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    isSupported: typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    permissionState: 'unknown',
    interimText: '',
    finalText: '',
    translatedText: '',
  });

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const { translate } = useTranslate();
  const currentEngineRef = useRef<Engine>('baidu');
  const currentLangRef = useRef<LangDirection>('zh→en');

  const getRecognitionLang = (lang: LangDirection): string => {
    return lang === 'zh→en' ? 'zh-CN' : 'en-US';
  };

  // 设置当前引擎和语言
  const setEngine = useCallback((engine: Engine) => {
    currentEngineRef.current = engine;
  }, []);

  const setLang = useCallback((lang: LangDirection) => {
    currentLangRef.current = lang;
    if (recognitionRef.current) {
      recognitionRef.current.lang = getRecognitionLang(lang);
    }
  }, []);

  // 初始化 Recognition 实例
  useEffect(() => {
    if (!state.isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getRecognitionLang(currentLangRef.current);

    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;

          translate(final, currentLangRef.current, currentEngineRef.current)
            .then((result) => {
              setState((prev) => ({
                ...prev,
                translatedText: result.translatedText,
              }));
            })
            .catch(() => {
              // 翻译失败时不影响语音识别
            });
        } else {
          interim += transcript;
        }
      }

      setState((prev) => ({
        ...prev,
        interimText: interim,
        finalText: prev.finalText + final,
      }));
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setState((prev) => ({
        ...prev,
        isListening: false,
        permissionState: event.error === 'not-allowed' ? 'denied' : 'unknown',
      }));
      isListeningRef.current = false;
      
      if (event.error === 'network') {
        alert('网络连接问题，语音识别需要联网。请检查网络设置。');
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          setState((prev) => ({ ...prev, isListening: false }));
          isListeningRef.current = false;
        }
      }
    };

    recognitionRef.current = recognition;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isSupported]);

  const start = useCallback(() => {
    if (!state.isSupported) {
      alert('当前浏览器不支持语音识别，请使用 Chrome');
      return;
    }

    try {
      recognitionRef.current?.start();
      isListeningRef.current = true;
      setState((prev) => ({
        ...prev,
        isListening: true,
        permissionState: 'granted',
        interimText: '',
        finalText: '',
        translatedText: '',
      }));
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      alert('无法启动语音识别，请检查麦克风权限和网络连接');
    }
  }, [state.isSupported]);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    setState((prev) => ({
      ...prev,
      isListening: false,
    }));
  }, []);

  const clear = useCallback(() => {
    setState((prev) => ({
      ...prev,
      interimText: '',
      finalText: '',
      translatedText: '',
    }));
  }, []);

  return {
    state,
    start,
    stop,
    clear,
    setEngine,
    setLang,
  };
}