# 个人翻译工作台

专为个人日常跨语言交流打造的轻量翻译工作台，支持文本输入翻译和语音实时翻译。

## 功能特性

- **双模式翻译**: 手动输入翻译 + 语音实时翻译
- **翻译记忆复用**: 历史对话自动入库，重复话术秒出译文
- **私有语料定制**: 自定义俚语、口头禅、固定短句的译法
- **隐私零泄露**: 所有数据仅存浏览器 LocalStorage
- **零成本部署**: EdgeOne Pages 免费部署，国内网络直连

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI**: React 18 + TailwindCSS 3
- **状态管理**: React Hooks + LocalStorage
- **语音识别**: Web Speech API
- **翻译引擎**: 百度翻译 API + DeepSeek API

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填入你的 API 密钥：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
BAIDU_APP_ID=your_baidu_app_id
BAIDU_APP_KEY=your_baidu_app_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 构建部署

### 构建生产版本

```bash
npm run build
npm start
```

### 部署到 EdgeOne Pages

1. 将代码推送到 GitHub 仓库
2. 在 EdgeOne 控制台连接仓库
3. 配置环境变量（BAIDU_APP_ID、BAIDU_APP_KEY、DEEPSEEK_API_KEY）
4. 自动部署完成

## 使用说明

### 文本翻译

1. 在左侧输入框输入要翻译的文本
2. 选择语言方向（中文→英文 / 英文→中文）
3. 选择翻译引擎（百度翻译 / DeepSeek）
4. 点击"翻译"按钮或按 Ctrl+Enter

### 语音实时翻译

1. 点击右下角悬浮窗的"开始收音"按钮
2. 允许浏览器访问麦克风
3. 说话内容会实时转写并翻译
4. 点击"停止收音"结束翻译

### 翻译记忆库

- 所有翻译成功的句对自动保存到记忆库
- 相同原文直接返回历史译文，不调用 API
- 支持搜索、删除、清空操作
- 支持 CSV 导入导出

### 私有词汇库

- 手动添加自定义词汇和固定译法
- 翻译时优先替换原文中的匹配短语
- 支持 CSV 批量导入导出
- 支持分类管理（俚语、口头禅、称谓等）

## 数据管理

- 支持导出记忆库和词汇库为 CSV 文件
- 支持从 CSV 文件导入数据
- 导入时自动去重，相同原文的记录会被覆盖

## 浏览器兼容性

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 文本翻译 | ✅ | ✅ | ✅ | ✅ |
| 语音识别 | ✅ | ❌ | ⚠️ | ✅ |

**注意**: 语音识别功能推荐使用 Chrome 浏览器。

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/translate/     # 翻译 API 路由
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页面
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # UI 基础组件
│   ├── icons/            # 图标组件
│   ├── Header.tsx        # 顶部导航栏
│   ├── InputArea.tsx     # 原文输入区
│   ├── OutputArea.tsx    # 译文展示区
│   ├── FloatPanel.tsx    # 语音悬浮窗
│   ├── BottomPanel.tsx   # 底部折叠面板
│   ├── MemoryTab.tsx     # 记忆库 Tab
│   ├── CorpusTab.tsx     # 词汇库 Tab
│   └── DataManageTab.tsx # 数据管理 Tab
├── hooks/                # React Hooks
│   ├── useTranslate.ts           # 翻译核心逻辑
│   ├── useSpeechRecognition.ts   # 语音识别
│   ├── useLocalStorage.ts        # LocalStorage 封装
│   ├── useMemory.ts              # 记忆库管理
│   └── useCorpus.ts              # 词汇库管理
├── services/             # 服务层
│   ├── translateApi.ts        # 翻译 API 封装
│   ├── storageService.ts      # LocalStorage 服务
│   ├── similarityService.ts   # 相似度计算
│   └── csvService.ts          # CSV 处理
├── types/                # TypeScript 类型定义
│   ├── translate.ts
│   ├── memory.ts
│   ├── corpus.ts
│   └── speech.ts
└── utils/                # 工具函数
    ├── constants.ts
    ├── uuid.ts
    └── debounce.ts
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！