import { useEffect, useMemo, useState, useLayoutEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
  BadgeCheckIcon,
  LoaderIcon,
  AlertCircleIcon,
  QuoteIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useBookingStore } from '../../lib/store/bookingStore';
import { providerApi, DoctorOut, SlotOut } from '../../lib/api/providerApi';

const DOCTOR_PLACEHOLDER =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(timeStr: string): { display: string; period: 'AM' | 'PM' } {
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr;
  const period: 'AM' | 'PM' = h < 12 ? 'AM' : 'PM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return { display: `${String(h).padStart(2, '0')}:${m}`, period };
}

function formatDateLabel(dateStr: string, locale: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return locale === 'ar' ? 'اليوم' : 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return locale === 'ar' ? 'غداً' : 'Tomorrow';
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function DoctorProfilePage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clinicId = queryParams.get('clinicId');
  const { setDoctor, selectedDate, setDate, selectedSlot, setSlot, setClinicId } = useBookingStore();

  const [doctor, setDoctorData] = useState<DoctorOut | null>(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [allSlots, setAllSlots] = useState<SlotOut[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!doctorId) return;
    setDoctorLoading(true);
    setDoctorError(null);

    providerApi.getDoctor(doctorId)
      .then((data) => {
        setDoctorData(data);
        setDoctor({
          id: data.id,
          name: data.full_name,
          nameAr: data.full_name,
          title: data.specialization?.name_en ?? '',
          titleAr: data.specialization?.name_ar ?? '',
          specialty: data.specialization?.name_en ?? '',
          city: data.doctor_clinics?.[0]?.clinic?.address ?? '',
          address: data.doctor_clinics?.[0]?.clinic?.address ?? '',
          addressAr: data.doctor_clinics?.[0]?.clinic?.address ?? '',
          rating: data.average_rating ?? 0,
          reviewCount: data.rating_count ?? 0,
          price: data.consultation_price_egp ?? 0,
          avatar: DOCTOR_PLACEHOLDER,
          bio: data.bio_en ?? '',
          bioAr: data.bio_ar ?? '',
          experience: data.years_of_experience ?? 0,
          nextAvailable: new Date().toISOString(),
          waitingTime: 15,
          type: 'doctor',
        });
      })
      .catch((err) => {
        console.error('Failed to load doctor:', err);
        setDoctorError('Doctor not found or failed to load. Please try again.');
      })
      .finally(() => setDoctorLoading(false));
    setClinicId(clinicId);
  }, [doctorId, clinicId, setClinicId]);

  useEffect(() => {
    if (!doctorId) return;
    setSlotsLoading(true);
    providerApi.getAvailableSlots(doctorId, undefined, undefined, clinicId)
      .then((slots) => {
        setAllSlots(slots);
        if (slots.length > 0 && !selectedDate) {
          setDate(slots[0].slot_date);
        }
      })
      .catch((err) => {
        console.warn('Could not load slots:', err);
      })
      .finally(() => setSlotsLoading(false));
  }, [doctorId, clinicId, setDate, selectedDate]);

  const filteredSlots = useMemo(() => {
    return allSlots.filter((s) => {
      if (clinicId) return s.clinic_id === clinicId;
      return !s.clinic_id;
    });
  }, [allSlots, clinicId]);

  const availableDates = useMemo(() => {
    const seen = new Set<string>();
    filteredSlots.forEach((s) => seen.add(s.slot_date));
    return Array.from(seen).sort();
  }, [filteredSlots]);

  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return filteredSlots
      .filter((s) => s.slot_date === selectedDate)
      .sort((a, b) => a.slot_start_time.localeCompare(b.slot_start_time));
  }, [filteredSlots, selectedDate]);

  const handleBook = () => {
    if (selectedDate && selectedSlot) {
      window.scrollTo(0, 0);
      navigate(`/${locale}/booking/confirm`);
    }
  };

  const currentClinicInfo = useMemo(() => {
    if (!doctor) return null;
    if (!clinicId) return doctor.doctor_clinics?.[0]?.clinic;
    return doctor.doctor_clinics?.find(dc => dc.clinic_id === clinicId)?.clinic || doctor.doctor_clinics?.[0]?.clinic;
  }, [doctor, clinicId]);

  const specName = useMemo(() => {
    if (!doctor) return '';
    return locale === 'ar' ? doctor.specialization?.name_ar : doctor.specialization?.name_en;
  }, [doctor, locale]);

  const bio = useMemo(() => {
    if (!doctor) return '';
    return locale === 'ar' ? doctor.bio_ar : doctor.bio_en;
  }, [doctor, locale]);

  if (doctorLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
        <LoaderIcon className="w-10 h-10 animate-spin text-cyan-400" />
        <p className="text-sm">{t('booking.profile.loading')}</p>
      </div>
    );
  }

  if (doctorError || !doctor) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-50 border border-red-100 rounded-2xl p-10 text-center">
        <AlertCircleIcon className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-red-700 mb-2">{t('booking.profile.doctorNotFound')}</h2>
        <p className="text-red-500 text-sm mb-5">{doctorError}</p>
        <button
          onClick={() => navigate(`/${locale}/booking`)}
          className="bg-cyan-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-cyan-700 transition-colors"
        >
          {t('booking.profile.backToList')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 px-4">
      {/* Navigation & Breadcrumbs */}
      <div className="flex items-center gap-2 mb-8 py-2 overflow-x-auto no-scrollbar whitespace-nowrap text-xs font-medium text-slate-400">
        <span className="hover:text-cyan-500 cursor-pointer">{t('common.home')}</span>
        <span>/</span>
        <span className="hover:text-cyan-500 cursor-pointer" onClick={() => navigate(`/${locale}/booking`)}>{t('booking.listing.tabs.doctors')}</span>
        <span>/</span>
        <span className="text-slate-900 dark:text-white">{doctor.full_name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content (left on LTR, right on RTL) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Doctor Header Card */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-colors">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="relative shrink-0">
                <div className="w-40 h-40 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
                  <img src={DOCTOR_PLACEHOLDER} alt={doctor.full_name} className="w-full h-full object-cover" />
                </div>
                {doctor.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-cyan-600 text-white p-2 rounded-2xl shadow-lg border-4 border-white dark:border-slate-800">
                    <BadgeCheckIcon className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-start">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{doctor.full_name}</h1>
                <p className="text-cyan-600 dark:text-cyan-400 font-bold text-lg mb-4">{specName}</p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <StarIcon className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="font-black text-amber-700 dark:text-amber-400">{doctor.average_rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-amber-600 dark:text-amber-500/70 font-bold">({doctor.rating_count || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1.5 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                    <ShieldCheckIcon className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs text-cyan-700 dark:text-cyan-400 font-bold">{t('booking.profile.verifiedProfile')}</span>
                  </div>
                </div>

                {/* Featured Review */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl relative border border-slate-100 dark:border-slate-800">
                  <QuoteIcon className="w-8 h-8 text-blue-500/10 absolute top-4 right-4" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                    {locale === 'ar' 
                      ? '"الطبيب محترف للغاية ومهتم. كان الفحص شاملاً وشرح خطة العلاج كان واضحاً جداً. أنصح به بشدة!"'
                      : '"Doctor is very professional and caring. The examination was thorough and the explanation of the treatment plan was very clear. Highly recommended!"'}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-[10px] font-bold text-cyan-600">JD</div>
                    <span className="text-xs font-bold text-slate-400">Ahmed M. · 16 Jul 2024</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {['Hygiene', 'Punctual', 'Good Listener'].map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          </div>

          {/* About Doctor */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <AlertCircleIcon className="w-5 h-5 text-cyan-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('booking.profile.aboutDoctor')}</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {bio || t('booking.profile.noBio')}
            </p>
          </div>

          {/* Specialties & Services */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                <StethoscopeIcon className="w-5 h-5 text-cyan-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('booking.profile.specialtiesAndServices')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                specName, 
                locale === 'ar' ? 'ضغط الدم' : 'Blood Pressure', 
                locale === 'ar' ? 'التحكم في السكري' : 'Diabetes Control', 
                locale === 'ar' ? 'صحة القلب' : 'Cardiac Health', 
                locale === 'ar' ? 'الفحص العام' : 'General Checkup'
              ].map((service, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <BadgeCheckIcon className="w-4 h-4 text-cyan-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Associated Clinic Card */}
          {currentClinicInfo && (
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{locale === 'ar' ? 'العيادة' : 'The Clinic'}</h2>
              </div>
              
              <div className="group bg-slate-50 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-md shrink-0 ring-4 ring-white dark:ring-slate-800">
                  <img 
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200&h=200" 
                    alt={currentClinicInfo.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 text-center md:text-start">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{currentClinicInfo.name}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400 font-bold">
                    <div className="flex items-center gap-1.5">
                      <MapPinIcon className="w-4 h-4 text-cyan-500" />
                      <span>{currentClinicInfo.address}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="text-[10px] uppercase font-black tracking-widest bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                      {t('booking.profile.primaryLocation')}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-900/30">
                      {t('booking.profile.openNow')}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/${locale}/booking/clinic/${currentClinicInfo.id}`)}
                  className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  {t('booking.profile.clinicInfo')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Booking Card */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
            {/* Header */}
            <div className="bg-cyan-600 p-6 text-white text-center">
              <h3 className="text-sm font-black uppercase tracking-widest">{t('booking.profile.bookingInfo')}</h3>
              <p className="text-cyan-100 text-xs mt-1 font-medium">{t('booking.profile.bookExam')}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Fee & Waiting Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-900/30 text-center">
                  <StarIcon className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                  <span className="block text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">{t('booking.card.fees')}</span>
                  <span className="block text-lg font-black text-cyan-900 dark:text-cyan-100">{doctor.consultation_price_egp} <span className="text-[10px]">{t('common.currency')}</span></span>
                </div>
                <div className="p-4 rounded-3xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-900/30 text-center">
                  <ClockIcon className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
                  <span className="block text-[10px] text-cyan-600 font-bold uppercase tracking-wider mb-1">{t('booking.card.waitingTime')}</span>
                  <span className="block text-lg font-black text-cyan-900 dark:text-cyan-100">15 <span className="text-[10px]">{t('booking.card.mins')}</span></span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
                  <MapPinIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t('booking.profile.location')}</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{currentClinicInfo?.address || t('booking.profile.noAddress')}</p>
                </div>
              </div>

              {/* Date & Slot Picker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('booking.profile.chooseAppointment')}</h4>
                </div>

                {slotsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <LoaderIcon className="w-6 h-6 animate-spin text-cyan-500" />
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{t('booking.profile.loadingSlots')}</span>
                  </div>
                ) : allSlots.length === 0 ? (
                  <div className="py-12 text-center">
                    <CalendarIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">{t('booking.profile.noSlots')}</p>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                      {availableDates.map(dateStr => {
                        const isSelected = selectedDate === dateStr;
                        const label = formatDateLabel(dateStr, locale);
                        return (
                          <button
                            key={dateStr}
                            onClick={() => { setDate(dateStr); setSlot(null); }}
                            className={`flex-shrink-0 w-24 p-3 rounded-2xl border transition-all ${
                              isSelected 
                                ? 'bg-cyan-600 border-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-cyan-200 dark:hover:border-cyan-900/50'
                            }`}
                          >
                            <div className={`text-[10px] font-black uppercase mb-1 ${isSelected ? 'text-cyan-100' : 'text-slate-400'}`}>{label}</div>
                            {/* Slots for this day */}
                            <div className="space-y-1 mt-2">
                              {filteredSlots
                                .filter(s => s.slot_date === dateStr)
                                .slice(0, 3)
                                .map(s => {
                                  const { display } = formatTime(s.slot_start_time);
                                  return (
                                    <div key={s.id} className={`text-[10px] font-bold ${isSelected ? 'text-white/80' : 'text-cyan-500'}`}>
                                      {display}
                                    </div>
                                  );
                                })}
                            </div>
                            <div className={`mt-3 w-full py-1.5 rounded-lg text-[10px] font-black uppercase ${isSelected ? 'bg-white text-cyan-600' : 'bg-cyan-600 text-white'}`}>
                              {t('booking.profile.book')}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Selection */}
              <AnimatePresence>
                {selectedDate && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pt-4 border-t border-slate-50 dark:border-slate-700"
                  >
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">{t('booking.profile.availableTimes')}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {slotsForDate.map(slot => {
                        const { display, period } = formatTime(slot.slot_start_time);
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            key={slot.id}
                            onClick={() => setSlot({ id: slot.id, time: display, period, available: true })}
                            className={`py-2 rounded-xl text-[10px] font-black transition-all border ${
                              isSelected 
                                ? 'bg-cyan-600 border-cyan-600 text-white shadow-md' 
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-200 dark:hover:border-cyan-900/50'
                            }`}
                          >
                            {display}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleBook}
                disabled={!selectedDate || !selectedSlot}
                className={`w-full py-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${
                  selectedDate && selectedSlot
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                {t('booking.profile.bookAppointment')}
              </button>

              <div className="flex items-center gap-2 p-4 rounded-3xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <ShieldCheckIcon className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-[10px] font-bold text-green-700 dark:text-green-400 leading-tight">
                  {t('booking.profile.payInClinic')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <ShieldCheckIcon className="w-3 h-3" />
            <span>Search · Select · Book</span>
          </div>
        </div>
      </div>
    </div>
  );
}
