import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PhoneIcon,
  MailIcon,
  Building2Icon,
  LoaderIcon,
  AlertCircleIcon,
  UserIcon,
  StarIcon,
  BadgeCheckIcon,
  CalendarIcon,
  ClockIcon,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { providerApi, ClinicOut, DoctorOut, SlotOut } from '../../lib/api/providerApi';

const CLINIC_PLACEHOLDER =
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600&h=400';

const DOCTOR_PLACEHOLDER =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150';

// ── Doctor Card with Integrated Slots ───────────────────────────────────────

function DoctorCardWithSlots({ 
  doctor, 
  clinicId, 
  locale, 
  isRTL, 
  navigate,
  t,
}: { 
  doctor: DoctorOut; 
  clinicId: string; 
  locale: string; 
  isRTL: boolean; 
  navigate: any;
  t: any;
}) {
  const [slots, setSlots] = useState<SlotOut[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState(0);

  useEffect(() => {
    setLoadingSlots(true);
    providerApi.getAvailableSlots(doctor.id, undefined, undefined, clinicId)
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [doctor.id, clinicId]);

  const specName = locale === 'ar' ? doctor.specialization?.name_ar : doctor.specialization?.name_en;
  const rating = doctor.average_rating != null ? Number(doctor.average_rating.toFixed(1)) : null;

  // Group slots by date
  const groupedSlots = React.useMemo(() => {
    const groups: { date: string; slots: SlotOut[] }[] = [];
    slots.forEach(s => {
      let group = groups.find(g => g.date === s.slot_date);
      if (!group) {
        group = { date: s.slot_date, slots: [] };
        groups.push(group);
      }
      group.slots.push(s);
    });
    return groups.sort((a, b) => a.date.localeCompare(b.date));
  }, [slots]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all p-5 flex flex-col md:flex-row gap-6">
      {/* Left: Doctor Info */}
      <div className="flex-1 flex gap-5">
        <div className="relative shrink-0">
          <img
            src={DOCTOR_PLACEHOLDER}
            alt={doctor.full_name}
            className="w-24 h-24 rounded-2xl object-cover shadow-sm ring-4 ring-slate-50 dark:ring-slate-700"
          />
          {doctor.is_verified && (
            <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white p-1 rounded-lg border-2 border-white dark:border-slate-800 shadow-sm">
              <BadgeCheckIcon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 dark:text-white text-lg hover:text-cyan-600 transition-colors cursor-pointer" onClick={() => navigate(`/${locale}/booking/${doctor.id}?clinicId=${clinicId}`)}>
            {doctor.full_name}
          </h4>
          {specName && (
            <p className="text-cyan-600 dark:text-cyan-400 font-semibold text-sm mb-2">{specName}</p>
          )}
          
          {rating && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400 fill-current' : 'text-slate-200 dark:text-slate-600'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500">({doctor.rating_count || 0} {t('booking.profile.reviews')})</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="truncate">{doctor.doctor_clinics?.[0]?.clinic?.address || t('booking.profile.noAddress')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <StarIcon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="font-bold">{t('booking.card.fees')}: {doctor.consultation_price_egp} {t('common.currency')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span>{t('booking.card.waitingTime')}: 15 {t('booking.card.mins')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span>{doctor.years_of_experience || 0} {t('booking.card.experience')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Slots Section */}
      <div className="md:w-72 flex flex-col border-t md:border-t-0 md:border-l dark:border-slate-700 pt-5 md:pt-0 md:pl-6">
        <div className="flex-1">
          {loadingSlots ? (
            <div className="flex items-center justify-center h-24">
              <LoaderIcon className="w-5 h-5 animate-spin text-cyan-400" />
            </div>
          ) : groupedSlots.length > 0 ? (
            <div className="relative">
              {/* Date Header Carousel */}
              <div className="flex items-center justify-between mb-4 px-1">
                <button 
                  disabled={activeDateIndex === 0}
                  onClick={() => setActiveDateIndex(i => i - 1)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full disabled:opacity-30"
                >
                  {isRTL ? <ArrowRightIcon className="w-3.5 h-3.5" /> : <ArrowLeftIcon className="w-3.5 h-3.5" />}
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {formatDate(groupedSlots[activeDateIndex].date)}
                </span>
                <button 
                  disabled={activeDateIndex === groupedSlots.length - 1}
                  onClick={() => setActiveDateIndex(i => i + 1)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full disabled:opacity-30"
                >
                  {isRTL ? <ArrowLeftIcon className="w-3.5 h-3.5" /> : <ArrowRightIcon className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Slots List */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {groupedSlots[activeDateIndex].slots.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/${locale}/booking/${doctor.id}?clinicId=${clinicId}`)}
                    className="py-2 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-xl text-xs font-bold border border-cyan-100 dark:border-cyan-900/30 hover:bg-cyan-600 hover:text-white transition-all"
                  >
                    {s.slot_start_time.slice(0, 5)}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-center text-slate-400 font-medium">{locale === 'ar' ? 'احجز الآن لتأكيد الموعد' : 'Book now to reserve'}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-slate-400 text-xs gap-2">
              <CalendarIcon className="w-6 h-6 opacity-30" />
              <span>{t('booking.profile.noSlots')}</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => navigate(`/${locale}/booking/${doctor.id}?clinicId=${clinicId}`)}
          className="w-full bg-cyan-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-cyan-700 shadow-md shadow-cyan-100 transition-all mt-4"
        >
          {t('booking.card.bookNow')}
        </button>
      </div>
    </div>
  );
}

export function ClinicProfilePage() {
  const { clinicId } = useParams<{ clinicId: string }>();
  const { t, locale, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [clinic, setClinic] = useState<ClinicOut | null>(null);
  const [doctors, setDoctors] = useState<DoctorOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!clinicId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      providerApi.getClinic(clinicId),
      providerApi.getClinicDoctors(clinicId).catch(() => []), 
    ])
      .then(([clinicData, doctorsData]) => {
        setClinic(clinicData);
        setDoctors(doctorsData);
      })
      .catch((err) => {
        console.error('Failed to load clinic:', err);
        setError('Clinic not found or failed to load. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [clinicId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
        <LoaderIcon className="w-10 h-10 animate-spin text-cyan-400" />
        <p className="text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-50 border border-red-100 rounded-2xl p-10 text-center">
        <AlertCircleIcon className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-red-700 mb-2">{t('booking.profile.clinicNotFound')}</h2>
        <p className="text-red-500 text-sm mb-5">{error}</p>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto pb-12 px-4"
    >
      {/* Back */}
      <button
        onClick={() => navigate(`/${locale}/booking`)}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 mb-6 transition-colors font-medium text-sm"
      >
        {isRTL ? <ArrowRightIcon className="w-4 h-4" /> : <ArrowLeftIcon className="w-4 h-4" />}
        {t('common.back')}
      </button>

      {/* Premium Clinic Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-8"
      >
        <div className="relative h-48 sm:h-56">
          <img
            src={CLINIC_PLACEHOLDER}
            alt={clinic.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        </div>
        
        <div className="px-8 pb-8 -mt-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-xl border-4 border-white dark:border-slate-800 shrink-0">
              <div className="w-full h-full bg-cyan-50 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center">
                <Building2Icon className="w-12 h-12 text-cyan-600" />
              </div>
            </div>
            <div className="mb-2">
              <h1 className="text-3xl font-black text-white md:text-slate-900 dark:md:text-white drop-shadow-sm md:drop-shadow-none mb-1">
                {clinic.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-400 text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                  <StarIcon className="w-3 h-3 fill-current" />
                  <span>4.8</span>
                </div>
                <span className="text-white md:text-slate-500 dark:text-slate-400 text-sm font-medium">
                  (250+ {t('booking.profile.reviews')})
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mb-2">
            <button className="px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-cyan-100 dark:shadow-none hover:bg-cyan-700 transition-all text-sm">
              {t('booking.profile.clinicInfo')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('booking.profile.aboutClinic')}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {locale === 'ar' ? (
                  <>مرحباً بكم في <strong>{clinic.name}</strong>. نحن ملتزمون بتقديم خدمات رعاية صحية من الدرجة الأولى. مرافقنا مجهزة بأحدث التقنيات الطبية، وفريقنا مكرس لضمان راحتكم وسلامتكم.</>
                ) : (
                  <>Welcome to <strong>{clinic.name}</strong>. We are dedicated to providing top-tier healthcare services. Our facilities are equipped with modern medical technologies, and our staff is committed to your well-being.</>
                )}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-50 dark:border-slate-800">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('booking.profile.location')}</h4>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shrink-0">
                    <MapPinIcon className="w-5 h-5 text-cyan-600" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-sm font-medium">{clinic.address}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('booking.profile.contact')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shrink-0">
                      <PhoneIcon className="w-5 h-5 text-cyan-600" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 text-sm font-medium">{clinic.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shrink-0">
                      <MailIcon className="w-5 h-5 text-cyan-600" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 text-sm font-medium break-all">{clinic.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">{t('booking.profile.clinicSchedule')}</h3>
            <div className="space-y-3">
              {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map(day => (
                <div key={day} className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{day}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">09:00 AM - 09:00 PM</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-sm opacity-50">
                <span className="text-slate-500 font-medium">{locale === 'ar' ? 'الجمعة' : 'Friday'}</span>
                <span className="text-red-500 font-bold">{t('common.closed')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Listing Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-4 mb-2">
          <div className="w-1.5 h-8 bg-cyan-600 rounded-full" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('booking.profile.availableDoctors')}</h2>
        </div>

        {doctors.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-16 text-center border border-dashed border-slate-200 dark:border-slate-700 shadow-sm">
            <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{t('booking.profile.noDoctors')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {doctors.map((doctor) => (
              <DoctorCardWithSlots 
                key={doctor.id} 
                doctor={doctor} 
                clinicId={clinicId!} 
                locale={locale} 
                isRTL={isRTL} 
                navigate={navigate}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
