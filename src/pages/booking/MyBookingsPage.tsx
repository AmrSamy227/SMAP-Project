import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  LoaderIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  XCircleIcon,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { providerApi, BookingOut } from '../../lib/api/providerApi';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatSlotDate(dateStr: string, locale: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(
    locale === 'ar' ? 'ar-SA' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );
}

function formatSlotTime(timeStr: string) {
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const period = h < 12 ? 'AM' : 'PM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${String(h).padStart(2, '0')}:${mStr} ${period}`;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-900/20',
  confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/10 dark:text-cyan-400 dark:border-cyan-900/20',
  completed: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/20',
  cancelled: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20',
};

// ── Component ──────────────────────────────────────────────────────────────

export function MyBookingsPage() {
  const { t, locale } = useLanguage();

  const [bookings, setBookings] = useState<BookingOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  // Track which booking is being cancelled (bookingId → true)
  const [cancellingIds, setCancellingIds] = useState<Record<string, boolean>>({});
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    setError(null);
    providerApi
      .getMyBookings()
      .then((data) => setBookings(data))
      .catch((err) => {
        console.error('Failed to load bookings:', err);
        setError(err.message ?? 'Failed to load your bookings. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm(t('booking.my.cancelConfirm'))) return;
    setCancellingIds((prev) => ({ ...prev, [bookingId]: true }));
    setCancelError(null);
    try {
      await providerApi.cancelBooking(bookingId);
      // Optimistically update status in local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, booking_status: 'cancelled' } : b
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel booking.';
      setCancelError(msg);
    } finally {
      setCancellingIds((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // ── Filter by tab ─────────────────────────────────────────────────────────
  const filteredBookings = bookings
    .filter((b) => {
      if (activeTab === 'upcoming') {
        return b.booking_status === 'pending' || b.booking_status === 'confirmed';
      }
      return b.booking_status === 'completed' || b.booking_status === 'cancelled';
    })
    .sort(
      (a, b) =>
        new Date(b.slot.slot_date).getTime() - new Date(a.slot.slot_date).getTime()
    );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto pb-12 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('booking.my.title')}</h1>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 font-medium text-sm"
          title={t('booking.my.refresh')}
        >
          <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('booking.my.refresh')}
        </button>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-8 gap-1 transition-colors">
        {(['upcoming', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-7 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'upcoming' ? t('booking.my.upcoming') : t('booking.my.past')}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
          <LoaderIcon className="w-10 h-10 animate-spin text-cyan-400" />
          <p className="text-sm">{t('booking.my.loading')}</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-8 text-center">
          <AlertCircleIcon className="w-10 h-10 text-red-400 dark:text-red-500/50 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 font-semibold mb-4">{error}</p>
          <button
            onClick={fetchBookings}
            className="bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-cyan-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Cancel error banner */}
      {cancelError && (
        <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-600 text-sm font-medium">{cancelError}</p>
          </div>
          <button onClick={() => setCancelError(null)} className="text-red-400 hover:text-red-600 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Bookings list */}
      {!loading && !error && (
        <AnimatePresence mode="wait">
          {filteredBookings.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {filteredBookings.map((booking, idx) => {
                const isCancelled = booking.booking_status === 'cancelled';
                const dateObj = new Date(booking.slot.slot_date + 'T00:00:00');
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border overflow-hidden flex flex-col sm:flex-row transition-all ${
                      isCancelled ? 'border-slate-100 dark:border-slate-800 opacity-70' : 'border-slate-100 dark:border-slate-800 hover:border-cyan-100 dark:hover:border-cyan-900/50 hover:shadow-md'
                    }`}
                  >
                    {/* Date column */}
                    <div
                      className={`sm:w-32 flex flex-col items-center justify-center p-5 border-b sm:border-b-0 sm:border-r shrink-0 transition-colors ${
                        isCancelled ? 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800' : 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800/30'
                      }`}
                    >
                      <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isCancelled ? 'text-slate-400 dark:text-slate-600' : 'text-cyan-400 dark:text-cyan-500'}`}>
                        {dateObj.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' })}
                      </span>
                      <span className={`text-4xl font-bold leading-none ${isCancelled ? 'text-slate-400 dark:text-slate-600' : 'text-cyan-700 dark:text-cyan-400'}`}>
                        {dateObj.getDate()}
                      </span>
                      <span className={`text-xs mt-1 ${isCancelled ? 'text-slate-400 dark:text-slate-600' : 'text-cyan-400 dark:text-cyan-500'}`}>
                        {dateObj.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' })}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-5">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                            {booking.doctor.full_name}
                          </h3>
                          {booking.clinic && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{booking.clinic.name}</p>
                          )}
                        </div>

                        {/* Status badge */}
                        <span
                          className={`self-start text-xs font-bold px-2.5 py-1 rounded-full border capitalize whitespace-nowrap transition-colors ${
                            STATUS_STYLES[booking.booking_status] ?? 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {t(`booking.status.${booking.booking_status}`)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                          <span>
                            {formatSlotTime(booking.slot.slot_start_time)}
                            {' – '}
                            {formatSlotTime(booking.slot.slot_end_time)}
                          </span>
                        </div>
                        {booking.clinic?.address && (
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                            <span className="truncate">{booking.clinic.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {t('booking.my.bookedOn')} {new Date(booking.created_at).toLocaleDateString(
                              locale === 'ar' ? 'ar-SA' : 'en-US',
                              { month: 'short', day: 'numeric', year: 'numeric' }
                            )}
                          </span>
                        </div>
                        {/* Booking ID */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-300 dark:text-slate-600 font-mono">ID:</span>
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 truncate">{booking.id}</span>
                        </div>
                      </div>

                      {/* Cancel button — only for pending or confirmed */}
                      {(booking.booking_status === 'pending' || booking.booking_status === 'confirmed') && (
                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingIds[booking.id]}
                            className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                          >
                            {cancellingIds[booking.id] ? (
                              <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircleIcon className="w-3.5 h-3.5" />
                            )}
                            {cancellingIds[booking.id] ? 'Cancelling…' : t('booking.my.cancel')}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800 transition-colors"
            >
              <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('booking.my.empty')}</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm">{t('booking.my.emptyDesc')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}