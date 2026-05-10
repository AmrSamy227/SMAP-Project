import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  Stethoscope, 
  TrendingUp, 
  Calendar,
  UserPlus,
  Settings,
  Bell,
  Search,
  CheckCircle2,
  XCircle,
  Mail,
  Loader2Icon
} from 'lucide-react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useAuthStore } from '../../../lib/store/authStore';
import { doctorApi, bookingApi, Booking, Invitation } from '../../../lib/api/doctorApi';
import { fetchApi } from '../../../lib/api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

export function ClinicDashboard() {
  const { t, isRTL, locale } = useLanguage();
  const { user } = useAuthStore();
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  const [inviteMessage, setInviteMessage] = useState('We would love to have you in our medical team!');
  const [isUnlinkingId, setIsUnlinkingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // We need a clinic ID. In our system, if it's not in the user object, 
      // we might need to fetch it from /users/me/clinic
      const res = await fetchApi('/users/me/clinic');
      const clinicData = await res.json();
      const clinicId = clinicData.id;

      const [docsData, bookingsData, allDocs] = await Promise.all([
        doctorApi.getClinicDoctors(clinicId),
        bookingApi.getClinicBookings(clinicId),
        doctorApi.getAllDoctors()
      ]);

      setDoctors(docsData);
      setBookings(bookingsData);
      setAllDoctors(allDocs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDoctorsToInvite = useMemo(() => {
    if (!inviteSearch) return [];
    return allDoctors.filter(d => 
      !doctors.some(cd => cd.id === d.id) && 
      (d.full_name.toLowerCase().includes(inviteSearch.toLowerCase()) || 
       d.specialization?.name_en.toLowerCase().includes(inviteSearch.toLowerCase()))
    ).slice(0, 5);
  }, [inviteSearch, allDoctors, doctors]);

  const handleInvite = async (doctorId: string) => {
    try {
      const res = await fetchApi('/users/me/clinic');
      const clinicData = await res.json();
      await doctorApi.inviteDoctor(clinicData.id, doctorId, inviteMessage);
      alert(isRTL ? 'تم إرسال الدعوة بنجاح' : 'Invitation sent successfully');
      setInviteSearch('');
      setIsInviting(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  const handleUnlink = async (doctorId: string) => {
    if (!user?.clinic_account?.id) return;
    if (!window.confirm(isRTL ? 'هل أنت متأكد من إزالة هذا الطبيب من العيادة؟' : 'Are you sure you want to remove this doctor from the clinic?')) return;
    
    setIsUnlinkingId(doctorId);
    try {
      await doctorApi.unlinkDoctor(user.clinic_account.id, doctorId);
      setDoctors(prev => prev.filter(d => d.id !== doctorId));
      setOpenMenuId(null);
    } catch (error) {
      alert(isRTL ? 'حدث خطأ أثناء إزالة الطبيب' : 'Failed to unlink doctor');
    } finally {
      setIsUnlinkingId(null);
    }
  };

  const stats = useMemo(() => {
    // Unique patients count
    const uniquePatientsCount = new Set(bookings.map(b => b.user_id)).size;

    return [
      {
        label: isRTL ? 'إجمالي الأطباء' : 'Total Doctors',
        value: doctors.length.toString(),
        icon: Stethoscope,
        color: 'text-cyan-600 dark:text-cyan-400',
        bg: 'bg-cyan-50 dark:bg-cyan-900/20'
      },
      {
        label: isRTL ? 'حجوزات النشطة' : 'Active Bookings',
        value: bookings.filter(b => b.booking_status === 'confirmed').length.toString(),
        icon: Calendar,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/20'
      },
      {
        label: isRTL ? 'الطلبات المعلقة' : 'Pending Requests',
        value: bookings.filter(b => b.booking_status === 'pending').length.toString(),
        icon: Bell,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20'
      },
      {
        label: isRTL ? 'إجمالي المرضى' : 'Total Patients',
        value: uniquePatientsCount.toString(),
        icon: Users,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20'
      }
    ];
  }, [doctors, bookings, isRTL]);

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
            {isRTL ? `لوحة تحكم ${user?.clinic_account?.name || 'العيادة'}` : `${user?.clinic_account?.name || 'Clinic'} Dashboard`}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
            {isRTL ? 'إدارة منشأتك الطبية وأطقم العمل' : 'Manage your medical facility and staff.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsInviting(!isInviting)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <UserPlus className="w-4 h-4" />
            {isRTL ? 'توظيف طبيب' : 'Hire Doctor'}
          </button>
        </div>
      </div>

      {/* Hire Doctor Section */}
      <AnimatePresence>
        {isInviting && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">{isRTL ? 'البحث عن أطباء للانضمام' : 'Find Doctors to Join'}</h3>
              <button onClick={() => setIsInviting(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="relative mb-4">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                type="text" 
                placeholder={isRTL ? 'ابحث بالاسم أو التخصص...' : 'Search by name or specialty...'}
                value={inviteSearch}
                onChange={(e) => setInviteSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm dark:text-white"
               />
            </div>
            
            <div className="space-y-3">
              {filteredDoctorsToInvite.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center font-bold text-primary border border-gray-100 dark:border-slate-700">
                      {doc.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{doc.full_name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">{isRTL ? doc.specialization?.name_ar : doc.specialization?.name_en}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleInvite(doc.id)}
                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                    title={isRTL ? 'إرسال دعوة' : 'Send Invite'}
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {inviteSearch && filteredDoctorsToInvite.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">{isRTL ? 'لم يتم العثور على أطباء متاحين' : 'No available doctors found'}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 transition-colors`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctors Management */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-black text-gray-900 dark:text-white">{isRTL ? 'فريق الأطباء' : 'Medical Staff'}</h3>
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
              {doctors.length} {isRTL ? 'نشط' : 'Active'}
            </span>
          </div>
          <div className="p-6 space-y-4">
            {doctors.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">{isRTL ? 'لا يوجد أطباء مرتبطون حالياً' : 'No doctors currently linked'}</p>
                <button onClick={() => setIsInviting(true)} className="text-primary text-xs font-bold mt-2 hover:underline">
                  {isRTL ? 'ابدأ بالتوظيف الآن' : 'Start hiring now'}
                </button>
              </div>
            ) : (
              doctors.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full border border-gray-100 dark:border-slate-700 flex items-center justify-center font-bold text-primary">
                      {doc.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{doc.full_name}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                        {isRTL ? doc.specialization?.name_ar : doc.specialization?.name_en}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-black text-gray-900 dark:text-white">{doc.rating_count || 0} {isRTL ? 'تقييم' : 'Reviews'}</p>
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase">
                        {doc.average_rating ? `★ ${doc.average_rating}` : (isRTL ? 'جديد' : 'New')}
                      </p>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"
                      >
                        <Settings className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                      </button>

                      {openMenuId === doc.id && (
                        <div className="absolute top-10 right-0 bg-white dark:bg-slate-800 border border-red-500 dark:border-red-900/50 rounded-xl shadow-lg shadow-red-100 dark:shadow-none overflow-hidden py-1 w-48 z-10 animate-in zoom-in-95 duration-100">
                          <button 
                            onClick={() => handleUnlink(doc.id)}
                            disabled={isUnlinkingId === doc.id}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2 font-bold"
                            dir={isRTL ? 'rtl' : 'ltr'}
                          >
                            {isUnlinkingId === doc.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            {isRTL ? 'إزالة الطبيب' : 'Unlink Doctor'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Facility Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
            <h3 className="font-black text-gray-900 dark:text-white mb-4">{isRTL ? 'معلومات المنشأة' : 'Facility Info'}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tighter">{isRTL ? 'الاسم' : 'Name'}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{user?.clinic_account?.name || 'Elite Medical Center'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tighter">{isRTL ? 'المسؤول' : 'Admin'}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{user?.full_name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 dark:bg-slate-800 p-6 rounded-2xl text-white shadow-xl shadow-gray-200 dark:shadow-none relative overflow-hidden transition-colors">
             <TrendingUp className="absolute top-0 right-0 w-24 h-24 text-white/5 -mr-8 -mt-8" />
             <h4 className="font-black mb-1">{isRTL ? 'إحصائيات الأداء' : 'Performance'}</h4>
             <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold mb-4 uppercase tracking-widest">{isRTL ? 'معدل الإشغال' : 'Occupancy Rate'}</p>
             <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-black">78%</span>
                <span className="text-[10px] text-green-400 font-bold mb-1">+5.2%</span>
             </div>
             <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[78%]" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
