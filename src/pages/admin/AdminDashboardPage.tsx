import React from 'react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useAuthStore } from '../../lib/store/authStore';
import { BarChart3Icon, UsersIcon, CalendarIcon } from 'lucide-react';

export function AdminDashboardPage() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuthStore();

  return (
    <div className={`space-y-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {t('dashboard.welcome', {
              name: user?.full_name?.split(' ')[0] || (isRTL ? 'مدير' : 'Admin')
            })}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRTL ? 'لوحة تحكم المركز الصحي' : 'Health Centre Admin Dashboard'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">
                {isRTL ? 'إجمالي المرضى' : 'Total Patients'}
              </p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">
                {isRTL ? 'إجمالي المواعيد' : 'Total Appointments'}
              </p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarIcon className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">
                {isRTL ? 'إجمالي الموظفين' : 'Total Staff'}
              </p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3Icon className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isRTL ? 'ميزات الإدارة قادمة قريباً' : 'Admin Features Coming Soon'}
        </h2>
        <p className="text-gray-600">
          {isRTL
            ? 'المزيد من الميزات والتحليلات ستكون متاحة قريباً. تواصل مع المدير للمزيد من المعلومات.'
            : 'More features and analytics will be available soon. Contact your administrator for more information.'}
        </p>
      </div>
    </div>
  );
}