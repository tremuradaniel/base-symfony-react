import { createContext, useContext, useEffect, useState } from 'react';
import { fetchTranslations } from '../api/translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'app_locale';
const SUPPORTED = ['en', 'ro'];

export function LanguageProvider({ children }) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const initial = SUPPORTED.includes(stored) ? stored : 'en';

  const [locale, setLocaleState] = useState(initial);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTranslations(locale)
      .then(setTranslations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale]);

  function setLocale(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    setLocaleState(lang);
  }

  // t('section.key') or t('section.key', { email: 'foo@bar.com' })
  function t(path, params = {}) {
    const keys = path.split('.');
    let val = translations;
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined) return path;
    }
    if (typeof val !== 'string') return path;
    return val.replace(/%(\w+)%/g, (_, k) => params[k] ?? `%${k}%`);
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}