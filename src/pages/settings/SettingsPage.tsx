import React from 'react';
import { GlobeIcon, BellIcon, ShieldAlertIcon } from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { LanguageToggle } from '../../components/shared/LanguageToggle';
export function SettingsPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('settings.title')}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Language Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-card shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 flex items-start gap-4">
            <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-400">
              <GlobeIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {t('settings.language.title')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                {t('settings.language.description')}
              </p>
              <LanguageToggle />
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-card shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 flex items-start gap-4">
            <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-400">
              <BellIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('settings.notifications.title')}
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    {t('settings.notifications.email')}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked />
                  
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative"></div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    {t('settings.notifications.sms')}
                  </span>
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-800 rounded-card shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden">
          <div className="p-6 flex items-start gap-4">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500 dark:text-red-400">
              <ShieldAlertIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">
                {t('settings.danger.title')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                {t('settings.danger.deleteWarning')}
              </p>

              <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                {t('settings.danger.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

}