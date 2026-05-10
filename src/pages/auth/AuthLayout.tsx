import React, { useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { HeartPulseIcon } from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { Locale } from '../../lib/i18n/translations';
import { LanguageToggle } from '../../components/shared/LanguageToggle';

export function AuthLayout() {
  const { setLocale } = useLanguage();
  const { locale } = useParams<{
    locale: string;
  }>();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (locale === 'en' || locale === 'ar') {
      setLocale(locale as Locale);
    } else {
      navigate(`/en${location.pathname}`, {
        replace: true
      });
    }
  }, [locale, setLocale, navigate, location.pathname]);

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'} bg-white dark:bg-slate-950 transition-colors duration-300`}>
      {/* Logo and language toggle */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 md:p-8 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
            <HeartPulseIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            SMAP
          </h1>
        </div>
        <div className="pointer-events-auto">
          <LanguageToggle />
        </div>
      </div>

      {/* Main content */}
      <div className="relative">
        <Outlet />
      </div>
    </div>
  );
}
