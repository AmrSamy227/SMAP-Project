import React from 'react';
import { useLocation } from 'react-router-dom';
import { ConstructionIcon } from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { EmptyState } from '../../components/shared/EmptyState';
export function PlaceholderPage() {
  const { t } = useLanguage();
  const location = useLocation();
  // Extract a readable title from the path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const featureName = pathParts.length > 1 ? pathParts[1] : 'Feature';
  const formattedName =
  featureName.charAt(0).toUpperCase() + featureName.slice(1);
  return (
    <div className="h-full flex items-center justify-center min-h-[60vh]">
      <EmptyState
        icon={ConstructionIcon}
        title={`${formattedName} - ${t('common.comingSoon')}`}
        description="This feature is currently under development and will be available in the next release." />
      
    </div>);

}