import { TranslateRequest, TranslateResponse } from '../types/translate';

// 云函数HTTP网关地址
const CLOUD_FUNCTION_URL = 'https://cloud1-d4g5ufpkm5fcf6fc9-1442013244.ap-shanghai.app.tcloudbase.com/translate';

export class TranslateApiService {
  static async translate(request: TranslateRequest): Promise<TranslateResponse> {
    try {
      // 云函数使用 GET 请求，参数通过 URL 传递
      // type = engine (baidu/deepseek)
      const params = new URLSearchParams({
        type: request.engine,
        text: request.text,
        from: request.from,
        to: request.to,
      });

      const response = await fetch(`${CLOUD_FUNCTION_URL}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      // 云函数返回格式: { code: 0, data: { translatedText: string } }
      if (data.code !== 0) {
        throw new Error(data.msg || '翻译失败');
      }

      return {
        translatedText: data.data || data.translatedText || '',
        engine: request.engine,
        fromMemory: false,
      };
    } catch (error) {
      console.error('Translate API error:', error);
      throw error;
    }
  }
}

// 简化版本，直接调用云函数
export async function translateText(
  type: 'baidu' | 'deepseek',
  text: string,
  from: 'zh' | 'en' = 'zh',
  to: 'zh' | 'en' = 'en'
): Promise<string> {
  const params = new URLSearchParams({
    type,
    text,
    from,
    to,
  });

  const res = await fetch(`${CLOUD_FUNCTION_URL}?${params.toString()}`);
  const json = await res.json();

  if (json.code !== 0) {
    throw new Error(json.msg || '翻译失败');
  }

  return json.data || json.translatedText || '';
}