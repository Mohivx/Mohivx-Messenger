import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, DirectionMode, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  directionMode: DirectionMode;
  setDirectionMode: (mode: DirectionMode) => void;
  dir: 'rtl' | 'ltr';
  isRtl: boolean;
  t: (key: keyof typeof translations.en, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  directionMode: 'auto',
  setDirectionMode: () => {},
  dir: 'ltr',
  isRtl: false,
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mohivx_lang') as Language;
    return saved === 'ar' || saved === 'en' ? saved : 'en';
  });

  const [directionMode, setDirectionModeState] = useState<DirectionMode>(() => {
    const saved = localStorage.getItem('mohivx_dir_mode') as DirectionMode;
    return saved === 'auto' || saved === 'rtl' || saved === 'ltr' ? saved : 'auto';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mohivx_lang', lang);
  };

  const setDirectionMode = (mode: DirectionMode) => {
    setDirectionModeState(mode);
    localStorage.setItem('mohivx_dir_mode', mode);
  };

  const dir: 'rtl' | 'ltr' =
    directionMode === 'auto' ? (language === 'ar' ? 'rtl' : 'ltr') : directionMode;
  const isRtl = dir === 'rtl';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  const t = (key: keyof typeof translations.en, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en;
    let text = (dict as any)[key] || (translations.en as any)[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        directionMode,
        setDirectionMode,
        dir,
        isRtl,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
