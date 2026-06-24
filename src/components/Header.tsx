// Header 组件 - 顶部导航栏
import { Engine } from '../types/translate';
import { TranslateIcon } from './icons';
import { STORAGE_KEYS, DEFAULT_VALUES } from '../utils/constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface HeaderProps {
  engine: Engine;
  onEngineChange: (engine: Engine) => void;
}

export function Header({ engine, onEngineChange }: HeaderProps) {
  const [savedEngine, setSavedEngine] = useLocalStorage<Engine>(
    STORAGE_KEYS.ENGINE,
    DEFAULT_VALUES.ENGINE
  );

  const handleEngineChange = (newEngine: Engine) => {
    onEngineChange(newEngine);
    setSavedEngine(newEngine);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <TranslateIcon className="w-6 h-6 text-accent" />
            <h1 className="text-lg font-semibold text-foreground">个人翻译工作台</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">翻译引擎:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleEngineChange('baidu')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  engine === 'baidu'
                    ? 'bg-white text-accent shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                百度翻译
              </button>
              <button
                onClick={() => handleEngineChange('deepseek')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  engine === 'deepseek'
                    ? 'bg-white text-accent shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                DeepSeek
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}