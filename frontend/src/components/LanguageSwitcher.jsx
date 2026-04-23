import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="lang-switcher">
      <button
        className={`lang-btn ${locale === 'en' ? 'active' : ''}`}
        onClick={() => setLocale('en')}
        aria-label="English"
      >
        EN
      </button>
      <span className="lang-divider">|</span>
      <button
        className={`lang-btn ${locale === 'ro' ? 'active' : ''}`}
        onClick={() => setLocale('ro')}
        aria-label="Română"
      >
        RO
      </button>
    </div>
  );
}