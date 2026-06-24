// FloatPanel 组件 - 语音实时字幕悬浮窗
import { useState, useRef, useEffect } from 'react';
import { SpeechState } from '../types/speech';
import { MicIcon, StopIcon, CloseIcon } from './icons/index';

interface FloatPanelProps {
  speechState: SpeechState;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
}

export function FloatPanelComponent({ speechState, onStart, onStop, onClear }: FloatPanelProps) {
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;

      // 限制在窗口范围内
      const maxX = window.innerWidth - 360;
      const maxY = window.innerHeight - (isMinimized ? 50 : 400);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isMinimized]);

  if (!speechState.isSupported) {
    return null;
  }

  return (
    <div
      ref={dragRef}
      className={`fixed bg-white rounded-xl shadow-float border border-border z-50 transition-all duration-300 ${
        isMinimized ? 'w-64 h-12' : 'w-80 max-h-[400px]'
      }`}
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
      }}
    >
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-border cursor-move bg-gray-50 rounded-t-xl"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              speechState.isListening ? 'bg-success animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm font-medium text-foreground">语音实时字幕</span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-muted hover:text-foreground transition-colors"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* 内容区域 */}
          <div className="p-4 max-h-[300px] overflow-y-auto">
            {/* 原文区 */}
            <div className="mb-3">
              <div className="text-xs text-muted mb-1">原文</div>
              <div className="min-h-[60px] p-2 bg-gray-50 rounded">
                {speechState.finalText && (
                  <p className="text-sm text-foreground">{speechState.finalText}</p>
                )}
                {speechState.interimText && (
                  <p className="text-sm text-muted">{speechState.interimText}</p>
                )}
                {!speechState.finalText && !speechState.interimText && (
                  <p className="text-sm text-muted">点击「开始收音」开始语音翻译</p>
                )}
              </div>
            </div>

            {/* 译文区 */}
            <div>
              <div className="text-xs text-muted mb-1">译文</div>
              <div className="min-h-[60px] p-2 bg-blue-50 rounded">
                {speechState.translatedText ? (
                  <p className="text-sm text-foreground">{speechState.translatedText}</p>
                ) : (
                  <p className="text-sm text-muted">等待翻译...</p>
                )}
              </div>
            </div>

            {/* 错误提示 */}
            {speechState.permissionState === 'denied' && (
              <div className="mt-3 p-2 bg-red-50 text-danger text-sm rounded">
                请在浏览器设置中开启麦克风权限
              </div>
            )}
          </div>

          {/* 控制按钮 */}
          <div className="px-4 pb-4">
            {!speechState.isListening ? (
              <button
                onClick={onStart}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <MicIcon className="w-4 h-4" />
                开始收音
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={onStop}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <StopIcon className="w-4 h-4" />
                  停止收音
                </button>
                <button
                  onClick={onClear}
                  className="px-4 py-2 bg-gray-100 text-muted rounded-lg hover:bg-gray-200 transition-colors"
                >
                  清空
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// 导出为默认和具名导出
export const FloatPanel = FloatPanelComponent;