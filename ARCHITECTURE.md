# 个人翻译工作台 — 技术架构文档 (ARCHITECTURE)

> **项目**: 个人网页翻译工作台  
> **技术栈**: Next.js 14 + React 18 + TailwindCSS 3 + LocalStorage + 百度翻译 API + DeepSeek API  
> **部署**: EdgeOne Pages (免费)  
> **版本**: v0.1  
> **日期**: 2026-06-23

---

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        浏览器 (Browser)                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js App Router                      │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │  │
│  │  │  page.tsx    │  │  layout.tsx  │  │  globals.css     │   │  │
│  │  │  (主页面)     │  │  (根布局)    │  │  (Tailwind)      │   │  │
│  │  └──────┬──────┘  └─────────────┘  └──────────────────┘   │  │
│  │         │                                                   │  │
│  │  ┌──────┴──────────────────────────────────────────────┐   │  │
│  │  │                  Components (组件层)                   │   │  │
│  │  │                                                       │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │   │  │
│  │  │  │ Header   │ │ InputArea│ │OutputArea│ │FloatPanel│ │   │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐              │   │  │
│  │  │  │BottomPanel│ │MemoryTab │ │CorpusTab │              │   │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘              │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │         │                                                   │  │
│  │  ┌──────┴──────────────────────────────────────────────┐   │  │
│  │  │                    Hooks (逻辑层)                      │   │  │
│  │  │                                                       │   │  │
│  │  │  ┌────────────┐ ┌────────────┐ ┌──────────────────┐  │   │  │
│  │  │  │useTranslate│ │useSpeechRec│ │useLocalStorage   │  │   │  │
│  │  │  └────────────┘ └────────────┘ └──────────────────┘  │   │  │
│  │  │  ┌────────────┐ ┌────────────┐                       │   │  │
│  │  │  │useMemory   │ │useCorpus   │                       │   │  │
│  │  │  └────────────┘ └────────────┘                       │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │         │                                                   │  │
│  │  ┌──────┴──────────────────────────────────────────────┐   │  │
│  │  │                    Services (服务层)                   │   │  │
│  │  │                                                       │   │  │
│  │  │  ┌────────────┐ ┌────────────┐ ┌──────────────────┐  │   │  │
│  │  │  │translateApi│ │storageService│ │similarityService│  │   │  │
│  │  │  └────────────┘ └────────────┘ └──────────────────┘  │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │         │                                                   │  │
│  │  ┌──────┴──────────────────────────────────────────────┐   │  │
│  │  │                   Storage (存储层)                     │   │  │
│  │  │                                                       │   │  │
│  │  │  ┌──────────────────┐  ┌──────────────────┐          │   │  │
│  │  │  │ translate_memory │  │   corpus_list    │          │   │  │
│  │  │  │     _list        │  │                  │          │   │  │
│  │  │  └──────────────────┘  └──────────────────┘          │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ fetch /api/translate
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│            EdgeOne Pages Edge Functions (边缘函数层)              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /api/translate/route.ts (Next.js Route Handler)           │  │
│  │                                                            │  │
│  │  ┌──────────────┐    ┌──────────────┐                     │  │
│  │  │ validateInput │    │ selectEngine  │                     │  │
│  │  └──────────────┘    └──────┬───────┘                     │  │
│  │                              │                              │  │
│  │              ┌───────────────┴───────────────┐              │  │
│  │              ▼                               ▼              │  │
│  │  ┌───────────────────┐    ┌───────────────────┐           │  │
│  │  │ 百度翻译 API 调用   │    │ DeepSeek API 调用   │           │  │
│  │  │ BAIDU_KEY (env)   │    │ DEEPSEEK_KEY (env) │           │  │
│  │  └────────┬──────────┘    └────────┬──────────┘           │  │
│  │           │                        │                       │  │
│  │           └───────────┬────────────┘                       │  │
│  │                       ▼                                    │  │
│  │              ┌──────────────┐                              │  │
│  │              │ formatResponse│                              │  │
│  │              └──────────────┘                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      第三方 API 服务                              │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │   百度翻译 API         │    │   DeepSeek API        │          │
│  │   api.fanyi.baidu.com │    │   api.deepseek.com    │          │
│  └──────────────────────┘    └──────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 项目目录结构

```
translate-workstation/
├── next.config.js                  # Next.js 配置
├── tailwind.config.ts              # TailwindCSS 配置
├── tsconfig.json                   # TypeScript 配置
├── package.json
├── .env.local                      # 环境变量 (API 密钥，不提交 Git)
├── .gitignore
│
├── public/
│   └── favicon.ico
│
└── src/
    ├── app/
    │   ├── layout.tsx              # 根布局 (metadata, 全局字体)
    │   ├── globals.css             # 全局样式 + Tailwind 指令
    │   ├── page.tsx                # 主页面 (组合所有组件)
    │   │
    │   └── api/
    │       └── translate/
    │           └── route.ts        # Edge Function: 翻译 API 中转
    │
    ├── components/
    │   ├── Header.tsx              # 顶栏: 标题 + 引擎切换
    │   ├── InputArea.tsx           # 左侧: 原文输入区
    │   ├── OutputArea.tsx          # 右侧: 译文展示区
    │   ├── FloatPanel.tsx          # 右下: 语音实时字幕悬浮窗
    │   ├── BottomPanel.tsx         # 底部: 折叠面板容器
    │   ├── MemoryTab.tsx           # 记忆库 Tab 内容
    │   ├── CorpusTab.tsx           # 词汇库 Tab 内容
    │   ├── DataManageTab.tsx       # 数据管理 Tab 内容
    │   ├── ui/
    │   │   ├── Button.tsx          # 通用按钮
    │   │   ├── Modal.tsx           # 通用模态框
    │   │   ├── Toast.tsx           # Toast 通知
    │   │   ├── Spinner.tsx         # Loading 动画
    │   │   └── ConfirmDialog.tsx   # 二次确认对话框
    │   └── icons/
    │       └── index.tsx           # SVG 图标组件集合
    │
    ├── hooks/
    │   ├── useTranslate.ts         # 翻译核心逻辑 (流水线编排)
    │   ├── useSpeechRecognition.ts # 语音识别 (Web Speech API)
    │   ├── useLocalStorage.ts      # LocalStorage 读写封装
    │   ├── useMemory.ts            # 翻译记忆库 CRUD
    │   └── useCorpus.ts            # 私有词汇库 CRUD
    │
    ├── services/
    │   ├── translateApi.ts         # 前端调用 /api/translate 的封装
    │   ├── storageService.ts       # LocalStorage 读写服务
    │   ├── similarityService.ts    # 模糊匹配算法 (Levenshtein)
    │   └── csvService.ts           # CSV 解析与生成
    │
    ├── types/
    │   ├── translate.ts            # 翻译相关类型
    │   ├── memory.ts               # 记忆库数据模型
    │   ├── corpus.ts               # 词汇库数据模型
    │   └── speech.ts               # 语音识别相关类型
    │
    └── utils/
        ├── constants.ts            # 常量定义 (存储键、默认值)
        ├── uuid.ts                 # UUID 生成 (轻量实现)
        └── debounce.ts             # 防抖工具函数
```

---

## 3. 核心数据模型

### 3.1 翻译记忆库

```typescript
// src/types/memory.ts

interface MemoryEntry {
  id: string;            // UUID v4
  sourceText: string;    // 原文内容
  targetText: string;    // 译文内容
  lang: 'zh→en' | 'en→zh'; // 语种方向
  useCount: number;      // 使用次数
  createdAt: string;     // ISO 8601 时间戳
}

// LocalStorage 存储键: 'translate_memory_list'
// 存储格式: MemoryEntry[]
```

### 3.2 私有词汇库

```typescript
// src/types/corpus.ts

interface CorpusEntry {
  id: string;            // UUID v4
  sourcePhrase: string;  // 原文短语
  targetPhrase: string;  // 固定译文
  lang: 'zh→en' | 'en→zh'; // 语种方向
  category: '俚语' | '口头禅' | '称谓' | '其他'; // 分类
  createdAt: string;     // ISO 8601 时间戳
}

// LocalStorage 存储键: 'corpus_list'
// 存储格式: CorpusEntry[]
```

### 3.3 翻译请求与响应

```typescript
// src/types/translate.ts

interface TranslateRequest {
  text: string;          // 待翻译文本
  from: 'zh' | 'en';    // 源语言
  to: 'zh' | 'en';      // 目标语言
  engine: 'baidu' | 'deepseek'; // 翻译引擎
}

interface TranslateResponse {
  translatedText: string; // 翻译结果
  engine: string;         // 实际使用的引擎
  fromMemory: boolean;    // 是否来自记忆库 (false = API)
}

interface SimilarRecommendation {
  entry: MemoryEntry;     // 相似条目
  similarity: number;     // 相似度分数 (0-1)
}
```

### 3.4 语音识别

```typescript
// src/types/speech.ts

interface SpeechState {
  isListening: boolean;              // 是否正在收音
  isSupported: boolean;              // 浏览器是否支持 Web Speech API
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
  interimText: string;               // 中间识别结果 (未完成)
  finalText: string;                 // 最终识别结果 (已完成的句子)
  translatedText: string;            // 翻译后的文本
}
```

---

## 4. 核心逻辑设计

### 4.1 翻译流水线 (useTranslate Hook)

```typescript
// src/hooks/useTranslate.ts — 核心逻辑伪代码

async function translate(text: string, lang: LangDirection, engine: Engine): Promise<TranslateResult> {

  // Step 1: 私有词汇库强制替换
  let processedText = text;
  const corpusEntries = getCorpusList(lang);
  for (const entry of corpusEntries) {
    // 全词匹配替换 (区分大小写)
    processedText = processedText.replaceAll(entry.sourcePhrase, entry.targetPhrase);
  }

  // Step 2: 记忆库精准匹配
  const exactMatch = findExactMatch(processedText, lang);
  if (exactMatch) {
    incrementUseCount(exactMatch.id);
    return {
      translatedText: exactMatch.targetText,
      fromMemory: true,
      fromCache: false,
      engine: 'memory',
      recommendations: []
    };
  }

  // Step 3: 相似语句推荐 (Levenshtein 距离)
  const recommendations = findSimilar(processedText, lang, 3);

  // Step 4: 调用 API 翻译
  const response = await fetch('/api/translate', {
    method: 'POST',
    body: JSON.stringify({ text: processedText, from: lang.from, to: lang.to, engine }),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();

  // Step 5: 自动存入记忆库
  if (response.ok) {
    saveToMemory({
      sourceText: text,        // 存原始文本 (非替换后)
      targetText: data.translatedText,
      lang: `${lang.from}→${lang.to}`,
      useCount: 1,
      createdAt: new Date().toISOString()
    });
  }

  return {
    translatedText: data.translatedText,
    fromMemory: false,
    fromCache: false,
    engine,
    recommendations
  };
}
```

### 4.2 模糊匹配算法 (similarityService)

```typescript
// src/services/similarityService.ts

/**
 * 计算两个字符串的 Levenshtein 距离
 * 用于找相似历史翻译
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
    }
  }
  return dp[m][n];
}

/**
 * 计算相似度分数 (0-1)
 */
function similarityScore(source: string, target: string): number {
  const maxLen = Math.max(source.length, target.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(source, target) / maxLen;
}

/**
 * 从记忆库中查找最相似的 N 条记录
 */
function findSimilar(
  text: string,
  lang: string,
  memoryList: MemoryEntry[],
  topN: number = 3,
  threshold: number = 0.4 // 相似度阈值
): SimilarRecommendation[] {
  return memoryList
    .filter(entry => entry.lang === lang)
    .map(entry => ({ entry, similarity: similarityScore(text, entry.sourceText) }))
    .filter(item => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
}
```

### 4.3 语音识别 (useSpeechRecognition Hook)

```typescript
// src/hooks/useSpeechRecognition.ts — 核心逻辑伪代码

function useSpeechRecognition(lang: string = 'zh-CN') {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    isSupported: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    permissionState: 'unknown',
    interimText: '',
    finalText: '',
    translatedText: ''
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { translate } = useTranslate();

  // 初始化 Recognition 实例
  useEffect(() => {
    if (!state.isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;       // 持续监听
    recognition.interimResults = true;   // 获取中间结果
    recognition.lang = lang;             // 识别语言

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
          // 完整句子触发翻译
          translate(final, 'zh→en', currentEngine).then(result => {
            setState(prev => ({ ...prev, translatedText: result.translatedText }));
          });
        } else {
          interim += transcript;
        }
      }

      setState(prev => ({ ...prev, interimText: interim, finalText: prev.finalText + final }));
    };

    recognition.onerror = (event) => {
      // 处理 no-speech, audio-capture, not-allowed 等错误
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognition.onend = () => {
      // 非主动停止时自动重启 (保持连续监听)
      if (state.isListening) recognition.start();
    };

    recognitionRef.current = recognition;
  }, [state.isSupported]);

  // 开始/停止控制
  const start = useCallback(() => {
    recognitionRef.current?.start();
    setState(prev => ({ ...prev, isListening: true }));
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  return { state, start, stop };
}
```

### 4.4 LocalStorage 封装 (useLocalStorage)

```typescript
// src/hooks/useLocalStorage.ts

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      } catch (e) {
        // 存储空间不足时提示用户
        console.warn('LocalStorage write failed:', e);
      }
      return newValue;
    });
  }, [key]);

  return [storedValue, setValue] as const;
}
```

---

## 5. API 设计

### 5.1 翻译 API 中转 (Edge Function)

```
POST /api/translate
```

**请求体**:

```json
{
  "text": "Hello, how are you?",
  "from": "en",
  "to": "zh",
  "engine": "baidu"
}
```

**响应 (成功)**:

```json
{
  "ok": true,
  "translatedText": "你好，最近怎么样？",
  "engine": "baidu"
}
```

**响应 (失败)**:

```json
{
  "ok": false,
  "error": "翻译服务暂时不可用，请稍后重试",
  "code": "API_ERROR"
}
```

**Edge Function 实现逻辑** (`src/app/api/translate/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, from, to, engine } = await request.json();

    // 输入校验
    if (!text || !from || !to || !engine) {
      return NextResponse.json({ ok: false, error: '缺少必要参数', code: 'INVALID_PARAMS' }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ ok: false, error: '文本长度超过限制', code: 'TEXT_TOO_LONG' }, { status: 400 });
    }

    // 引擎路由
    let translatedText: string;
    if (engine === 'baidu') {
      translatedText = await callBaiduAPI(text, from, to);
    } else if (engine === 'deepseek') {
      translatedText = await callDeepSeekAPI(text, from, to);
    } else {
      return NextResponse.json({ ok: false, error: '不支持的翻译引擎', code: 'UNKNOWN_ENGINE' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, translatedText, engine });
  } catch (error) {
    console.error('Translate API error:', error);
    return NextResponse.json({ ok: false, error: '翻译服务暂时不可用', code: 'API_ERROR' }, { status: 500 });
  }
}

async function callBaiduAPI(text: string, from: string, to: string): Promise<string> {
  const appId = process.env.BAIDU_APP_ID;
  const appKey = process.env.BAIDU_APP_KEY;
  // ... 百度翻译 API 签名与调用逻辑
}

async function callDeepSeekAPI(text: string, from: string, to: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  // ... DeepSeek API 调用逻辑
}
```

### 5.2 百度翻译 API 对接

```
POST https://api.fanyi.baidu.com/api/trans/vip/translate

参数:
  q: 待翻译文本
  from: 源语言 (zh / en)
  to: 目标语言 (zh / en)
  appid: 百度翻译 APP ID
  salt: 随机数
  sign: MD5(appid + q + salt + appKey)

响应:
{
  "from": "en",
  "to": "zh",
  "trans_result": [
    { "src": "Hello", "dst": "你好" }
  ]
}
```

### 5.3 DeepSeek API 对接

```
POST https://api.deepseek.com/chat/completions

请求体:
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "你是一个翻译助手。请将以下文本从${from}翻译成${to}，只返回翻译结果，不要添加任何解释。"
    },
    {
      "role": "user",
      "content": "${text}"
    }
  ],
  "temperature": 0.3
}

响应: 标准 OpenAI Chat Completions 格式
```

---

## 6. 数据流动

### 6.1 翻译请求数据流

```
用户输入 "what's up"
       │
       ▼
useTranslate.translate()
       │
       ├─── Step 1: 私有词汇替换
       │    corpus_list 遍历 → 全词匹配替换
       │    "what's up" → "最近怎么样" (如有自定义)
       │
       ├─── Step 2: 记忆库精准匹配
       │    translate_memory_list 查找 sourceText === "what's up"
       │    ├── 命中 → 返回 targetText, 更新 useCount, 流程结束
       │    └── 未命中 → 继续
       │
       ├─── Step 3: 相似推荐
       │    similarityService.findSimilar("what's up") → 最多3条
       │    展示在 UI 推荐区
       │
       ├─── Step 4: API 翻译
       │    fetch POST /api/translate
       │    → Edge Function 路由到百度/DeepSeek
       │    → 返回 { translatedText: "怎么了" }
       │
       └─── Step 5: 自动入库
            memoryList.push({ sourceText: "what's up", targetText: "怎么了", ... })
            → localStorage.setItem('translate_memory_list', JSON.stringify(memoryList))
```

### 6.2 语音翻译数据流

```
麦克风 → Web Speech API (浏览器原生)
       │
       ├── interim (中间结果): 实时显示在悬浮窗原文区
       │
       └── final (完整句子): 触发翻译
              │
              ▼
         useTranslate.translate(finalText)
              │
              ▼
         悬浮窗更新译文区
              │
              ▼
         自动存入记忆库
```

### 6.3 数据导入导出流

```
导出:
  memoryList (LocalStorage) → csvService.generateCSV() → Blob → URL.createObjectURL() → <a download>

导入:
  <input type="file" accept=".csv"> → FileReader.readAsText() → csvService.parseCSV()
  → 去重合并 → memoryList → localStorage.setItem()
```

---

## 7. 部署架构

### 7.1 EdgeOne Pages 部署

```
┌──────────────────────────────────────────┐
│          GitHub Repository                │
│  translate-workstation/                   │
│  ├── src/                                 │
│  ├── package.json                         │
│  ├── next.config.js                       │
│  └── .env.local (不提交)                   │
└──────────────────┬───────────────────────┘
                   │ git push
                   ▼
┌──────────────────────────────────────────┐
│          EdgeOne Pages                     │
│                                            │
│  1. 检测到 Next.js 项目                     │
│  2. 自动执行 npm install && npm run build   │
│  3. 部署静态资源 + Edge Functions           │
│  4. 生成 xxx.edgeone.app 公网域名           │
│                                            │
│  环境变量 (在 EdgeOne 控制台配置):           │
│    BAIDU_APP_ID                            │
│    BAIDU_APP_KEY                           │
│    DEEPSEEK_API_KEY                        │
└──────────────────────────────────────────┘
                   │
                   ▼
         https://xxx.edgeone.app
         (国内网络直接访问)
```

### 7.2 环境变量

```bash
# .env.local (本地开发，不提交 Git)
BAIDU_APP_ID=your_baidu_app_id
BAIDU_APP_KEY=your_baidu_app_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 7.3 Next.js 配置

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // EdgeOne Pages 不需要特殊配置，Next.js 标准构建即可
  output: 'standalone',  // 可选，EdgeOne 自动检测
};

module.exports = nextConfig;
```

---

## 8. 安全设计

| 安全点 | 措施 |
|--------|------|
| API 密钥泄露 | 密钥仅存储在 `.env.local` 和 EdgeOne 环境变量中，前端代码不可见 |
| 前端请求伪造 | 翻译 API 仅处理文本翻译请求，无数据修改能力；无认证需求 |
| 数据隐私 | 所有用户数据存于本地浏览器 LocalStorage，不上传服务器 |
| CSRF | 无需 Cookie/Session，翻译接口为纯 POST JSON 接口，无 CSRF 风险 |
| XSS | React 默认 JSX 转义输出；CSV 导入时做内容校验，不执行 HTML 渲染 |
| 请求频率 | 记忆库复用大幅降低 API 调用频率；Edge Function 层面可加简单限流（可选） |

---

## 9. 浏览器兼容性

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 文本翻译 | 完整支持 | 完整支持 | 完整支持 | 完整支持 |
| 语音识别 (Web Speech API) | 完整支持 | 不支持 | 部分支持 (15.0+) | 完整支持 |
| LocalStorage | 完整支持 | 完整支持 | 完整支持 | 完整支持 |
| TailwindCSS | 完整支持 | 完整支持 | 完整支持 | 完整支持 |

**降级策略**: 检测到 Web Speech API 不可用时，语音功能入口显示"当前浏览器不支持"提示，引导用户使用 Chrome。文本翻译功能不受影响。

---

## 10. 性能考量

| 指标 | 目标 | 策略 |
|------|------|------|
| 首次内容绘制 (FCP) | < 1.5s | Next.js 静态生成，TailwindCSS 按需编译 |
| 翻译响应时间 (记忆库命中) | < 50ms | LocalStorage 同步读取，无网络请求 |
| 翻译响应时间 (API 调用) | < 3s | Edge Function 就近执行 |
| 语音转写延迟 | < 1s | 浏览器原生 API，无额外处理 |
| 页面总大小 | < 200KB (gzip) | 纯静态页面，无外部依赖，图标用 SVG |
| LocalStorage 用量 | < 5MB | 提供清空和导出功能，防止超限 |

---

## 11. 技术决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 框架 | Next.js 14 | App Router + Edge Functions 天然支持，EdgeOne Pages 原生支持 |
| 样式方案 | TailwindCSS | 原子化 CSS，无需额外 CSS 文件，构建体积小 |
| 状态管理 | React Hooks + Context | 无需 Redux/Zustand，项目规模小，Context 足够 |
| 语音识别 | Web Speech API | 浏览器原生免费，无需第三方 SDK，满足日常交流需求 |
| 搜索算法 | Levenshtein 距离 | 实现简单，适合短文本相似度匹配，无需引入 Fuse.js 等库 |
| 部署平台 | EdgeOne Pages | 免费、国内直连、原生支持 Next.js |
| 存储方案 | LocalStorage | 零成本、零延迟、数据隐私，个人使用场景 5MB 足够 |

---

> **架构原则**: 最小依赖、最小复杂度、最小成本。所有技术选型以"个人自用、长期可维护、零月租"为第一优先级。