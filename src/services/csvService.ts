// CSV 解析与生成服务
import { MemoryEntry } from '../types/memory';
import { CorpusEntry } from '../types/corpus';

export class CSVService {
  // 生成 CSV 内容
  static generateCSV<T extends Record<string, any>>(
    data: T[],
    headers: string[]
  ): string {
    if (data.length === 0) return '';

    const headerRow = headers.join(',');
    const dataRows = data.map((item) =>
      headers
        .map((header) => {
          const value = item[header] || '';
          // 处理包含逗号、引号、换行符的字段
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"') || value.includes('\n'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    );

    return [headerRow, ...dataRows].join('\n');
  }

  // 解析 CSV 内容
  static parseCSV<T extends Record<string, any>>(
    content: string
  ): T[] {
    if (!content.trim()) return [];

    let cleanedContent = content;
    if (cleanedContent.charCodeAt(0) === 0xFEFF) {
      cleanedContent = cleanedContent.slice(1);
    }

    const lines = cleanedContent.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]);
    console.log('CSV Headers:', headers);
    const result: T[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const item: Record<string, any> = {};

      headers.forEach((header, index) => {
        item[header.trim()] = (values[index] || '').trim();
      });

      result.push(item as T);
    }

    return result;
  }

  // 解析单行 CSV
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  // 下载 CSV 文件
  static downloadCSV(content: string, filename: string): void {
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // 导出记忆库 CSV
  static exportMemory(memoryList: MemoryEntry[]): void {
    const csv = this.generateCSV(memoryList, [
      'sourceText',
      'targetText',
      'lang',
    ]);
    const filename = `translate_memory_${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadCSV(csv, filename);
  }

  // 导出词汇库 CSV
  static exportCorpus(corpusList: CorpusEntry[]): void {
    const csv = this.generateCSV(corpusList, [
      'sourcePhrase',
      'targetPhrase',
      'lang',
      'category',
    ]);
    const filename = `corpus_list_${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadCSV(csv, filename);
  }
}