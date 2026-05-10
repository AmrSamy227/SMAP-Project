import React from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';
import { useUiStore } from '../../lib/store/uiStore';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useUiStore();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all duration-300 relative group"
      title={theme === 'dark' ? t('nav.lightMode') || 'Light Mode' : t('nav.darkMode') || 'Dark Mode'}
      aria-label="Toggle theme"
    >
      <div className="relative h-5 w-5 overflow-hidden">
        <div 
          className={`absolute inset-0 transition-transform duration-500 transform ${
            theme === 'dark' ? '-translate-y-full' : 'translate-y-0'
          }`}
        >
          <SunIcon className="h-5 w-5" />
        </div>
        <div 
          className={`absolute inset-0 transition-transform duration-500 transform ${
            theme === 'dark' ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <MoonIcon className="h-5 w-5" />
        </div>
      </div>
      
      {/* Tooltip for desktop */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {theme === 'dark' ? t('nav.lightMode') || 'Light Mode' : t('nav.darkMode') || 'Dark Mode'}
      </span>
    </button>
  );
}
