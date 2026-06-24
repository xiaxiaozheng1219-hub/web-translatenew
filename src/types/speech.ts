// 语音识别相关类型
export interface SpeechState {
  isListening: boolean;
  isSupported: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
  interimText: string;
  finalText: string;
  translatedText: string;
}