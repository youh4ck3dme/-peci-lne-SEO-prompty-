import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'sk' ? 'en' : 'sk');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-sm font-semibold transition-colors flex items-center justify-center"
      title={t('languageSwitcher.tooltip')}
    >
      <span className="sm:hidden text-base">{language === 'sk' ? 'EN' : 'SK'}</span>
      <span className="hidden sm:inline">{language === 'sk' ? 'English' : 'Slovensky'}</span>
    </button>
  );
};

export default LanguageSwitcher;
