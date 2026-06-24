'use client';

import { useState, useEffect, useRef } from 'react';

export default function VoiceTestPage() {
  const [status, setStatus] = useState('ready');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('unknown');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const hasSpeech = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setIsSupported(hasSpeech);
    
    if (hasSpeech) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';
      
      recognition.onstart = () => {
        setStatus('listening');
        console.log('Speech recognition started');
      };
      
      recognition.onresult = (event: any) => {
        let finalText = '';
        let interimText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += text;
          } else {
            interimText += text;
          }
        }
        
        if (finalText) {
          setTranscript(prev => prev + finalText);
        }
        setInterim(interimText);
        console.log('Result:', { finalText, interimText });
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setError(event.error);
        if (event.error === 'not-allowed') {
          setPermission('denied');
        }
        setStatus('error');
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (status === 'listening') {
          try {
            recognition.start();
          } catch (e) {
            setStatus('stopped');
          }
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, [status]);

  const handleStart = async () => {
    setError('');
    setTranscript('');
    setInterim('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermission('granted');
      
      recognitionRef.current?.start();
    } catch (e: any) {
      console.error('Media access error:', e);
      setError(e.name || '无法访问麦克风');
      setPermission('denied');
    }
  };

  const handleStop = () => {
    recognitionRef.current?.stop();
    setStatus('stopped');
  };

  const handleTestPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as any });
      setPermission(result.state);
      console.log('Microphone permission:', result.state);
    } catch (e) {
      setPermission('unknown');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🎤 语音识别测试</h1>
        
        {/* 检测结果 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${isSupported ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className="font-semibold mb-2">浏览器支持</h3>
            <p>{isSupported ? '✅ 支持' : '❌ 不支持'}</p>
            {!isSupported && (
              <p className="text-sm text-gray-600 mt-2">请使用 Chrome、Edge 或 Safari 浏览器</p>
            )}
          </div>
          
          <div className={`p-4 rounded-lg ${permission === 'granted' ? 'bg-green-100' : permission === 'denied' ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <h3 className="font-semibold mb-2">麦克风权限</h3>
            <p>{permission === 'granted' ? '✅ 已允许' : permission === 'denied' ? '❌ 已拒绝' : '❓ 未知'}</p>
            <button 
              onClick={handleTestPermission}
              className="mt-2 px-3 py-1 text-sm bg-white rounded hover:bg-gray-100"
            >
              检测权限
            </button>
          </div>
          
          <div className={`p-4 rounded-lg ${status === 'listening' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <h3 className="font-semibold mb-2">识别状态</h3>
            <p>
              {status === 'ready' && '⏳ 准备就绪'}
              {status === 'listening' && '🎧 正在收音'}
              {status === 'stopped' && '⏹️ 已停止'}
              {status === 'error' && '❌ 出错'}
            </p>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleStart}
            disabled={!isSupported || status === 'listening'}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              !isSupported || status === 'listening'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            🎤 开始收音
          </button>
          
          <button
            onClick={handleStop}
            disabled={status !== 'listening'}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              status !== 'listening'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            ⏹️ 停止收音
          </button>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
            <strong>错误:</strong> {error}
            {error === 'not-allowed' && (
              <div className="mt-2">
                <p>请按以下步骤开启麦克风权限：</p>
                <ol className="list-decimal list-inside mt-1 text-sm">
                  <li>点击浏览器地址栏左侧的🔒图标</li>
                  <li>找到「麦克风」选项</li>
                  <li>选择「允许」</li>
                  <li>刷新页面后重试</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* 识别结果 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-3">📝 已识别文本</h3>
            <div className="min-h-[200px] p-4 bg-gray-50 rounded">
              {transcript || (
                <p className="text-gray-400">等待语音输入...</p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-3">⚡ 实时识别</h3>
            <div className="min-h-[200px] p-4 bg-blue-50 rounded">
              {interim && (
                <p className="text-blue-600 animate-pulse">{interim}</p>
              )}
              {!interim && (
                <p className="text-gray-400">实时识别中...</p>
              )}
            </div>
          </div>
        </div>

        {/* 操作指南 */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-3">💡 操作步骤</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>确保您的电脑已连接麦克风设备</li>
            <li>使用 Chrome、Edge 或 Safari 浏览器访问此页面</li>
            <li>点击「检测权限」查看麦克风权限状态</li>
            <li>如果权限为「已拒绝」，请按上方步骤开启权限</li>
            <li>点击「开始收音」按钮</li>
            <li>对着麦克风说话，观察识别结果</li>
          </ol>
        </div>

        {/* 常见问题 */}
        <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-3">❓ 常见问题</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>浏览器不支持:</strong> 请使用 Chrome 浏览器，其他浏览器可能不支持 Web Speech API</li>
            <li><strong>权限被拒绝:</strong> 在浏览器设置中找到麦克风权限，改为允许</li>
            <li><strong>没有识别结果:</strong> 确保麦克风正常工作，可以在系统设置中测试</li>
            <li><strong>网络问题:</strong> 语音识别需要联网，请确保网络连接正常</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
