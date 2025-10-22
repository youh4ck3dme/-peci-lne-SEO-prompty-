import React, { useState, useCallback, useMemo } from 'react';
import { PROMPTS } from './constants';
import BackgroundOrbs from './components/BackgroundOrbs';
import PromptCard from './components/PromptCard';
import Toast from './components/Toast';
import { SettingsProvider } from './contexts/SettingsContext';
import SettingsModal from './components/SettingsModal';
import useLocalStorage from './hooks/useLocalStorage';
import { useLanguage } from './contexts/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';

const App: React.FC = () => {
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [newPromptIds, setNewPromptIds] = useState<Set<number>>(() => new Set([1]));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [responses, setResponses] = useLocalStorage<Record<number, string>>('gemini-seo-prompter-responses', {});
  const [searchQuery, setSearchQuery] = useState('');
  const { language, t } = useLanguage();

  const showToast = useCallback((message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 1200);
  }, []);

  const handleMarkAsSeen = useCallback((id: number) => {
    setNewPromptIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const handleResponseUpdate = useCallback((promptId: number, newResponse: string) => {
    setResponses(prev => ({
      ...prev,
      [promptId]: newResponse,
    }));
  }, [setResponses]);

  const filteredPrompts = useMemo(() => {
    if (!searchQuery) {
      return PROMPTS;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return PROMPTS.filter(prompt =>
      prompt.title[language].toLowerCase().includes(lowercasedQuery) ||
      prompt.content.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, language]);

  return (
    <SettingsProvider>
      <main className="relative min-h-screen w-full flex flex-col items-center font-sans text-white overflow-x-hidden">
        <BackgroundOrbs />
        
        <div className="relative z-10 container mx-auto max-w-xl w-full p-4 sm:p-6 md:py-16">
          <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-shadow-lg" style={{textShadow: '0 2px 20px rgba(0,0,0,.28)'}}>
              {t('app.title')}
            </h1>
            <p className="mt-3 text-sm sm:text-base opacity-90 max-w-md mx-auto">
              {t('app.subtitle')}
              <span className="inline-block align-baseline mx-2 bg-white/10 text-white/80 text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                {t('app.promptCount', { visible: filteredPrompts.length, total: PROMPTS.length })}
              </span>
              • {t('app.cta')}
            </p>
          </header>

          <div className="flex justify-center items-center gap-2 sm:gap-4 mb-8">
            <div className="relative flex-grow max-w-sm mx-auto sm:mx-0">
              <input 
                type="search"
                placeholder={t('app.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 focus:bg-white/20 backdrop-blur-sm border border-white/20 text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-sm font-semibold transition-colors"
              title={t('app.settingsButton.aria')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">{t('app.settingsButton')}</span>
            </button>
            <LanguageSwitcher />
          </div>

          <div className="flex flex-col gap-4" role="list">
            {filteredPrompts.length > 0 ? (
              filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onCopy={showToast}
                  isNew={newPromptIds.has(prompt.id)}
                  onMarkAsSeen={() => handleMarkAsSeen(prompt.id)}
                  initialResponse={responses[prompt.id] || ''}
                  onResponseUpdate={(newResponse) => handleResponseUpdate(prompt.id, newResponse)}
                />
              ))
            ) : (
              <div className="text-center text-white/70 bg-white/10 p-8 rounded-2xl border border-white/10">
                <p className="font-medium">{t('app.noResults.title')}</p>
                <p className="text-sm mt-1">{t('app.noResults.description')} <span className="font-bold text-white/90">"{searchQuery}"</span>.</p>
              </div>
            )}
          </div>
        </div>

        <footer className="relative z-10 text-center text-xs text-white/60 p-6 mt-auto">
          <p>{t('app.footer')}</p>
        </footer>

        <Toast message={toast.message} show={toast.show} />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </main>
    </SettingsProvider>
  );
};

export default App;
