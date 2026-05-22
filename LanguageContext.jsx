import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectBrowserLanguage, LANGUAGES, t as translate } from './i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('app_lang') || detectBrowserLanguage();
  });

  const setLang = (code) => {
    setLangState(code);
    localStorage.setItem('app_lang', code);
    const langObj = LANGUAGES.find(l => l.code === code);
    document.documentElement.dir = langObj?.dir || 'ltr';
    document.documentElement.lang = code;
  };

  useEffect(() => {
    const langObj = LANGUAGES.find(l => l.code === lang);
    document.documentElement.dir = langObj?.dir || 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translate(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
