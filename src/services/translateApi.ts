import { TranslateRequest, TranslateResponse } from '../types/translate';

export class TranslateApiService {
  static async translate(request: TranslateRequest): Promise<TranslateResponse> {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '翻译失败');
      }

      return await response.json();
    } catch (error) {
      console.error('Translate API error:', error);
      throw error;
    }
  }
}