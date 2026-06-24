// 麦克风诊断工具
'use client';

import { useState, useEffect } from 'react';

export default function MicDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>({});

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {};

      // 1. 检查浏览器支持
      results.browserSupport = {
        hasSpeechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
        userAgent: navigator.userAgent,
      };

      // 2. 检查麦克风权限
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as any });
        results.microphonePermission = {
          state: permission.state,
        };
      } catch (e) {
        results.microphonePermission = {
          state: 'unknown',
          error: String(e),
        };
      }

      // 3. 测试麦克风访问
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        results.microphoneAccess = {
          success: true,
          tracks: stream.getAudioTracks().length,
        };
        stream.getTracks().forEach(track => track.stop());
      } catch (e: any) {
        results.microphoneAccess = {
          success: false,
          error: e.name,
          message: e.message,
        };
      }

      // 4. 检查 SpeechRecognition 实例
      if (results.browserSupport.hasSpeechRecognition) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        try {
          const recognition = new SpeechRecognition();
          results.speechRecognition = {
            continuous: recognition.continuous,
            interimResults: recognition.interimResults,
            lang: recognition.lang,
          };
        } catch (e: any) {
          results.speechRecognition = {
            error: e.message,
          };
        }
      }

      setDiagnostics(results);
    };

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">麦克风收音诊断</h1>
        
        <div className="space-y-6">
          {/* 浏览器支持 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">1. 浏览器支持</h2>
            <div className="space-y-2">
              <p><strong>支持语音识别:</strong> {diagnostics.browserSupport?.hasSpeechRecognition ? '✅ 是' : '❌ 否'}</p>
              <p><strong>User Agent:</strong></p>
              <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">{diagnostics.browserSupport?.userAgent}</pre>
            </div>
          </div>

          {/* 麦克风权限 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">2. 麦克风权限</h2>
            <div className="space-y-2">
              <p><strong>权限状态:</strong> {diagnostics.microphonePermission?.state}</p>
              {diagnostics.microphonePermission?.error && (
                <p className="text-red-600"><strong>错误:</strong> {diagnostics.microphonePermission.error}</p>
              )}
            </div>
          </div>

          {/* 麦克风访问 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">3. 麦克风访问测试</h2>
            <div className="space-y-2">
              {diagnostics.microphoneAccess?.success ? (
                <>
                  <p className="text-green-600">✅ 麦克风访问成功</p>
                  <p><strong>音频轨道数:</strong> {diagnostics.microphoneAccess.tracks}</p>
                </>
              ) : (
                <>
                  <p className="text-red-600">❌ 麦克风访问失败</p>
                  <p><strong>错误类型:</strong> {diagnostics.microphoneAccess?.error}</p>
                  <p><strong>错误信息:</strong> {diagnostics.microphoneAccess?.message}</p>
                </>
              )}
            </div>
          </div>

          {/* SpeechRecognition 配置 */}
          {diagnostics.speechRecognition && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">4. SpeechRecognition 配置</h2>
              <div className="space-y-2">
                {diagnostics.speechRecognition.error ? (
                  <p className="text-red-600">❌ {diagnostics.speechRecognition.error}</p>
                ) : (
                  <>
                    <p><strong>Continuous:</strong> {diagnostics.speechRecognition.continuous ? '是' : '否'}</p>
                    <p><strong>Interim Results:</strong> {diagnostics.speechRecognition.interimResults ? '是' : '否'}</p>
                    <p><strong>语言:</strong> {diagnostics.speechRecognition.lang}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 建议 */}
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">💡 建议</h2>
            <ul className="list-disc list-inside space-y-2">
              {!diagnostics.browserSupport?.hasSpeechRecognition && (
                <li>请使用 Chrome、Edge 或 Safari 浏览器</li>
              )}
              {diagnostics.microphonePermission?.state === 'denied' && (
                <li>请在浏览器设置中允许麦克风权限：设置 → 隐私和安全 → 站点设置 → 麦克风</li>
              )}
              {diagnostics.microphonePermission?.state === 'prompt' && (
                <li>请在弹出的权限请求中点击"允许"</li>
              )}
              {!diagnostics.microphoneAccess?.success && (
                <li>确保您的计算机已连接麦克风设备</li>
              )}
              {diagnostics.browserSupport?.hasSpeechRecognition &&
               diagnostics.microphonePermission?.state === 'granted' &&
               diagnostics.microphoneAccess?.success && (
                <li className="text-green-600">✅ 所有检查都通过了！语音功能应该可以正常使用。</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
