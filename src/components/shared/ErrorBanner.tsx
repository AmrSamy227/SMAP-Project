import React from 'react';
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  const { t } = useLanguage();
  const displayMessage = message || t('common.error');
  return (
    <div className="bg-red-50 border border-red-200 rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-800 font-medium">{displayMessage}</p>
      </div>
      {onRetry &&
      <button
        onClick={onRetry}
        className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-input hover:bg-red-200 transition-colors">
        
          <RefreshCwIcon className="h-4 w-4" />
          {t('common.retry')}
        </button>
      }
    </div>);

}