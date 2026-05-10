import { useState } from 'react';
import { HeartPulse, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { ThemeToggle } from '../shared/ThemeToggle';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, t, setLocale } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(`/${locale}${path}`);
    setIsMenuOpen(false);
  };

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    setLocale(newLocale);
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'en' || pathParts[1] === 'ar') {
      pathParts[1] = newLocale;
      navigate(pathParts.join('/') + location.search, {
        replace: true
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.location.href = `/${locale}`}
          >
            <div className="bg-cyan-500 p-1.5 rounded-lg">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              SMAP
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('/contact')}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              {t('landing.nav.contact')}
            </button>
            <button
              onClick={() => handleNavigation('/about')}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              {t('landing.nav.about')}
            </button>
            <button
              onClick={() => handleNavigation('/join')}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              {t('landing.nav.joinDoctor')}
            </button>
          </div>

          {/* Auth Buttons and Language Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => handleNavigation('/login')}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors"
            >
              {t('landing.nav.login')}
            </button>
            <button
              onClick={() => handleNavigation('/register')}
              className="text-sm font-medium bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md"
            >
              {t('landing.nav.signup')}
            </button>
            <button
              onClick={toggleLanguage}
              className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ml-4"
            >
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${locale === 'en'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                EN
              </span>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${locale === 'ar'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                عربي
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={toggleLanguage}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-cyan-600"
            >
              {locale === 'en' ? 'عربي' : 'EN'}
            </button>
            <button
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <button
              onClick={() => handleNavigation('/contact')}
              className="block w-full text-left px-4 py-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
            >
              {t('landing.nav.contact')}
            </button>
            <button
              onClick={() => handleNavigation('/about')}
              className="block w-full text-left px-4 py-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
            >
              {t('landing.nav.about')}
            </button>
            <button
              onClick={() => handleNavigation('/join')}
              className="block w-full text-left px-4 py-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
            >
              {t('landing.nav.joinDoctor')}
            </button>
            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={() => handleNavigation('/login')}
                className="w-full text-center py-3 px-4 rounded-xl font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('landing.nav.login')}
              </button>
              <button
                onClick={() => handleNavigation('/register')}
                className="w-full text-center py-3 px-4 rounded-xl font-medium text-white bg-cyan-500 hover:bg-cyan-600"
              >
                {t('landing.nav.signup')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
