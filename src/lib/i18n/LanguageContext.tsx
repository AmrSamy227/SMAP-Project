import React, { useEffect, useState, createContext, useContext } from 'react';
import { translations, Locale } from './translations';
interface LanguageContextType {
  locale: Locale;
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
  toggleLanguage: (locale?: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);
export function LanguageProvider({
  children,
  initialLocale = 'en'



}: {children: React.ReactNode;initialLocale?: Locale;}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const isRTL = locale === 'ar';
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale, isRTL]);
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const toggleLanguage = (newLocale?: Locale) => {
    if (newLocale) {
      setLocaleState(newLocale);
    } else {
      setLocaleState(locale === 'en' ? 'ar' : 'en');
    }
  };
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key is missing in Arabic
        let fallbackValue: any = translations['en'];
        for (const fk of keys) {
          if (
          fallbackValue &&
          typeof fallbackValue === 'object' &&
          fk in fallbackValue)
          {
            fallbackValue = fallbackValue[fk];
          } else {
            return key; // Return key if not found in fallback either
          }
        }
        value = fallbackValue;
        break;
      }
    }
    if (typeof value !== 'string') return key;
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) =>
        str.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue)),
        value
      );
    }
    return value;
  };
  return (
    <LanguageContext.Provider
      value={{
        locale,
        isRTL,
        setLocale,
        toggleLanguage,
        t
      }}>
      
      {children}
    </LanguageContext.Provider>);

}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
