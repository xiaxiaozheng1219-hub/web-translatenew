import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

// 百度翻译 API 签名计算
function generateBaiduSign(appId: string, text: string, salt: string, appKey: string): string {
  let input = text;
  
  if (input.length > 2000) {
    input = input.substring(0, 10) + input.length + input.substring(input.length - 10, input.length);
  }
  
  return CryptoJS.MD5(appId + input + salt + appKey).toString();
}

// 百度翻译 API 调用
async function callBaiduAPI(text: string, from: string, to: string): Promise<string> {
  const appId = process.env.BAIDU_APP_ID;
  const appKey = process.env.BAIDU_APP_KEY;

  if (!appId || !appKey) {
    throw new Error('百度翻译 API 密钥未配置');
  }

  const salt = Date.now().toString();
  const sign = generateBaiduSign(appId, text, salt, appKey);

  const params = new URLSearchParams({
    q: text,
    from,
    to,
    appid: appId,
    salt,
    sign,
  });

  const response = await fetch(
    `https://api.fanyi.baidu.com/api/trans/vip/translate?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('百度翻译 API 请求失败');
  }

  const data = await response.json();

  if (data.error_code) {
    throw new Error(`百度翻译错误: ${data.error_msg}`);
  }

  if (!data.trans_result || data.trans_result.length === 0) {
    throw new Error('百度翻译返回结果为空');
  }

  return data.trans_result.map((item: any) => item.dst).join('\n');
}

// DeepSeek API 调用
async function callDeepSeekAPI(text: string, from: string, to: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('DeepSeek API 密钥未配置');
  }

  const langMap: Record<string, string> = {
    'zh': '中文',
    'en': '英文',
  };

  const systemPrompt = `你是一个翻译助手。请将以下文本从${langMap[from]}翻译成${langMap[to]}，只返回翻译结果，不要添加任何解释。`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error('DeepSeek API 请求失败');
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`DeepSeek 错误: ${data.error.message}`);
  }

  if (!data.choices || data.choices.length === 0) {
    throw new Error('DeepSeek 返回结果为空');
  }

  return data.choices[0].message.content.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { text, from, to, engine } = await request.json();

    // 输入校验
    if (!text || !from || !to || !engine) {
      return NextResponse.json(
        { ok: false, error: '缺少必要参数', code: 'INVALID_PARAMS' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { ok: false, error: '文本长度超过限制', code: 'TEXT_TOO_LONG' },
        { status: 400 }
      );
    }

    // 引擎路由
    let translatedText: string;
    if (engine === 'baidu') {
      translatedText = await callBaiduAPI(text, from, to);
    } else if (engine === 'deepseek') {
      translatedText = await callDeepSeekAPI(text, from, to);
    } else {
      return NextResponse.json(
        { ok: false, error: '不支持的翻译引擎', code: 'UNKNOWN_ENGINE' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      translatedText,
      engine,
    });
  } catch (error) {
    console.error('Translate API error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : '翻译服务暂时不可用',
        code: 'API_ERROR',
      },
      { status: 500 }
    );
  }
}