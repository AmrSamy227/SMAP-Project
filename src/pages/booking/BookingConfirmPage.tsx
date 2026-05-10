import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  LoaderIcon,
  AlertCircleIcon,
  CreditCardIcon,
  CheckIcon,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useBookingStore } from '../../lib/store/bookingStore';

// ── Progress Step Indicator ───────────────────────────────────────────────────
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const { t } = useLanguage();
  const steps = [
    t('booking.steps.slot'),
    t('booking.steps.review'),
    t('booking.steps.payment')
  ];
  return (
    <div className="flex items-center gap-0 mb-8 max-w-lg mx-auto">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  isDone
                    ? 'bg-cyan-600 text-white'
                    : isActive
                    ? 'bg-cyan-600 text-white ring-4 ring-cyan-50'
                    : 'bg-white border border-slate-200 text-slate-400'
                }`}
              >
                {isDone ? <CheckIcon className="w-5 h-5" /> : stepNum}
              </div>
              <span
                className={`text-[11px] mt-2 font-bold uppercase tracking-wider whitespace-nowrap ${
                  isActive ? 'text-cyan-600' : isDone ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-6 rounded-full transition-all ${
                  stepNum < current ? 'bg-cyan-600' : 'bg-slate-100'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function BookingConfirmPage() {
  const { t, locale, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { 
    selectedDoctor, 
    selectedDate, 
    selectedSlot, 
    setConfirmedBooking, 
    notes, 
    setNotes 
  } = useBookingStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const main = document.getElementById('main-scroll-container');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);

  if (!selectedDoctor || !selectedDate || !selectedSlot) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center bg-white border border-slate-100 rounded-2xl p-10 shadow-sm">
        <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 mb-5 font-medium">No booking details found.</p>
        <button
          onClick={() => navigate(`/${locale}/booking`)}
          className="bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-cyan-700 transition-colors"
        >
          Return to Doctors
        </button>
      </div>
    );
  }

  const handleConfirm = () => {
    if (!selectedSlot?.id) {
      setError('No slot selected. Please go back and select a time slot.');
      return;
    }
    window.scrollTo(0, 0);
    navigate(`/${locale}/booking/payment`);
  };

  const doctorName = locale === 'ar' ? selectedDoctor.nameAr : selectedDoctor.name;
  const consultationFee = selectedDoctor.price ?? 0;
  const currency = locale === 'ar' ? 'ج.م' : 'EGP';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto pb-12 px-4"
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 mb-6 transition-colors font-medium text-sm"
      >
        {isRTL ? <ArrowRightIcon className="w-4 h-4" /> : <ArrowLeftIcon className="w-4 h-4" />}
        {t('common.back')}
      </button>

      {/* Step indicator */}
      <StepIndicator current={2} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{t('booking.confirm.title')}</h1>
        <p className="text-slate-500 mt-2">{t('booking.confirm.subtitle')}</p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">

        {/* Doctor row */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            {t('booking.confirm.doctor')}
          </h2>
          <div className="flex items-center gap-4">
            <img
              src={selectedDoctor.avatar}
              alt={selectedDoctor.name}
              className="w-14 h-14 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-slate-900 truncate">
                {locale === 'ar' ? selectedDoctor.nameAr || selectedDoctor.name : selectedDoctor.name}
              </h3>
              {selectedDoctor.title && (
                <p className="text-cyan-500 text-sm font-medium">
                  {locale === 'ar' ? selectedDoctor.titleAr || selectedDoctor.title : selectedDoctor.title}
                </p>
              )}
            </div>
            {consultationFee > 0 && (
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                  {t('booking.confirm.fee')}
                </p>
                <p className="text-lg font-bold text-slate-900 flex items-baseline justify-end gap-1">
                  {consultationFee}
                  <span className="text-sm font-semibold text-slate-500">{currency}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 shrink-0">
                <CalendarIcon className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                  {t('booking.confirm.date')}
                </p>
                <p className="font-semibold text-slate-800">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString(
                    locale === 'ar' ? 'ar-SA' : 'en-US',
                    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 shrink-0">
                <ClockIcon className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                  {t('booking.confirm.time')}
                </p>
                <p className="font-semibold text-slate-800">
                  {selectedSlot.time} {selectedSlot.period}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        {selectedDoctor.address && (
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">
                  {locale === 'ar' 
                    ? (selectedDoctor.titleAr || selectedDoctor.nameAr || selectedDoctor.name) 
                    : (selectedDoctor.title || selectedDoctor.name)}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {locale === 'ar' ? selectedDoctor.addressAr || selectedDoctor.address : selectedDoctor.address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t('booking.confirm.notes')}
          </label>
          <textarea
            rows={3}
            className="w-full border border-slate-200 rounded-xl shadow-sm text-sm p-3 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 outline-none resize-none transition-all"
            placeholder={t('booking.confirm.notesPlaceholder')}
            value={notes || ''}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Fee summary banner */}
      {consultationFee > 0 && (
        <div className="bg-cyan-50 border border-cyan-100 rounded-xl px-5 py-4 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-cyan-700">
            <CreditCardIcon className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">
              {t('booking.confirm.paymentRedirect')}
            </span>
          </div>
          <span className="text-base font-bold text-cyan-700 flex items-baseline gap-1">
            {consultationFee}
            <span className="text-sm">{currency}</span>
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button
          onClick={() => navigate(-1)}
          disabled={isLoading}
          className="px-6 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
        >
          {t('booking.confirm.cancelBtn')}
        </button>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors shadow-md shadow-cyan-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
        >
          {isLoading ? (
            <>
              <LoaderIcon className="w-4 h-4 animate-spin" />
              {t('booking.confirm.reservingSlot')}
            </>
          ) : (
            <>
              {t('booking.confirm.continueToPayment')}
              {isRTL ? <ArrowLeftIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}