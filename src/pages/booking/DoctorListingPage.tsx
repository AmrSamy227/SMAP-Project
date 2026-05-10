import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  FilterIcon,
  SearchIcon,
  ClockIcon,
  BadgeCheckIcon,
  AlertCircleIcon,
  LoaderIcon,
  WalletIcon,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import {
  providerApi,
  DoctorOut,
  ClinicOut,
} from '../../lib/api/providerApi';

// ── Types ──────────────────────────────────────────────────────────────────

type ActiveTab = 'doctor' | 'clinic';

// ── Default avatar placeholder ─────────────────────────────────────────────
const DOCTOR_PLACEHOLDER =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300';
const CLINIC_PLACEHOLDER =
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=300&h=300';

// ── Component ──────────────────────────────────────────────────────────────

export function DoctorListingPage() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ActiveTab>('doctor');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ── API state ────────────────────────────────────────────────────────────
  const [doctors, setDoctors] = useState<DoctorOut[]>([]);
  const [clinics, setClinics] = useState<ClinicOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filters ──────────────────────────────────────────────────────────────
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [isPriceFilterEnabled, setIsPriceFilterEnabled] = useState(false);
  const [filterMinPrice, setFilterMinPrice] = useState(0);
  const [filterMaxPrice, setFilterMaxPrice] = useState(10000);
  const [filterRating, setFilterRating] = useState(0);

  // ── Fetch on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([providerApi.getDoctors(), providerApi.getClinics()])
      .then(([docs, clins]) => {
        if (cancelled) return;
        setDoctors(docs);
        setClinics(clins);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load providers:', err);
        setError(err.message ?? 'Failed to load providers. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Derived specialties list from doctors ────────────────────────────────
  const specialties = useMemo(() => {
    const seenEn = new Set<string>();
    const list: { en: string; ar: string }[] = [];
    doctors.forEach((d) => {
      const en = d.specialization?.name_en;
      const ar = d.specialization?.name_ar;
      if (en && !seenEn.has(en)) {
        seenEn.add(en);
        list.push({ en, ar: ar || en });
      }
    });
    return list.sort((a, b) => a.en.localeCompare(b.en));
  }, [doctors]);

  // ── Cities derived from clinics ──────────────────────────────────────────
  const cities = useMemo(() => {
    const seen = new Set<string>();
    clinics.forEach((c) => {
      // address is free-form; extract last comma-segment as city approximation
      const parts = c.address.split(',');
      const city = parts[parts.length - 1].trim();
      if (city) seen.add(city);
    });
    return Array.from(seen).sort();
  }, [clinics]);

  // ── Filtered + sorted lists ───────────────────────────────────────────────
  const filteredDoctors = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return doctors
      .filter((d) => {
        if (!d.is_active) return false;
        const nameMatch = d.full_name.toLowerCase().includes(q);
        const specMatch = filterSpecialty
          ? d.specialization?.name_en?.toLowerCase() === filterSpecialty.toLowerCase()
          : true;
        const priceMatch =
          !isPriceFilterEnabled ||
          d.consultation_price_egp == null ||
          (d.consultation_price_egp >= filterMinPrice &&
            d.consultation_price_egp <= filterMaxPrice);
        const ratingMatch =
          filterRating === 0 || (d.average_rating ?? 0) >= filterRating;
        const cityMatch = filterCity
          ? d.doctor_clinics?.[0]?.clinic?.address?.toLowerCase().includes(filterCity.toLowerCase())
          : true;
        return nameMatch && specMatch && priceMatch && ratingMatch && cityMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc')
          return (a.consultation_price_egp ?? 0) - (b.consultation_price_egp ?? 0);
        if (sortBy === 'priceDesc')
          return (b.consultation_price_egp ?? 0) - (a.consultation_price_egp ?? 0);
        if (sortBy === 'ratingDesc')
          return (b.average_rating ?? 0) - (a.average_rating ?? 0);
        return 0;
      });
  }, [doctors, searchQuery, filterSpecialty, isPriceFilterEnabled, filterMinPrice, filterMaxPrice, filterRating, sortBy, filterCity]);

  const filteredClinics = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return clinics.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const cityMatch = filterCity
        ? c.address.toLowerCase().includes(filterCity.toLowerCase())
        : true;
      return nameMatch && cityMatch;
    });
  }, [clinics, searchQuery, filterCity]);

  const activeList = activeTab === 'doctor' ? filteredDoctors : filteredClinics;

  const clearFilters = () => {
    setFilterSpecialty('');
    setFilterCity('');
    setIsPriceFilterEnabled(false);
    setFilterMinPrice(0);
    setFilterMaxPrice(10000);
    setFilterRating(0);
    setSearchQuery('');
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const stars = (rating: number | null | undefined) =>
    rating != null ? Number(rating.toFixed(1)) : null;

  // ── Render helpers ────────────────────────────────────────────────────────

  const DoctorCard = ({ doc }: { doc: DoctorOut }) => {
    const rating = stars(doc.average_rating);
    const price = doc.consultation_price_egp;
    const clinic = doc.doctor_clinics?.[0]?.clinic;
    const specName =
      locale === 'ar'
        ? doc.specialization?.name_ar
        : doc.specialization?.name_en;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-cyan-100 dark:hover:border-cyan-900/50 transition-all duration-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Avatar panel */}
          <div className="sm:w-44 bg-gradient-to-br from-cyan-50 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex flex-col items-center justify-center p-5 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 gap-2">
            <div className="relative">
              <img
                src={DOCTOR_PLACEHOLDER}
                alt={doc.full_name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-md"
              />
              {doc.is_verified && (
                <span className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-cyan-500 rounded-full border-2 border-white flex items-center justify-center">
                  <BadgeCheckIcon className="w-3 h-3 text-white" />
                </span>
              )}
            </div>
            {rating != null ? (
              <>
                <div className="flex items-center gap-1 mt-1">
                  <StarIcon className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{rating}</span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                  {t('booking.profile.reviewsCount').replace('{count}', (doc.rating_count ?? 0).toString())}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-slate-400">{t('booking.card.new') || 'New'}</span>
            )}
          </div>

          {/* Info panel */}
          <div className="flex-1 p-5 flex flex-col justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                {doc.full_name}
              </h3>
              {specName && (
                <p className="text-cyan-500 dark:text-cyan-400 font-semibold text-sm mt-0.5">{specName}</p>
              )}

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {clinic?.address && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <WalletIcon className="w-4 h-4 text-cyan-300 dark:text-cyan-500 shrink-0" />
                    <span>
                      {t('booking.card.fees')}{' '}
                      <strong className="text-slate-700 dark:text-slate-200 flex items-baseline gap-1">
                        {price}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-500">{locale === 'ar' ? 'ج.م' : 'EGP'}</span>
                      </strong>
                    </span>
                  </div>
                )}
                {doc.years_of_experience != null && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <CalendarIcon className="w-4 h-4 text-cyan-300 dark:text-cyan-500 shrink-0" />
                    <span>
                      <strong className="text-slate-700 dark:text-slate-200">{doc.years_of_experience}</strong>{' '}
                      {t('booking.profile.experience').split(' ').slice(1).join(' ') || 'yrs experience'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Language pill */}
            {doc.language_spoken && (
              <div className="flex gap-2 flex-wrap">
                <span className="text-[11px] bg-cyan-50 dark:bg-cyan-900/30 text-cyan-500 dark:text-cyan-300 px-2.5 py-1 rounded-full font-semibold border border-cyan-100 dark:border-cyan-900/50">
                  {doc.language_spoken === 'both' ? 'EN / AR' : doc.language_spoken.toUpperCase()}
                </span>
                {doc.is_verified && (
                  <span className="text-[11px] bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 px-2.5 py-1 rounded-full font-semibold border border-green-100 dark:border-green-900/50 flex items-center gap-1">
                    <BadgeCheckIcon className="w-3 h-3" /> {t('booking.card.verified') || 'Verified'}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-50 dark:border-slate-700">
              <button
                onClick={() => navigate(`/${locale}/booking/${doc.id}`)}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow shadow-cyan-200 dark:shadow-none"
              >
                {t('booking.card.bookNow')}
              </button>
              <button
                onClick={() => navigate(`/${locale}/booking/${doc.id}`)}
                className="flex-1 border border-cyan-100 dark:border-slate-600 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-all"
              >
                {t('booking.card.viewProfile')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ClinicCard = ({ clinic }: { clinic: ClinicOut }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50 transition-all duration-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Avatar panel */}
        <div className="sm:w-44 bg-gradient-to-br from-cyan-50 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex flex-col items-center justify-center p-5 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 gap-2">
          <div className="relative">
            <img
              src={CLINIC_PLACEHOLDER}
              alt={clinic.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
            />
          </div>
          <span className="text-[11px] text-slate-500 text-center font-semibold mt-1 uppercase tracking-wider">
            Clinic
          </span>
        </div>

        {/* Info panel */}
        <div className="flex-1 p-5 flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 leading-tight">{clinic.name}</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <MapPinIcon className="w-4 h-4 text-cyan-400 dark:text-cyan-500 shrink-0" />
                <span className="truncate">{clinic.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <ClockIcon className="w-4 h-4 text-cyan-400 dark:text-cyan-500 shrink-0" />
                <span className="truncate">{clinic.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="w-4 h-4 text-center text-cyan-400 dark:text-cyan-500 font-bold shrink-0">@</span>
                <span className="truncate">{clinic.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-50 dark:border-slate-700">
            <button
              onClick={() => navigate(`/${locale}/booking/clinic/${clinic.id}`)}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow shadow-cyan-200 dark:shadow-none"
            >
              {t('booking.card.bookNow')}
            </button>
            <button
              onClick={() => navigate(`/${locale}/booking/clinic/${clinic.id}`)}
              className="flex-1 border border-cyan-100 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-all"
            >
              {t('booking.card.viewProfile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto pb-16 px-4">

      {/* Header */}
      <div className="mb-6 pt-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('booking.listing.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('booking.listing.subtitle')}</p>
      </div>

      {/* Tab Switcher */}
      <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-8 gap-1 transition-colors">
        {(['doctor', 'clinic'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); clearFilters(); }}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'doctor'
              ? t('booking.listing.tabs.doctors')
              : t('booking.listing.tabs.clinics')}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
          <LoaderIcon className="w-10 h-10 animate-spin text-cyan-400" />
          <p className="text-sm">{t('booking.listing.loading')}</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <AlertCircleIcon className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-red-500 hover:underline text-sm font-medium"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Mobile filter toggle */}
          <button
            className="lg:hidden flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-slate-700 dark:text-slate-200 font-medium shadow-sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <FilterIcon className="w-5 h-5" />
            {t('booking.listing.filters.title')}
          </button>

          {/* Sidebar */}
          <div className={`lg:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 sticky top-20 transition-colors">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-900 dark:text-white">{t('booking.listing.filters.title')}</h2>
                <button onClick={clearFilters} className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                  {t('booking.listing.filters.clearFilters')}
                </button>
              </div>

              {/* Common filters (City/Location) */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {t('booking.listing.filters.city')}
                </label>
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-lg p-2 text-sm focus:ring-cyan-400 focus:border-cyan-400 outline-none"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                >
                  <option value="">{t('booking.listing.filters.allCities')}</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Doctor specific filters */}
              {activeTab === 'doctor' && (
                <>
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {t('booking.listing.filters.specialty')}
                    </label>
                    <select
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-lg p-2 text-sm focus:ring-cyan-400 focus:border-cyan-400 outline-none"
                      value={filterSpecialty}
                      onChange={(e) => setFilterSpecialty(e.target.value)}
                    >
                      <option value="">{t('booking.listing.filters.allSpecialties')}</option>
                      {specialties.map((s) => (
                        <option key={s.en} value={s.en}>
                          {locale === 'ar' ? s.ar : s.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {t('booking.listing.filters.priceRange')} ({locale === 'ar' ? 'ج.م' : 'EGP'})
                      </label>
                      <button
                        onClick={() => setIsPriceFilterEnabled(!isPriceFilterEnabled)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${isPriceFilterEnabled ? 'bg-cyan-600' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isPriceFilterEnabled ? (locale === 'ar' ? 'left-0.5' : 'right-0.5') : (locale === 'ar' ? 'right-0.5' : 'left-0.5')}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {isPriceFilterEnabled && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                              placeholder={t('booking.listing.filters.min')}
                              value={filterMinPrice}
                              onChange={(e) => setFilterMinPrice(parseInt(e.target.value) || 0)}
                            />
                            <span className="text-slate-400">–</span>
                            <input
                              type="number"
                              className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                              placeholder={t('booking.listing.filters.max')}
                              value={filterMaxPrice}
                              onChange={(e) => setFilterMaxPrice(parseInt(e.target.value) || 10000)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {t('booking.listing.filters.rating')}
                    </label>
                    <div className="space-y-2">
                      {[4, 3, 2].map((r) => (
                        <label key={r} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rating"
                            className="accent-cyan-600"
                            checked={filterRating === r}
                            onChange={() => setFilterRating(r)}
                          />
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-current" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">{r}+ {t('booking.listing.filters.stars')}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">

            {/* Search + Sort bar */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-5 flex flex-col sm:flex-row gap-3 items-center transition-colors">
              <div className="relative flex-1 w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-xl text-sm focus:ring-cyan-400 focus:border-cyan-400 outline-none"
                  placeholder={activeTab === 'doctor' ? t('booking.listing.search.doctors') : t('booking.listing.search.clinics')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {activeTab === 'doctor' && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {t('booking.listing.sort.sortBy')}:
                  </span>
                  <select
                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-xl py-2 px-3 text-sm focus:ring-cyan-400 focus:border-cyan-400 outline-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">{t('booking.listing.sort.relevance')}</option>
                    <option value="priceAsc">{t('booking.listing.sort.priceAsc')}</option>
                    <option value="priceDesc">{t('booking.listing.sort.priceDesc')}</option>
                    <option value="ratingDesc">{t('booking.listing.sort.ratingDesc')}</option>
                  </select>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-400 mb-4">
              {t('booking.listing.results.showing')}{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{activeList.length}</span>{' '}
              {t('booking.listing.results.doctors')}
            </p>

            <AnimatePresence mode="wait">
              {activeList.length > 0 ? (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {activeTab === 'doctor'
                    ? (filteredDoctors as DoctorOut[]).map((doc, idx) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <DoctorCard doc={doc} />
                        </motion.div>
                      ))
                    : (filteredClinics as ClinicOut[]).map((clinic, idx) => (
                        <motion.div
                          key={clinic.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <ClinicCard clinic={clinic} />
                        </motion.div>
                      ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-700"
                >
                  <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <SearchIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    {t('booking.listing.results.noResults')}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {t('booking.listing.results.noResultsDesc')}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-5 text-cyan-600 font-medium text-sm hover:underline"
                  >
                    {t('booking.listing.filters.clearFilters')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}