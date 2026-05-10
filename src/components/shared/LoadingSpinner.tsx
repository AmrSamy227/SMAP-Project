import React from 'react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
}
export function LoadingSpinner({
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const { t } = useLanguage();
  const displayText = text || t('common.loading');
  const content =
  <div className="flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500 font-medium">{displayText}</p>
    </div>;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>);

  }
  return <div className="py-8">{content}</div>;
}