import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BellIcon,
  BrainIcon,
  CalendarIcon,
  CheckCircle2Icon,
  Clock3Icon,
  DropletsIcon,
  FileTextIcon,
  HeartPulseIcon,
  MessageSquareIcon,
  SearchIcon,
  StethoscopeIcon,
  UserRoundIcon } from
'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useAuthStore } from '../../lib/store/authStore';
import { useBookingStore } from '../../lib/store/bookingStore';
import { useRecordsStore } from '../../lib/store/recordsStore';
import { useChatStore } from '../../lib/store/chatStore';
import { DoctorDashboard } from './roles/DoctorDashboard';
import { ClinicDashboard } from './roles/ClinicDashboard';
export function DashboardPage() {
  const { t, locale } = useLanguage();
  const { user } = useAuthStore();
  const { bookings, fetchBookings } = useBookingStore();
  const { records, fetchRecords } = useRecordsStore();
  const { sessions, fetchSessions } = useChatStore();

  useEffect(() => {
    fetchBookings();
    fetchRecords();
    fetchSessions();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 18) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneWeekAgo = new Date(startOfToday);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const analysesCount = records.filter((record) => record.type === 'diabetesAnalysis' || record.type === 'xrayAnalysis').length;
  const newAnalysesThisWeek = records.filter((record) => new Date(record.date) >= oneWeekAgo && (record.type === 'diabetesAnalysis' || record.type === 'xrayAnalysis')).length;
  const upcomingBookingsCount = bookings.filter((booking) => booking.status === 'upcoming').length;
  const prevWeekBookingsCount = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const twoWeeksAgo = new Date(oneWeekAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
    return booking.status === 'upcoming' && bookingDate >= twoWeeksAgo && bookingDate < oneWeekAgo;
  }).length;
  const bookingTrendText = prevWeekBookingsCount > 0 ?
  t('dashboard.dynamic.vsLastWeek', {
    value: Math.round(((upcomingBookingsCount - prevWeekBookingsCount) / prevWeekBookingsCount) * 100)
  }) :
  t('dashboard.dynamic.upcomingCount', { count: upcomingBookingsCount });
  const chatCount = sessions.length;
  const newChatsThisWeek = sessions.filter((session) => new Date(session.date) >= oneWeekAgo).length;
  const latestVisit = records.
  filter((record) => record.type === 'doctorVisit').
  sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const lastVisitText = latestVisit ?
  `${Math.max(0, Math.floor((now.getTime() - new Date(latestVisit.date).getTime()) / 86400000))}d` :
  '--';
  const lastVisitTrend = latestVisit ? t('dashboard.dynamic.latestDoctorConsultation') : t('dashboard.dynamic.noDoctorVisits');
  const stats = [
  {
    label: t('dashboard.stats.analyses'),
    value: `${analysesCount}`,
    icon: ActivityIcon,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    trend: t('dashboard.dynamic.plusThisWeek', { count: newAnalysesThisWeek }),
    trendType: newAnalysesThisWeek > 0 ? 'up' : 'neutral',
    sparkline: [Math.max(1, analysesCount - 4), Math.max(1, analysesCount - 3), Math.max(1, analysesCount - 2), Math.max(1, analysesCount - 1), analysesCount]
  },
  {
    label: t('dashboard.stats.bookings'),
    value: `${upcomingBookingsCount}`,
    icon: CalendarIcon,
    color: 'text-teal-600',
    bg: 'bg-teal-100',
    trend: bookingTrendText,
    trendType: upcomingBookingsCount >= prevWeekBookingsCount ? 'up' : 'down',
    sparkline: [Math.max(1, prevWeekBookingsCount), Math.max(1, prevWeekBookingsCount + 1), Math.max(1, upcomingBookingsCount - 1), upcomingBookingsCount, Math.max(1, upcomingBookingsCount + 1)]
  },
  {
    label: t('dashboard.stats.chats'),
    value: `${chatCount}`,
    icon: MessageSquareIcon,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    trend: t('dashboard.dynamic.plusThisWeek', { count: newChatsThisWeek }),
    trendType: newChatsThisWeek > 0 ? 'up' : 'neutral',
    sparkline: [Math.max(1, chatCount - 3), Math.max(1, chatCount - 2), Math.max(1, chatCount - 1), chatCount, chatCount + 1]
  },
  {
    label: t('dashboard.stats.lastVisit'),
    value: lastVisitText,
    icon: Clock3Icon,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    trend: lastVisitTrend,
    trendType: 'neutral',
    sparkline: [4, 4, 3, 3, 2, 1]
  }];

  const quickActions = [
  {
    title: t('dashboard.quickActions.diagnose'),
    icon: StethoscopeIcon,
    path: `/${locale}/diagnose`,
    description: t('dashboard.quickActions.diagnoseDesc'),
    color: 'bg-cyan-600 text-white hover:bg-cyan-700',
    featured: true
  },
  {
    title: t('dashboard.quickActions.aiAssistant'),
    icon: BrainIcon,
    path: `/${locale}/chat`,
    description: t('dashboard.quickActions.aiAssistantDesc'),
    color: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50',
    featured: false
  },
  {
    title: t('dashboard.quickActions.bookAppointment'),
    icon: CalendarIcon,
    path: `/${locale}/booking`,
    description: t('dashboard.quickActions.bookAppointmentDesc'),
    color: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50',
    featured: false
  },
  {
    title: t('dashboard.quickActions.viewRecords'),
    icon: FileTextIcon,
    path: `/${locale}/records`,
    description: t('dashboard.quickActions.viewRecordsDesc'),
    color: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50',
    featured: false
  }];
  const upcomingBookings = useMemo(() => bookings.
  filter((booking) => booking.status === 'upcoming').
  sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).
  slice(0, 4), [bookings]);
  const upcomingSchedule = upcomingBookings.map((booking) => {
    const bookingDate = new Date(booking.date);
    const isToday = bookingDate.toDateString() === now.toDateString();
    const tomorrow = new Date(startOfToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = bookingDate.toDateString() === tomorrow.toDateString();
    return {
      day: isToday ? t('dashboard.labels.today') : isTomorrow ? t('dashboard.labels.tomorrow') : bookingDate.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' }),
      title: `${locale === 'ar' ? booking.doctor.nameAr : booking.doctor.name} - ${booking.time}`,
      subtitle: t('dashboard.dynamic.specialtyConsultation', { specialty: booking.doctor.specialty })
    };
  });
  const missedBookings = bookings.filter((booking) => booking.status === 'upcoming' && new Date(booking.date) < startOfToday);
  const priorityAlerts = [
  missedBookings.length > 0 ?
  {
    title: t('dashboard.alerts.missedAppointment'),
    detail: t('dashboard.dynamic.appointmentsMissed', { count: missedBookings.length }),
    icon: BellIcon,
    color: 'text-yellow-700 bg-yellow-50 border-yellow-100'
  } :
  {
    title: t('dashboard.alerts.noMissedAppointments'),
    detail: t('dashboard.alerts.allOnTrack'),
    icon: CheckCircle2Icon,
    color: 'text-green-700 bg-green-50 border-green-100'
  },
  {
    title: t('dashboard.alerts.followUpNeeded'),
    detail: upcomingBookings.length ? t('dashboard.dynamic.upcomingRequirePrep', { count: upcomingBookings.length }) : t('dashboard.alerts.noUpcomingYet'),
    icon: AlertCircleIcon,
    color: 'text-blue-600 bg-blue-50 border-blue-100'
  },
  {
    title: t('dashboard.alerts.highGlucoseDetected'),
    detail: t('dashboard.alerts.highGlucoseDetail'),
    icon: DropletsIcon,
    color: 'text-red-600 bg-red-50 border-red-100'
  }];

  const latestDiagnosis = records.find(r => r.type === 'diabetesAnalysis');
  
  const vitals = useMemo(() => {
    if (!latestDiagnosis) return [
      { label: t('dashboard.vitals.heartRate'), value: '--', status: t('dashboard.vitals.normal'), icon: HeartPulseIcon, indicator: 'neutral', color: 'text-teal-600' },
      { label: t('dashboard.vitals.bloodPressure'), value: '--', status: t('dashboard.vitals.normal'), icon: ActivityIcon, indicator: 'neutral', color: 'text-yellow-600' },
      { label: t('dashboard.vitals.glucose'), value: '--', status: t('dashboard.vitals.normal'), icon: DropletsIcon, indicator: 'neutral', color: 'text-red-600' }
    ];

    const data = latestDiagnosis.data;
    const getValue = (val: any) => {
      if (val && typeof val === 'object' && 'value' in val) return val.value;
      return val;
    };

    const glucose = getValue(data.Glucose || data.glucose || '--');
    const bmi = getValue(data.BMI || data.bmi || '--');
    const age = getValue(data.Age || data.age || '--');

    return [
      {
        label: t('dashboard.vitals.glucose'),
        value: `${glucose} mg/dL`,
        status: parseFloat(glucose) > 140 ? t('dashboard.vitals.high') : t('dashboard.vitals.normal'),
        icon: DropletsIcon,
        indicator: parseFloat(glucose) > 140 ? 'up' : 'neutral',
        color: parseFloat(glucose) > 140 ? 'text-red-600' : 'text-teal-600'
      },
      {
        label: 'BMI',
        value: `${bmi}`,
        status: parseFloat(bmi) > 25 ? t('dashboard.vitals.slightlyHigh') : t('dashboard.vitals.normal'),
        icon: ActivityIcon,
        indicator: parseFloat(bmi) > 25 ? 'up' : 'neutral',
        color: parseFloat(bmi) > 25 ? 'text-yellow-600' : 'text-teal-600'
      },
      {
        label: t('dashboard.labels.age'),
        value: `${age}`,
        status: t('dashboard.vitals.normal'),
        icon: UserRoundIcon,
        indicator: 'neutral',
        color: 'text-blue-600'
      }
    ];
  }, [latestDiagnosis, t]);

  const healthTrends = useMemo(() => {
    const diagRecords = records.filter(r => r.type === 'diabetesAnalysis').slice(0, 7).reverse();
    if (diagRecords.length === 0) return [
      { label: t('dashboard.trends.bloodSugar'), values: [0, 0, 0, 0, 0], unit: t('dashboard.units.mgDl') }
    ];

    return [
      {
        label: t('dashboard.trends.bloodSugar'),
        values: diagRecords.map(r => {
          const val = r.data.Glucose || r.data.glucose || 0;
          return typeof val === 'object' && 'value' in val ? val.value : val;
        }),
        unit: t('dashboard.units.mgDl')
      }
    ];
  }, [records, t]);

  const rolePanels = {
    patient: {
      title: t('dashboard.roles.patient.title'),
      message: t('dashboard.roles.patient.message')
    },
    doctor: {
      title: t('dashboard.roles.doctor.title'),
      message: t('dashboard.roles.doctor.message')
    },
    admin: {
      title: t('dashboard.roles.admin.title'),
      message: t('dashboard.roles.admin.message')
    }
  } as const;
  const currentRole = (user?.role || 'patient').toLowerCase() as keyof typeof rolePanels;
  const activeRolePanel = rolePanels[currentRole] || rolePanels.patient;
  const renderSparkline = (values: number[], colorClass = 'text-cyan-500') =>
  <div className="flex items-end gap-1 h-8">
      {values.map((value, idx) =>
    <span
      key={`${value}-${idx}`}
      className={`${colorClass} opacity-80 rounded-sm w-1.5`}
      style={{ height: `${Math.max(20, (value / Math.max(...values)) * 100)}%`, backgroundColor: 'currentColor' }} />
    )}
    </div>;
  const query = searchTerm.trim().toLowerCase();
  const filteredStats = useMemo(() => {
    if (!query) return stats;
    return stats.filter((stat) => stat.label.toLowerCase().includes(query) || stat.trend.toLowerCase().includes(query));
  }, [query, stats]);
  const filteredQuickActions = useMemo(() => {
    if (!query) return quickActions;
    return quickActions.filter((action) =>
    action.title.toLowerCase().includes(query) || action.description.toLowerCase().includes(query)
    );
  }, [query, quickActions]);
  const filteredAlerts = useMemo(() => {
    if (!query) return priorityAlerts;
    return priorityAlerts.filter((alert) =>
    alert.title.toLowerCase().includes(query) || alert.detail.toLowerCase().includes(query)
    );
  }, [query, priorityAlerts]);
  const filteredUpcoming = useMemo(() => {
    if (!query) return upcomingSchedule;
    return upcomingSchedule.filter((item) =>
    item.day.toLowerCase().includes(query) || item.title.toLowerCase().includes(query) || item.subtitle.toLowerCase().includes(query)
    );
  }, [query, upcomingSchedule]);
  const filteredTrends = useMemo(() => {
    if (!query) return healthTrends;
    return healthTrends.filter((trend) => trend.label.toLowerCase().includes(query) || trend.unit.toLowerCase().includes(query));
  }, [query, healthTrends]);
  if (user?.role === 'doctor') return <DoctorDashboard />;
  if (user?.role === 'clinic') return <ClinicDashboard />;

  return (
    <div className="space-y-5 md:space-y-6 p-1 rounded-2xl">
      {/* Welcome Banner + Controls */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-cyan-100 text-sm font-medium mb-1">{getGreeting()}</p>
            <h2 className="text-2xl md:text-3xl font-bold">
            {t('dashboard.welcome', {
              name: user?.full_name?.split(' ')[0] || 'User'
            })}
            </h2>
            <p className="text-cyan-100 text-sm mt-2">{t('dashboard.labels.lastUpdated')}: {new Date().toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}</p>
          </div>
          <div className="relative flex w-full md:w-auto items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-0 md:w-auto">
              <SearchIcon className="h-4 w-4 absolute start-3 top-1/2 -translate-y-1/2 text-cyan-100" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('dashboard.search.placeholder')}
                className="w-full md:w-72 ps-9 pe-3 py-2 rounded-lg bg-white/15 border border-white/20 placeholder:text-cyan-100 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Patient Overview + Vitals */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md p-5 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.sections.patientOverview')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/60 transition-colors">
              <UserRoundIcon className="h-6 w-6 text-cyan-600" />
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-300">{t('dashboard.labels.name')}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.full_name || t('dashboard.labels.defaultPatientName')}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/60 transition-colors">
              <p className="text-xs text-gray-500 dark:text-slate-300">{t('dashboard.labels.age')}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{vitals.find(v => v.label === t('dashboard.labels.age'))?.value || '--'}</p>
              <p className="text-xs mt-1 text-gray-500 dark:text-slate-300">{t('dashboard.labels.lastDiagnosis')}: {latestDiagnosis?.date || '--'}</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 sm:col-span-2 lg:col-span-1">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">{t('dashboard.labels.riskLevel')}</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-300">
                {latestDiagnosis?.data.risk_level === "1" ? t('dashboard.vitals.high') : t('dashboard.vitals.normal')}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{t('dashboard.labels.weeklyFollowup')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md p-5 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.sections.vitalsSnapshot')}</h3>
          <div className="space-y-3">
            {vitals.map((vital) =>
            <div key={vital.label} className="p-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <vital.icon className={`h-4 w-4 ${vital.color}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-200">{vital.label}</span>
                  </div>
                  <span className={`text-xs font-semibold ${vital.color}`}>{vital.status}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{vital.value}</p>
                  {vital.indicator === 'up' ?
                <ArrowUpIcon className={`h-4 w-4 ${vital.color}`} /> :
                <ArrowDownIcon className="h-4 w-4 text-green-600" />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid with trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredStats.map((stat, idx) =>
        <div
          key={idx}
          className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} dark:bg-opacity-20`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-300">{stat.label}</p>
            </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className={`text-xs font-medium ${stat.trendType === 'down' ? 'text-red-600 dark:text-red-400' : stat.trendType === 'up' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'}`}>
                {stat.trendType === 'up' && <ArrowUpIcon className="h-3 w-3 inline-block mr-1" />}
                {stat.trendType === 'down' && <ArrowDownIcon className="h-3 w-3 inline-block mr-1" />}
                {stat.trend}
              </p>
              {renderSparkline(stat.sparkline, stat.trendType === 'down' ? 'text-red-400' : 'text-cyan-400')}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md transition-colors">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-300">{t('dashboard.labels.roleBasedView')}: {user?.role || t('dashboard.labels.patient')}</p>
        <h3 className="text-lg font-semibold mt-1 text-gray-900 dark:text-white">{activeRolePanel.title}</h3>
        <p className="text-sm mt-1 text-gray-600 dark:text-slate-300">{activeRolePanel.message}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('dashboard.quickActions.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
              {filteredQuickActions.map((action, idx) =>
              <Link
                key={idx}
                to={action.path}
                className={`flex flex-col items-start justify-between p-5 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 ${action.color} ${action.featured ? 'md:col-span-2' : 'dark:bg-slate-800 dark:border dark:border-slate-700 dark:text-white'}`}>
                  <div>
                    <action.icon className="h-7 w-7 mb-3" />
                    <span className="font-semibold text-base">
                    {action.title}
                    </span>
                    <p className={`text-sm mt-2 ${action.featured ? 'text-cyan-100' : 'text-gray-600 dark:text-slate-300'}`}>{action.description}</p>
                  </div>
                  <p className={`mt-4 text-sm font-medium ${action.featured ? 'text-white' : 'text-cyan-700 dark:text-cyan-400'}`}>{t('dashboard.labels.open')}</p>
                </Link>
              )}
            </div>
          </div>

          {/* Health Trends */}
          <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md p-5 transition-colors">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.sections.healthTrends')}</h3>
            <div className="space-y-4">
              {filteredTrends.map((trend) =>
              <div key={trend.label} className="p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-200">{trend.label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-300">
                      {t('dashboard.labels.latest')}: {trend.values[trend.values.length - 1]} {trend.unit}
                    </p>
                  </div>
                  {renderSparkline(trend.values, 'text-cyan-500')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Priority Alerts */}
          <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md p-5 transition-colors">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.sections.priorityAlerts')}</h3>
            <div className="space-y-3">
              {filteredAlerts.map((alert) =>
              <div key={alert.title} className={`p-3 rounded-xl border ${alert.color} dark:bg-opacity-20`}>
                  <div className="flex items-start gap-2">
                    <alert.icon className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">{alert.title}</p>
                      <p className="text-xs mt-1 opacity-90">{alert.detail}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming */}
          <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md p-5 transition-colors">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.sections.upcoming')}</h3>
            <div className="space-y-3">
              {filteredUpcoming.length ?
              filteredUpcoming.map((item) =>
              <div key={item.title} className="p-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40 transition-colors">
                  <p className="text-xs text-cyan-700 dark:text-cyan-400 font-semibold">{item.day}</p>
                  <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-xs mt-1 text-gray-500 dark:text-slate-300">{item.subtitle}</p>
                </div>
              ) :
              <div className="p-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40 transition-colors">
                  <p className="text-sm text-gray-500 dark:text-slate-300">{t('dashboard.alerts.noUpcomingYet')}.</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
      {!filteredStats.length && !filteredQuickActions.length && !filteredAlerts.length && !filteredUpcoming.length && !filteredTrends.length &&
      <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 text-center transition-colors">
          <p className="text-gray-900 dark:text-white">{t('dashboard.search.noMatchTitle', { term: searchTerm })}</p>
          <p className="text-sm mt-1 text-gray-500 dark:text-slate-300">{t('dashboard.search.noMatchHint')}</p>
        </div>
      }
    </div>);

}
