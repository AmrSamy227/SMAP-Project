import React from 'react';
import { ShieldAlertIcon } from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
export function DisclaimerBanner() {
  const { t } = useLanguage();
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-card rtl:border-l-0 rtl:border-r-4 rtl:rounded-l-card rtl:rounded-r-none mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ShieldAlertIcon
            className="h-5 w-5 text-amber-500"
            aria-hidden="true" />
          
        </div>
        <div className="ms-3">
          <p className="text-sm text-amber-800 font-medium">
            {t('common.disclaimer')}
          </p>
        </div>
      </div>
    </div>);

}