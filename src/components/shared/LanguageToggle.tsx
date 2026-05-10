import React from 'react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    setLocale(newLocale);
    // Update URL if it contains the locale prefix
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'en' || pathParts[1] === 'ar') {
      pathParts[1] = newLocale;
      navigate(pathParts.join('/') + location.search, {
        replace: true
      });
    }
  };
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center bg-gray-100 rounded-pill p-1 transition-colors hover:bg-gray-200"
      aria-label="Toggle language">
      
      <span
        className={`px-3 py-1 text-sm font-medium rounded-pill transition-all ${locale === 'en' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
        
        EN
      </span>
      <span
        className={`px-3 py-1 text-sm font-medium rounded-pill transition-all ${locale === 'ar' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
        
        عربي
      </span>
    </button>);

}