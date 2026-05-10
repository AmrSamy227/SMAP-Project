import { NavLink } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  StethoscopeIcon,
  MessageSquareIcon,
  CalendarIcon,
  BookmarkIcon,
  FileTextIcon,
  UserIcon,
  HeartPulseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
  ClipboardListIcon,
  BellIcon
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useUiStore } from '../../lib/store/uiStore';
import { useAuthStore } from '../../lib/store/authStore';
export function Sidebar() {
  const { t, locale, isRTL } = useLanguage();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { user } = useAuthStore();
  
  const allNavItems = [
    {
      path: `/${locale}/dashboard`,
      icon: LayoutDashboardIcon,
      label: t('nav.dashboard'),
      roles: ['user', 'doctor', 'clinic', 'admin']
    },
    {
      path: `/${locale}/diagnose`,
      icon: StethoscopeIcon,
      label: t('nav.diagnose'),
      roles: ['user']
    },
    {
      path: `/${locale}/chat`,
      icon: MessageSquareIcon,
      label: t('nav.chat'),
      roles: ['user']
    },
    {
      path: `/${locale}/booking`,
      icon: CalendarIcon,
      label: t('nav.booking'),
      roles: ['user'],
      end: true
    },
    {
      path: `/${locale}/booking/my`,
      icon: BookmarkIcon,
      label: t('booking.my.title'),
      roles: ['user']
    },
    
    {
      path: `/${locale}/records`,
      icon: FileTextIcon,
      label: t('nav.records'),
      roles: ['user']
    },
    {
      path: `/${locale}/clinic/doctors`,
      icon: UsersIcon,
      label: t('nav.clinicDoctors'),
      roles: ['clinic']
    },
    {
      path: `/${locale}/clinic/appointments`,
      icon: ClipboardListIcon,
      label: t('nav.clinicAppointments'),
      roles: ['clinic']
    },
    {
      path: `/${locale}/clinic/patients`,
      icon: UsersIcon,
      label: t('nav.clinicPatients'),
      roles: ['clinic']
    },
    {
      path: `/${locale}/doctor/appointments`,
      icon: ClipboardListIcon,
      label: t('nav.doctorAppointments'),
      roles: ['doctor']
    },
    {
      path: `/${locale}/doctor/patients`,
      icon: UsersIcon,
      label: t('nav.doctorPatients'),
      roles: ['doctor']
    },
    {
      path: `/${locale}/doctor/invitations`,
      icon: BellIcon,
      label: t('nav.doctorInvitations'),
      roles: ['doctor']
    },
    {
      path: `/${locale}/profile`,
      icon: UserIcon,
      label: t('nav.profile'),
      roles: ['user', 'doctor', 'clinic']
    }
  ];

  const userRole = (user?.role || 'user').toLowerCase();
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));


  return (
    <aside
      className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-40 bg-white dark:bg-slate-900 border-${isRTL ? 'l' : 'r'} border-gray-200 dark:border-slate-800 transition-all duration-300 flex flex-col
        ${sidebarOpen ? 'w-64' : 'w-20'} 
        md:relative md:translate-x-0
        ${!sidebarOpen && 'max-md:-translate-x-full rtl:max-md:translate-x-full'}
      `}>
      
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-800">
        <div
          className={`flex items-center gap-3 overflow-hidden ${!sidebarOpen && 'md:justify-center md:px-0'}`}>
          
          <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg flex-shrink-0">
            <HeartPulseIcon className="h-6 w-6 text-primary" />
          </div>
          <span
            className={`font-bold text-lg text-gray-900 dark:text-gray-100 whitespace-nowrap transition-opacity duration-300 ${!sidebarOpen ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
            MedAssist AI
          </span>
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg md:hidden"
        >
          {isRTL ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => {
              if (window.innerWidth < 768 && sidebarOpen) {
                toggleSidebar();
              }
            }}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-card transition-colors group relative
              ${isActive ? 'bg-primary/10 dark:bg-primary/20 text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-gray-100'}
              ${!sidebarOpen && 'md:justify-center'}
            `}
            title={!sidebarOpen ? item.label : undefined}>
          
            <item.icon className="h-5 w-5 flex-shrink-0" />
          
            <span className={`whitespace-nowrap transition-opacity duration-300 ${!sidebarOpen ? 'md:hidden' : 'block'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle (Desktop only) */}
      <div className="hidden md:flex p-4 border-t border-gray-100 dark:border-slate-800">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-card transition-colors"
          aria-label="Toggle sidebar">
          
          {sidebarOpen ?
          isRTL ?
          <ChevronRightIcon className="h-5 w-5" /> :

          <ChevronLeftIcon className="h-5 w-5" /> :

          isRTL ?
          <ChevronLeftIcon className="h-5 w-5" /> :

          <ChevronRightIcon className="h-5 w-5" />
          }
        </button>
      </div>
    </aside>);

}
