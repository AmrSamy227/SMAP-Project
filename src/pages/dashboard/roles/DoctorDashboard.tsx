import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  ArrowUpRight, 
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coins,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useAuthStore } from '../../../lib/store/authStore';
import { doctorApi, bookingApi, Booking, Invitation } from '../../../lib/api/doctorApi';
import { profileApi, DoctorAccount } from '../../../lib/api/profileApi';
import { getCookie, setCookie } from '../../../lib/utils/cookieUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function DoctorDashboard() {
  const { t, isRTL, locale } = useLanguage();
  const { user } = useAuthStore();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<DoctorAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revenueFilter, setRevenueFilter] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchData();
  }, []);

  // Sync booking fees to localStorage
  useEffect(() => {
    if (bookings.length > 0 && doctorProfile?.consultation_price_egp && user?.uuid) {
      const storageKey = `booking_fees_${user.uuid}`;
      const savedFeesStr = getCookie(storageKey);
      const savedFees = savedFeesStr ? JSON.parse(savedFeesStr) : {};
      let hasUpdates = false;

      bookings.forEach(b => {
        if (!savedFees[b.id]) {
          savedFees[b.id] = doctorProfile.consultation_price_egp;
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        setCookie(storageKey, JSON.stringify(savedFees), 30);
      }
    }
  }, [bookings, doctorProfile, user?.uuid]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsData, invitationsData, profileData] = await Promise.all([
        bookingApi.getDoctorBookings(),
        doctorApi.getInvitations(),
        profileApi.getDoctorProfile()
      ]);
      setBookings(bookingsData);
      setInvitations(invitationsData.filter(i => i.status === 'pending'));
      setDoctorProfile(profileData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const feesMap = useMemo(() => {
    if (!user?.uuid) return {};
    const storageKey = `booking_fees_${user.uuid}`;
    const savedFeesStr = getCookie(storageKey);
    return savedFeesStr ? JSON.parse(savedFeesStr) : {};
  }, [bookings, user?.uuid]); // Update whenever bookings change (as they might trigger a sync)

  const getBookingFee = (bookingId: string) => {
    return feesMap[bookingId] || doctorProfile?.consultation_price_egp || 0;
  };

  const handleBookingAction = async (id: string, action: 'confirm' | 'complete' | 'cancel') => {
    try {
      let notes = '';
      if (action === 'complete' || action === 'cancel') {
        const promptMsg = action === 'complete' ? 
          (isRTL ? 'إضافة ملاحظات طبية (اختياري):' : 'Add medical notes (optional):') :
          (isRTL ? 'سبب الإلغاء (اختياري):' : 'Reason for cancellation (optional):');
        notes = window.prompt(promptMsg) || '';
      }

      if (action === 'confirm') await bookingApi.confirmBooking(id);
      else if (action === 'complete') await bookingApi.completeBooking(id, notes);
      else if (action === 'cancel') await bookingApi.cancelBooking(id, notes);
      
      // Refresh data
      const updated = await bookingApi.getDoctorBookings();
      setBookings(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleInvitationResponse = async (id: string, accept: boolean) => {
    try {
      await doctorApi.respondToInvitation(id, accept);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to respond to invitation');
    }
  };

  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');
    const todayBookings = bookings.filter(b => b.slot.slot_date === today);
    const todayPatientsCount = new Set(todayBookings.map(b => b.user_id)).size;
    const uniquePatients = new Set(bookings.map(b => b.user_id)).size;
    const pendingBookings = bookings.filter(b => b.booking_status === 'pending');

    return [
      {
        label: isRTL ? 'مرضى اليوم' : 'Today\'s Patients',
        value: todayPatientsCount.toString(),
        icon: Users,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20'
      },
      {
        label: isRTL ? 'إجمالي المرضى' : 'Total Patients',
        value: uniquePatients.toString(),
        icon: UserCheck,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20'
      },
      {
        label: isRTL ? 'إجمالي المواعيد' : 'Total Bookings',
        value: bookings.length.toString(),
        icon: ClipboardList,
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/20'
      },
      {
        label: isRTL ? 'طلبات معلقة' : 'Pending Requests',
        value: pendingBookings.length.toString(),
        icon: Calendar,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/20'
      }
    ];
  }, [bookings, invitations, isRTL]);

  const chartData = useMemo(() => {
    const relevant = bookings.filter(b => b.booking_status !== 'cancelled');
    const data: { name: string; revenue: number }[] = [];

    const now = new Date();

    if (revenueFilter === 'week') {
      // Look forward 8 days to include next week's same day
      for (let i = 0; i < 8; i++) {
        const d = new Date();
        d.setDate(now.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        
        const dayRevenue = relevant
          .filter(b => b.slot.slot_date === dateStr)
          .reduce((acc, curr) => acc + getBookingFee(curr.id), 0);
        data.push({
          name: d.toLocaleDateString(locale, { weekday: 'short' }),
          revenue: dayRevenue
        });
      }
    } else if (revenueFilter === 'month') {
      // Look forward 30 days
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(now.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;

        const dayRevenue = relevant
          .filter(b => b.slot.slot_date === dateStr)
          .reduce((acc, curr) => acc + getBookingFee(curr.id), 0);
        if (i % 5 === 0) { // Show label every 5 days
          data.push({
            name: d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
            revenue: dayRevenue
          });
        } else {
          data.push({ name: '', revenue: dayRevenue });
        }
      }
    } else {
      // Look forward 12 months
      for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(now.getMonth() + i);
        const month = d.getMonth();
        const year = d.getFullYear();
        const monthRevenue = relevant
          .filter(b => {
            const bDate = new Date(b.slot.slot_date);
            return bDate.getMonth() === month && bDate.getFullYear() === year;
          })
          .reduce((acc, curr) => acc + getBookingFee(curr.id), 0);
        data.push({
          name: d.toLocaleDateString(locale, { month: 'short' }),
          revenue: monthRevenue
        });
      }
    }
    return data;
  }, [bookings, doctorProfile, revenueFilter, locale, user?.uuid, feesMap]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {isRTL ? `مرحباً د. ${user?.full_name?.split(' ')[0]}` : `Welcome, Dr. ${user?.full_name?.split(' ')[0]}`}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
            {isRTL ? 'إليك نظرة سريعة على عيادتك اليوم' : 'Here\'s what\'s happening in your clinic today.'}
          </p>
          <div className="mt-1 text-[10px] text-primary font-black uppercase opacity-40">
            {isRTL ? 'تاريخ النظام' : 'System Date'}: {new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="p-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <ArrowUpRight className="w-5 h-5 text-gray-400 dark:text-slate-500 rotate-45" />
          </button>
        </div>
      </div>

      {/* Invitations Alert */}
      <AnimatePresence>
        {invitations.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {isRTL ? `لديك ${invitations.length} دعوة انضمام جديدة` : `You have ${invitations.length} new clinic invitations`}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'قم بمراجعة العروض المقدمة من العيادات' : 'Review the offers from medical centers'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {invitations.map(inv => (
                <div key={inv.id} className="flex gap-2">
                   <button 
                    onClick={() => handleInvitationResponse(inv.id, true)}
                    className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all"
                  >
                    {isRTL ? 'قبول' : 'Accept'}
                  </button>
                  <button 
                    onClick={() => handleInvitationResponse(inv.id, false)}
                    className="px-4 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                  >
                    {isRTL ? 'رفض' : 'Decline'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-colors`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-black text-gray-900 dark:text-white">{isRTL ? 'المواعيد القادمة' : 'Upcoming Appointments'}</h3>
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
              {bookings.length} {isRTL ? 'إجمالي' : 'Total'}
            </span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'المريض' : 'Patient'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'الوقت' : 'Time'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'السعر' : 'Fee'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'حالة المريض' : 'Status'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">{isRTL ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">
                      {isRTL ? 'لا توجد مواعيد قادمة' : 'No upcoming appointments'}
                    </td>
                  </tr>
                ) : (
                  bookings.slice(0, 10).map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/5 dark:bg-primary/10 rounded-full flex items-center justify-center font-black text-xs text-primary border border-primary/10 shadow-sm">
                            {(app.patient_name || 'P').charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 dark:text-white text-sm">
                              {app.patient_name || (isRTL ? 'مريض مجهول' : 'Unknown Patient')}
                            </span>
                            <div className="flex flex-col gap-1">
                               <span className="text-[10px] text-primary font-black uppercase tracking-tighter opacity-60">ID: {app.id.slice(0,8)}</span>
                               {app.notes && (
                                 <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 p-2 rounded-lg mt-1">
                                    <p className="text-[10px] text-orange-700 dark:text-orange-400 font-medium leading-tight">
                                      <span className="font-black uppercase mr-1">{isRTL ? 'ملاحظة:' : 'Note:'}</span>
                                      {app.notes}
                                    </p>
                                 </div>
                               )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="font-bold text-gray-600 dark:text-slate-300 text-sm">{app.slot.slot_start_time.slice(0,5)}</span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500">{app.slot.slot_date}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="font-black text-primary text-sm">
                           {getBookingFee(app.id)} {isRTL ? 'ج.م' : 'EGP'}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                          app.booking_status === 'confirmed' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30' : 
                          app.booking_status === 'pending' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30' :
                          app.booking_status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' :
                          'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-100 dark:border-slate-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             app.booking_status === 'confirmed' ? 'bg-green-500' : 
                             app.booking_status === 'pending' ? 'bg-orange-500' :
                             app.booking_status === 'cancelled' ? 'bg-red-500' :
                             'bg-gray-500'
                          }`} />
                          {app.booking_status === 'pending' ? (isRTL ? 'معلق' : 'Pending') :
                           app.booking_status === 'confirmed' ? (isRTL ? 'مؤكد' : 'Confirmed') :
                           app.booking_status === 'cancelled' ? (isRTL ? 'ملغى' : 'Cancelled') :
                           (app.booking_status === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') : app.booking_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.booking_status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleBookingAction(app.id, 'confirm')}
                                className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                title={isRTL ? 'تأكيد' : 'Confirm'}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleBookingAction(app.id, 'cancel')}
                                className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                title={isRTL ? 'إلغاء' : 'Cancel'}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {app.booking_status === 'confirmed' && (
                             <>
                               <button 
                                onClick={() => handleBookingAction(app.id, 'complete')}
                                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                title={isRTL ? 'إكمال' : 'Complete'}
                               >
                                 <CheckCircle2 className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={() => handleBookingAction(app.id, 'cancel')}
                                 className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                 title={isRTL ? 'إلغاء' : 'Cancel'}
                               >
                                 <XCircle className="w-4 h-4" />
                               </button>
                             </>
                          )}
                          {(app.booking_status === 'cancelled' || app.booking_status === 'completed') && (
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 italic">
                              {isRTL ? 'لا توجد إجراءات' : 'No Actions'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Analytics Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/40 dark:shadow-none p-6 flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                {isRTL ? 'تحليلات الأرباح' : 'Revenue Analytics'}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                {isRTL ? 'تتبع نمو عيادتك' : 'Track your clinic growth'}
              </p>
            </div>
            <div className="flex bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700 transition-colors">
              {(['week', 'month', 'year'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setRevenueFilter(f)}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${
                    revenueFilter === f 
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                      : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                  }`}
                >
                  {f === 'week' ? (isRTL ? 'أسبوع' : 'W') : 
                   f === 'month' ? (isRTL ? 'شهر' : 'M') : 
                   (isRTL ? 'سنة' : 'Y')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-[300px] -mx-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '10px',
                    fontWeight: '800',
                    backgroundColor: '#1e293b',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#10b981' }}
                  cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-50 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                  {isRTL ? 'إجمالي الفترة' : 'Period Total'}
                </p>
                <p className="text-xl font-black text-gray-900 dark:text-white mt-1">
                  {chartData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400 transition-colors">
                <Coins className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


