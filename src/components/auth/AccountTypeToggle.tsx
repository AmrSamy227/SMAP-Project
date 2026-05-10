import React from 'react';
import { UserIcon, BuildingIcon } from 'lucide-react';

type AccountType = 'user' | 'health_centre';

interface AccountTypeToggleProps {
  value: AccountType;
  onChange: (type: AccountType) => void;
  isRTL?: boolean;
}

export function AccountTypeToggle({ value, onChange, isRTL }: AccountTypeToggleProps) {
  return (
    <div className="mb-8">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange('user')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            value === 'user'
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <UserIcon className="h-4 w-4" />
          {isRTL ? 'مستخدم' : 'User'}
        </button>
        <button
          type="button"
          onClick={() => onChange('health_centre')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            value === 'health_centre'
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BuildingIcon className="h-4 w-4" />
          {isRTL ? 'عيادة' : 'Clinic'}
        </button>
      </div>
    </div>
  );
}
