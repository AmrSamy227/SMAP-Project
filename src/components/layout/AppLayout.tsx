import { useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAuthStore } from '../../lib/store/authStore';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { Locale } from '../../lib/i18n/translations';
import { useUiStore } from '../../lib/store/uiStore';
export function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const { setLocale } = useLanguage();
  const { theme, sidebarOpen, toggleSidebar, initTheme } = useUiStore();
  const navigate = useNavigate();
  const { locale } = useParams<{
    locale: string;
  }>();
  const location = useLocation();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    // Sync URL locale with context
    if (locale === 'en' || locale === 'ar') {
      setLocale(locale as Locale);
    } else {
      // Invalid locale, redirect to default
      navigate(`/en${location.pathname}`, {
        replace: true
      });
    }
  }, [locale, setLocale, navigate, location.pathname]);
  useEffect(() => {
    // Protect routes
    if (!isAuthenticated) {
      navigate(`/${locale || 'en'}/`, {
        replace: true
      });
    }
  }, [isAuthenticated, navigate, locale]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const main = document.getElementById('main-scroll-container');
    if (main) main.scrollTop = 0;
  }, [location.pathname]);

  if (!isAuthenticated) return null;
  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <Sidebar />

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />
        <main id="main-scroll-container" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>);

}