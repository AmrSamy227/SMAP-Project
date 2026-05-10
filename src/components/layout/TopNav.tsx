import { MenuIcon, LogOutIcon } from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useUiStore } from '../../lib/store/uiStore';
import { useAuthStore } from '../../lib/store/authStore';
import { LanguageToggle } from '../shared/LanguageToggle';
import { ThemeToggle } from '../shared/ThemeToggle';

import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api/authApi';

export function TopNav() {
  const { t, locale } = useLanguage();
  const { toggleSidebar } = useUiStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return t('nav.dashboard');
    if (path.includes('/diagnose')) return t('nav.diagnose');
    if (path.includes('/chat')) return t('nav.chat');
    if (path.includes('/booking')) return t('nav.booking');
    if (path.includes('/records')) return t('nav.records');
    if (path.includes('/profile')) return t('nav.profile');
    if (path.includes('/settings')) return t('nav.settings');
    return 'SMAP';
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear backend session
      await authApi.logout();
    } catch (error) {
      console.error('[v0] Logout API error:', error);
    } finally {
      // Clear local auth state regardless of API response
      logout();
      navigate(`/${locale}/`);
    }
  };
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 -ms-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Open menu">
          
          <MenuIcon className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>
      <div className="flex items-center gap-3 sm:gap-5">
        <ThemeToggle />
        <LanguageToggle />

        <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end rtl:items-start">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none">
              {user?.full_name || 'User'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {user?.role === 'doctor' ? (locale === 'ar' ? 'طبيب' : 'Doctor') : 
               user?.role === 'clinic' ? (locale === 'ar' ? 'عيادة' : 'Clinic') : 
               user?.role === 'admin' ? (locale === 'ar' ? 'مسؤول' : 'Admin') : 
               (locale === 'ar' ? 'مريض' : 'Patient')}
            </span>
          </div>
          <button
            onClick={() => navigate(`/${locale}/profile`)}
            className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer overflow-hidden"
          >
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0).toUpperCase() || 'U'
            )}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title={t('nav.logout')}>
            
            <LogOutIcon className="h-5 w-5 rtl:scale-x-[-1]" />
          </button>
        </div>
      </div>

    </header>);

}
