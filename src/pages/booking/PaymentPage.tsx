import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  WalletIcon,
  BanknoteIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  LoaderIcon,
  CalendarIcon,
  ClockIcon,
  LockIcon,
  AlertCircleIcon,
  CheckIcon,
  Building2Icon,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useBookingStore } from '../../lib/store/bookingStore';
import { providerApi } from '../../lib/api/providerApi';

// ── Card number formatter ─────────────────────────────────────────────────────
function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2);
  return digits;
}

// ── Card brand detector ───────────────────────────────────────────────────────
function getCardBrand(number: string) {
  const clean = number.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'visa';
  if (clean.startsWith('5')) return 'mastercard';
  return 'generic';
}

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

export function PaymentPage() {
  const { t, locale, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { 
    confirmedBooking, 
    selectedDoctor, 
    selectedDate,
    selectedSlot, 
    notes, 
    setConfirmedBooking, 
    resetBooking,
    selectedClinicId 
  } = useBookingStore();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'cash'>('cash');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);
  const cardHolderRef = React.useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useLayoutEffect(() => {
    if (paymentMethod === 'card' && !isSuccess && cardHolderRef.current) {
      cardHolderRef.current.focus();
    }
  }, [paymentMethod, isSuccess]);

  useLayoutEffect(() => {
    const main = document.getElementById('main-scroll-container');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
    // Simulate fetching secure checkout session
    const timer = setTimeout(() => setIsInitializing(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedSlot) {
      navigate(`/${locale}/booking`);
    }
  }, [selectedSlot, locale, navigate]);

  useEffect(() => {
    if (isSuccess) {
      const main = document.getElementById('main-scroll-container');
      if (main) main.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  }, [isSuccess]);

  if (!selectedSlot) return null;

  const doctorName = locale === 'ar' ? selectedDoctor?.nameAr : selectedDoctor?.name;
  const currency = locale === 'ar' ? 'ج.م' : 'EGP';

  const validateCard = () => {
    if (!cardHolder.trim()) return 'Please enter the cardholder name.';
    if (cardNumber.replace(/\s/g, '').length < 16) return 'Please enter a valid 16-digit card number.';
    if (expiry.replace(/\s/g, '').replace('/', '').length < 4) return 'Please enter a valid expiry date.';
    if (cvv.length < 3) return 'Please enter a valid CVV.';
    return null;
  };

  const handlePayment = async () => {
    if (paymentMethod === 'card') {
      const err = validateCard();
      if (err) { setCardError(err); return; }
    }
    setCardError(null);
    setIsProcessing(true);

    try {
      // 1. Create the booking on the backend only when user clicks Pay
      const booking = await providerApi.createBooking({
        slot_id: selectedSlot.id,
        notes: notes || undefined,
        booking_language: locale,
        clinic_id: selectedClinicId,
      });
      setConfirmedBooking(booking);

      // 2. Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2200));
      
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed. Please try again.';
      setCardError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto pt-10 pb-20 px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </motion.div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {t('booking.confirm.payment.success')}
          </h1>
          <p className="text-slate-500 mb-8">{t('booking.confirm.successMsg')}</p>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 mb-8 text-left space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {t('booking.confirm.bookingId')}
              </span>
              <span className="text-sm font-mono font-bold text-cyan-600">
                #{confirmedBooking?.id.slice(-10).toUpperCase()}
              </span>
            </div>
            <div className="h-px bg-slate-200/50" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('booking.confirm.doctor')}</span>
              <span className="text-sm font-semibold text-slate-800">{doctorName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('booking.confirm.date')}</span>
              <span className="text-sm font-semibold text-slate-800">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString(
                  locale === 'ar' ? 'ar-SA' : 'en-US',
                  { month: 'short', day: 'numeric', year: 'numeric' }
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('booking.confirm.time')}</span>
              <span className="text-sm font-semibold text-slate-800">
                {selectedSlot.time} {selectedSlot.period}
              </span>
            </div>
            <div className="h-px bg-slate-200/50" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">{t('booking.confirm.payment.amountPaid')}</span>
              <span className="text-xl font-black text-green-600 flex items-baseline gap-1">
                {selectedDoctor?.price ?? 0}
                <span className="text-sm font-bold">{currency}</span>
              </span>
            </div>
          </div>


          <button
            onClick={() => {
              resetBooking();
              navigate(`/${locale}/booking/my`);
            }}
            className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-200 active:scale-95"
          >
            {t('booking.confirm.viewBookings')}
          </button>
          <button
            onClick={() => {
              resetBooking();
              navigate(`/${locale}/booking`);
            }}
            className="w-full mt-4 py-2 rounded-xl text-slate-500 font-medium hover:text-slate-800 transition-colors text-sm"
          >
            Back to Doctors
          </button>
        </motion.div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="max-w-4xl mx-auto pb-12 px-4 flex flex-col items-center justify-center py-32">
        <div className="w-16 h-16 border-4 border-cyan-600/20 border-t-cyan-600 rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">{t('booking.confirm.payment.settingUpCheckout')}</h2>
        <p className="text-slate-500 text-sm">{t('booking.confirm.payment.waitPrepareSession')}</p>
      </div>
    );
  }

  // ── Payment form ──────────────────────────────────────────────────────────
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto pb-12 px-4"
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 mb-6 transition-colors font-medium text-sm"
      >
        {isRTL ? <ArrowRightIcon className="w-4 h-4" /> : <ArrowLeftIcon className="w-4 h-4" />}
        {t('common.back')}
      </button>

      {/* Step Indicator */}
      <StepIndicator current={3} />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t('booking.confirm.payment.title')}</h1>
        <p className="text-slate-500 mt-2">{t('booking.confirm.payment.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* ── Left: Payment form (col-span-3) ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Payment Method Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row gap-3">
              {[
                { id: 'card' as const, icon: CreditCardIcon, label: t('booking.confirm.payment.creditCard'), color: 'cyan' },
                { id: 'wallet' as const, icon: WalletIcon, label: t('booking.confirm.payment.digitalWallet'), color: 'purple' },
                { id: 'cash' as const, icon: Building2Icon, label: t('booking.confirm.payment.cash'), color: 'green' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setPaymentMethod(m.id); setCardError(null); }}
                  className={`flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                    paymentMethod === m.id
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-600 shadow-sm'
                      : 'border-slate-50 bg-slate-50/50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-all ${
                    paymentMethod === m.id
                      ? m.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' :
                        m.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      : 'bg-white text-slate-300'
                  }`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card Details Form */}
          <AnimatePresence mode="wait">
            {paymentMethod === 'card' && (
              <motion.div
                key="card-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  {/* Card Preview */}
                  <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 p-6 text-white relative overflow-hidden h-52 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="w-12 h-8 bg-slate-100/20 rounded-md backdrop-blur-sm flex items-center justify-center">
                        <div className="w-8 h-6 bg-yellow-400/80 rounded-sm" />
                      </div>
                      <div className="h-8 flex items-center">
                        {getCardBrand(cardNumber) === 'visa' && <span className="font-black italic text-2xl tracking-tighter">VISA</span>}
                        {getCardBrand(cardNumber) === 'mastercard' && <div className="flex -space-x-2"><div className="w-6 h-6 rounded-full bg-red-500/80" /><div className="w-6 h-6 rounded-full bg-yellow-500/80" /></div>}
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-cyan-100/60 text-[10px] uppercase tracking-[0.2em] mb-1">{t('booking.confirm.payment.cardNumber')}</p>
                      <p className="text-xl font-mono tracking-[0.15em]">
                        {cardNumber ? cardNumber.replace(/\ /g, '').padStart(16, '•').replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                      </p>
                    </div>
                    <div className="relative z-10 flex justify-between items-end">
                      <div>
                        <p className="text-cyan-100/60 text-[10px] uppercase tracking-[0.2em] mb-0.5">{t('booking.confirm.payment.cardHolder')}</p>
                        <p className="text-sm font-bold tracking-wide uppercase truncate max-w-[200px]">
                          {cardHolder || t('booking.confirm.payment.cardHolderPlaceholder')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-100/60 text-[10px] uppercase tracking-[0.2em] mb-0.5">{t('booking.confirm.payment.expiry')}</p>
                        <p className="text-sm font-bold tracking-wide">{expiry || t('booking.confirm.payment.expiryPlaceholder')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="p-6 sm:p-8 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('booking.confirm.payment.cardHolder')}
                      </label>
                      <input
                        ref={cardHolderRef}
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder={t('booking.confirm.payment.cardHolderPlaceholder')}
                        className={`w-full border rounded-xl py-3 px-4 text-slate-800 text-sm focus:outline-none transition-all ${
                          cardError?.includes('cardholder') ? 'border-red-500 ring-1 ring-red-100' : 'border-slate-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('booking.confirm.payment.cardNumber')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder={t('booking.confirm.payment.cardNumberPlaceholder')}
                          className={`w-full border rounded-xl py-3 pl-4 pr-12 text-slate-800 text-sm focus:outline-none transition-all ${
                            cardError?.includes('card number') ? 'border-red-500 ring-1 ring-red-100' : 'border-slate-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100'
                          }`}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                          {getCardBrand(cardNumber) === 'visa' && <div className="text-cyan-600 font-bold italic text-xs">VISA</div>}
                          {getCardBrand(cardNumber) === 'mastercard' && <div className="flex -space-x-1"><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /></div>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          {t('booking.confirm.payment.expiry')}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          placeholder={t('booking.confirm.payment.expiryPlaceholder')}
                          className={`w-full border rounded-xl py-3 px-4 text-slate-800 text-sm focus:outline-none transition-all ${
                            cardError?.includes('expiry') ? 'border-red-500 ring-1 ring-red-100' : 'border-slate-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                          {t('booking.confirm.payment.cvv')}
                        </label>
                        <input
                          type="password"
                          inputMode="numeric"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="•••"
                          className={`w-full border rounded-xl py-3 px-4 text-slate-800 text-sm focus:outline-none transition-all ${
                            cardError?.includes('CVV') ? 'border-red-500 ring-1 ring-red-100' : 'border-slate-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100'
                          }`}
                        />
                      </div>
                    </div>

                    {cardError && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
                        <AlertCircleIcon className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{cardError}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {paymentMethod === 'wallet' && (
              <motion.div
                key="wallet-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center"
              >
                <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <WalletIcon className="w-10 h-10 text-cyan-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('booking.confirm.payment.digitalWallet')}</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                  {t('booking.confirm.payment.walletDesc')}
                </p>
              </motion.div>
            )}

            {paymentMethod === 'cash' && (
              <motion.div
                key="cash-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BanknoteIcon className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('booking.confirm.payment.cash')}</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                  {t('booking.confirm.payment.cashDesc')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Trust Section */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/40?img=${i+10}`} alt="user" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white">
                +1k
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-bold text-slate-800">{t('booking.confirm.payment.trustTitle')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('booking.confirm.payment.trustDesc')}</p>
            </div>
            <div className="flex gap-4">
              <ShieldCheckIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* ── Right: Order Summary (col-span-2, Sticky) ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">
                {t('booking.confirm.payment.summary')}
              </h2>

              <div className="space-y-6">
                {/* Doctor */}
                <div className="flex items-center gap-4">
                  <img
                    src={selectedDoctor?.avatar}
                    alt={doctorName}
                    className="w-14 h-14 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 leading-tight truncate">{doctorName}</p>
                    <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest mt-1">
                      {locale === 'ar' ? (selectedDoctor?.titleAr || selectedDoctor?.specialty) : selectedDoctor?.specialty}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Appointment Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                      <CalendarIcon className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('booking.confirm.date')}</p>
                      <p className="font-bold text-slate-800 text-sm">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString(
                          locale === 'ar' ? 'ar-SA' : 'en-US',
                          { weekday: 'long', month: 'short', day: 'numeric' }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                      <ClockIcon className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('booking.confirm.time')}</p>
                      <p className="font-bold text-slate-800 text-sm">
                        {selectedSlot.time} {selectedSlot.period}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">{t('booking.confirm.payment.consultationFee')}</span>
                    <span className="font-bold text-slate-800 flex items-baseline gap-1">
                      {selectedDoctor?.price ?? 0}
                      <span className="text-xs font-medium">{currency}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">{t('booking.confirm.payment.platformFee')}</span>
                    <span className="font-bold text-green-600">{t('booking.confirm.payment.free')}</span>
                  </div>
                  <div className="h-px bg-slate-100 mt-1" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-black text-slate-900 uppercase tracking-wider text-xs">{t('booking.confirm.payment.total')}</span>
                    <span className="text-2xl font-black text-cyan-600 flex items-baseline gap-1">
                      {selectedDoctor?.price ?? 0}
                      <span className="text-sm font-bold">{currency}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Pay button */}
              <div className="mt-8">
                {cardError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm font-medium">
                    <AlertCircleIcon className="w-5 h-5 shrink-0" />
                    <p>{cardError}</p>
                  </div>
                )}
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-100 ${
                    isProcessing
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-cyan-600 text-white hover:bg-cyan-700 active:scale-95'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <LoaderIcon className="w-4 h-4 animate-spin" />
                      {t('booking.confirm.payment.processing')}
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'cash' ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : (
                        <LockIcon className="w-4 h-4" />
                      )}
                      {paymentMethod === 'cash' 
                        ? t('booking.confirm.confirmBtn') 
                        : t('booking.confirm.payment.payNow')}
                    </>
                  )}
              </button>
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    {t('booking.confirm.payment.trustTitle')}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {t('booking.confirm.payment.trustDesc')}
                </p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-6 opacity-30 grayscale contrast-125">
                <div className="text-[10px] font-bold border border-slate-900 px-1 rounded">PCI-DSS</div>
                <div className="text-[10px] font-bold">VISA</div>
                <div className="text-[10px] font-bold">Mastercard</div>
                <div className="text-[10px] font-bold">Norton</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  );
}
