import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  EyeIcon, EyeOffIcon, AlertCircleIcon, ArrowRightIcon, ArrowLeftIcon, StethoscopeIcon, BuildingIcon, LogInIcon
} from 'lucide-react'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { useAuthStore } from '../../lib/store/authStore'
import { authApi } from '../../lib/api/authApi'
import { fetchApi } from '../../lib/api/apiClient'
import { motion, AnimatePresence } from 'framer-motion'

interface Specialization { id: string; name_en: string; name_ar: string }

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
    </svg>
  )
}

export function JoinPage() {
  const { locale, isRTL, setLocale } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, setError: setStoreError } = useAuthStore()
  
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [tab, setTab] = useState<'doctor' | 'clinic'>('doctor')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [specializations, setSpecializations] = useState<Specialization[]>([])

  const [loginData, setLoginData] = useState({ email: '', password: '' })

  useEffect(() => {
    fetchApi('/specializations/')
      .then(r => r.json())
      .then(data => setSpecializations(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const [doc, setDoc] = useState({
    full_name: '', email: '', phone: '', password: '', confirmPassword: '',
    language_preference: locale === 'ar' ? 'ar' : 'en',
    specialization_id: '', language_spoken: 'both' as 'en' | 'ar' | 'both',
    bio_en: '', bio_ar: '', consultation_price_egp: '', years_of_experience: '', license_number: '',
  })

  const [cli, setCli] = useState({
    full_name: '', email: '', phone: '', password: '', confirmPassword: '',
    language_preference: locale === 'ar' ? 'ar' : 'en',
    clinic_name: '', clinic_address: '', clinic_phone: '', clinic_email: '', clinic_location: '',
  })

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setDoc({ ...doc, [e.target.name]: e.target.value })
    if (e.target.name === 'language_preference') {
      const newLocale = e.target.value as 'en' | 'ar';
      setLocale(newLocale);
      const pathParts = location.pathname.split('/');
      if (pathParts[1] === 'en' || pathParts[1] === 'ar') {
        pathParts[1] = newLocale;
        navigate(pathParts.join('/') + location.search, { replace: true });
      }
    }
  }
  const handleCliChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCli({ ...cli, [e.target.name]: e.target.value })
    if (e.target.name === 'language_preference') {
      const newLocale = e.target.value as 'en' | 'ar';
      setLocale(newLocale);
      const pathParts = location.pathname.split('/');
      if (pathParts[1] === 'en' || pathParts[1] === 'ar') {
        pathParts[1] = newLocale;
        navigate(pathParts.join('/') + location.search, { replace: true });
      }
    }
  }
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => setLoginData({ ...loginData, [e.target.name]: e.target.value })

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!loginData.email || !loginData.password) {
      setError(isRTL ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password')
      return
    }
    setIsLoading(true)
    try {
      const response = await authApi.login(loginData)
      login(response.user)
      navigate(`/${locale}/dashboard`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg); setStoreError(msg)
    } finally { setIsLoading(false) }
  }

  const validateStep1 = () => {
    const f = tab === 'doctor' ? doc : cli
    if (!f.full_name || !f.email || !f.phone || !f.password || !f.confirmPassword) {
      setError(isRTL ? 'جميع الحقول الأساسية مطلوبة' : 'All required fields must be filled')
      return false
    }
    if (f.password.length < 6) {
      setError(isRTL ? 'كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters')
      return false
    }
    if (f.password !== f.confirmPassword) {
      setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setError('')
    if (validateStep1()) setStep(2)
  }

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const payload: any = {
        full_name: doc.full_name, email: doc.email, phone: doc.phone, password: doc.password,
        language_preference: doc.language_preference, language_spoken: doc.language_spoken,
      }
      if (doc.specialization_id) payload.specialization_id = doc.specialization_id
      if (doc.bio_en) payload.bio_en = doc.bio_en
      if (doc.bio_ar) payload.bio_ar = doc.bio_ar
      if (doc.license_number) payload.license_number = doc.license_number
      if (doc.consultation_price_egp) payload.consultation_price_egp = parseFloat(doc.consultation_price_egp)
      if (doc.years_of_experience) payload.years_of_experience = parseInt(doc.years_of_experience)

      const response = await authApi.registerDoctor(payload)
      login(response)
      navigate(`/${locale}/dashboard`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setError(msg); setStoreError(msg)
    } finally { setIsLoading(false) }
  }

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!cli.clinic_name || !cli.clinic_address || !cli.clinic_email) {
      setError(isRTL ? 'بيانات العيادة مطلوبة' : 'Clinic details are required')
      return
    }
    setIsLoading(true)
    try {
      const payload = {
        full_name: cli.full_name, email: cli.email, phone: cli.phone, password: cli.password,
        language_preference: cli.language_preference,
        clinic: {
          name: cli.clinic_name, address: cli.clinic_address, phone: cli.clinic_phone || cli.phone,
          email: cli.clinic_email, location: cli.clinic_location || undefined,
        },
      }
      const response = await authApi.registerClinic(payload)
      login(response)
      navigate(`/${locale}/dashboard`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setError(msg); setStoreError(msg)
    } finally { setIsLoading(false) }
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/20 outline-none transition-all bg-slate-50 dark:bg-slate-800 text-sm dark:text-white'
  const labelClass = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5'

  return (
    <div className="min-h-screen bg-[#e8edf4] dark:bg-slate-950 flex flex-col md:items-center md:justify-center relative overflow-hidden transition-colors duration-300">
      <div className="md:hidden w-full relative">
        <div className="w-full h-52 bg-gradient-to-br from-cyan-600 via-cyan-500 to-cyan-400 relative overflow-hidden">
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 80" preserveAspectRatio="none">
            <path d="M0,40 C100,80 300,0 400,40 L400,80 L0,80 Z" className="fill-white dark:fill-slate-900 transition-colors" />
          </svg>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl mx-auto md:rounded-3xl md:shadow-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 overflow-hidden relative flex-1 md:flex-none transition-colors"
      >
        <div className="flex flex-col md:flex-row md:min-h-[600px]">
          <div className="hidden md:flex md:w-[45%] relative items-end justify-center overflow-hidden bg-transparent p-8">
            <div className="absolute top-[10%] left-[10%] w-[320px] h-[320px] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-to-br from-cyan-300 to-cyan-400 opacity-70" />
            <div className="absolute top-[25%] left-[30%] w-[250px] h-[280px] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-gradient-to-br from-emerald-300 to-teal-300 opacity-50" />
            <div className="absolute bottom-[15%] left-[5%] w-[160px] h-[160px] rounded-full bg-gradient-to-br from-rose-300 to-pink-300 opacity-50" />
            <SparkleIcon className="absolute top-[12%] right-[25%] w-5 h-5 text-blue-900 opacity-60" />
            <SparkleIcon className="absolute bottom-[30%] left-[8%] w-4 h-4 text-blue-900 opacity-40" />
            <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} flex items-center gap-1.5 z-20`}>
              <span className="text-cyan-700 text-lg font-bold tracking-tight">SMAP</span>
            </div>
            <img
              src="/Picsart_26-04-20_03-07-45-358.png"
              alt="Doctor"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-[120%] max-w-[900px] object-contain pointer-events-none drop-shadow-2xl"
            />
          </div>

            <div className={`flex-1 px-6 py-6 md:px-12 md:py-10 flex flex-col justify-center relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="mb-6 flex gap-4 relative z-20">
              <button 
                type="button"
                onClick={() => { setMode('login'); setError('') }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border relative z-20 ${mode === 'login' ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
              >
                {isRTL ? 'تسجيل الدخول' : 'Sign In'}
              </button>
              <button 
                type="button"
                onClick={() => { setMode('signup'); setStep(1); setError('') }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border relative z-20 ${mode === 'signup' ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
              >
                {isRTL ? 'حساب جديد' : 'Sign Up'}
              </button>
            </div>

            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {mode === 'login' 
                  ? (isRTL ? 'دخول المتخصصين' : 'Professional Login')
                  : (isRTL ? 'إنشاء حساب مهني' : 'Professional Account')
                }
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                {isRTL ? 'انضم كمحترف صحي اليوم' : 'Join as a Healthcare Professional today'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex gap-2 items-start"
              >
                <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className={labelClass}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} className={inputClass} placeholder="doctor@example.com" dir="ltr" />
                  </div>
                  <div>
                    <label className={labelClass}>{isRTL ? 'كلمة المرور' : 'Password'}</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} name="password" value={loginData.password} onChange={handleLoginChange} className={`${inputClass} pr-11`} placeholder="••••••••" dir="ltr" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-100 flex items-center justify-center gap-2">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogInIcon className="w-5 h-5" /> {isRTL ? 'دخول' : 'Sign In'}</>}
                  </button>
                </motion.form>
              ) : (
                <div key="signup-container">
                  <div className="mb-5 flex items-center gap-3">
                    <div className={`flex-1 h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {isRTL ? `الخطوة ${step} من 2` : `Step ${step} of 2`}
                    </span>
                    <div className={`flex-1 h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                  </div>

                  <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6 transition-colors">
                    <button
                      type="button"
                      onClick={() => { setTab('doctor'); setStep(1); setError('') }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${tab === 'doctor' ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                      <StethoscopeIcon className="w-4 h-4" />
                      {isRTL ? 'طبيب' : 'Doctor'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTab('clinic'); setStep(1); setError('') }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${tab === 'clinic' ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                      <BuildingIcon className="w-4 h-4" />
                      {isRTL ? 'عيادة' : 'Clinic'}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>{isRTL ? 'الاسم الكامل' : 'Full Name'}</label>
                            <input type="text" name="full_name" value={tab === 'doctor' ? doc.full_name : cli.full_name} onChange={tab === 'doctor' ? handleDocChange : handleCliChange} className={inputClass} placeholder={isRTL ? 'د. أحمد محمد' : 'Dr. John Doe'} />
                          </div>
                          <div>
                            <label className={labelClass}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                            <input type="email" name="email" value={tab === 'doctor' ? doc.email : cli.email} onChange={tab === 'doctor' ? handleDocChange : handleCliChange} className={inputClass} placeholder="john@example.com" dir="ltr" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>{isRTL ? 'رقم الهاتف' : 'Phone'}</label>
                            <input type="tel" name="phone" value={tab === 'doctor' ? doc.phone : cli.phone} onChange={tab === 'doctor' ? handleDocChange : handleCliChange} className={inputClass} placeholder="01012345678" dir="ltr" />
                          </div>
                          <div>
                            <label className={labelClass}>{isRTL ? 'تفضيل اللغة' : 'Language'}</label>
                            <select name="language_preference" value={tab === 'doctor' ? doc.language_preference : cli.language_preference} onChange={tab === 'doctor' ? handleDocChange : handleCliChange} className={inputClass}>
                              <option value="en">English</option>
                              <option value="ar">العربية</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>{isRTL ? 'كلمة المرور' : 'Password'}</label>
                            <div className="relative">
                              <input type={showPassword ? 'text' : 'password'} name="password" value={tab === 'doctor' ? doc.password : cli.password} onChange={tab === 'doctor' ? handleDocChange : handleCliChange} className={`${inputClass} pr-11`} placeholder="••••••••" dir="ltr" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className={labelClass}>{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                            <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={tab === 'doctor' ? doc.confirmPassword : cli.confirmPassword} onChange={tab === 'doctor' ? handleDocChange : handleCliChange} className={inputClass} placeholder="••••••••" dir="ltr" />
                          </div>
                        </div>
                        <button type="button" onClick={handleNextStep} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-100">
                          {isRTL ? 'التالي' : 'Next'} <ArrowRightIcon className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      >
                        {tab === 'doctor' ? (
                          <form onSubmit={handleDoctorSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={labelClass}>{isRTL ? 'التخصص' : 'Specialization'}</label>
                                <select name="specialization_id" value={doc.specialization_id} onChange={handleDocChange} className={inputClass}>
                                  <option value="">{isRTL ? 'اختر التخصص' : 'Select specialization'}</option>
                                  {specializations.map(s => <option key={s.id} value={s.id}>{isRTL ? s.name_ar : s.name_en}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className={labelClass}>{isRTL ? 'لغة التحدث' : 'Language Spoken'}</label>
                                <select name="language_spoken" value={doc.language_spoken} onChange={handleDocChange} className={inputClass}>
                                  <option value="en">English only</option>
                                  <option value="ar">Arabic only</option>
                                  <option value="both">Both</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={labelClass}>{isRTL ? 'رقم الترخيص' : 'License Number'}</label>
                                <input type="text" name="license_number" value={doc.license_number} onChange={handleDocChange} className={inputClass} dir="ltr" />
                              </div>
                              <div>
                                <label className={labelClass}>{isRTL ? 'سنوات الخبرة' : 'Years of Experience'}</label>
                                <input type="number" name="years_of_experience" value={doc.years_of_experience} onChange={handleDocChange} className={inputClass} dir="ltr" />
                              </div>
                            </div>
                            <div>
                              <label className={labelClass}>{isRTL ? 'سعر الاستشارة (جنيه)' : 'Consultation Price (EGP)'}</label>
                              <input type="number" name="consultation_price_egp" value={doc.consultation_price_egp} onChange={handleDocChange} className={inputClass} dir="ltr" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={labelClass}>{isRTL ? 'نبذة بالإنجليزية' : 'Bio (English)'}</label>
                                <textarea name="bio_en" value={doc.bio_en} onChange={handleDocChange} className={`${inputClass} resize-none`} rows={2} />
                              </div>
                              <div>
                                <label className={labelClass}>{isRTL ? 'نبذة بالعربية' : 'Bio (Arabic)'}</label>
                                <textarea name="bio_ar" value={doc.bio_ar} onChange={handleDocChange} className={`${inputClass} resize-none`} rows={2} dir="rtl" />
                              </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                              <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
                                <ArrowLeftIcon className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} /> {isRTL ? 'السابق' : 'Back'}
                              </button>
                              <button type="submit" disabled={isLoading} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-100 disabled:opacity-70">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (isRTL ? 'إنشاء حساب' : 'Create Account')}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <form onSubmit={handleClinicSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={labelClass}>{isRTL ? 'اسم العيادة' : 'Clinic Name'}</label>
                                <input type="text" name="clinic_name" value={cli.clinic_name} onChange={handleCliChange} className={inputClass} required />
                              </div>
                              <div>
                                <label className={labelClass}>{isRTL ? 'البريد الإلكتروني للعيادة' : 'Clinic Email'}</label>
                                <input type="email" name="clinic_email" value={cli.clinic_email} onChange={handleCliChange} className={inputClass} dir="ltr" required />
                              </div>
                            </div>
                            <div>
                              <label className={labelClass}>{isRTL ? 'العنوان' : 'Address'}</label>
                              <input type="text" name="clinic_address" value={cli.clinic_address} onChange={handleCliChange} className={inputClass} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={labelClass}>{isRTL ? 'هاتف العيادة' : 'Clinic Phone'}</label>
                                <input type="tel" name="clinic_phone" value={cli.clinic_phone} onChange={handleCliChange} className={inputClass} dir="ltr" />
                              </div>
                              <div>
                                <label className={labelClass}>{isRTL ? 'الموقع الجغرافي' : 'Location (lat,lng)'}</label>
                                <input type="text" name="clinic_location" value={cli.clinic_location} onChange={handleCliChange} className={inputClass} dir="ltr" />
                              </div>
                            </div>
                            <div className="flex gap-3 pt-2 mt-8">
                              <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
                                <ArrowLeftIcon className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} /> {isRTL ? 'السابق' : 'Back'}
                              </button>
                              <button type="submit" disabled={isLoading} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-100 disabled:opacity-70">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (isRTL ? 'إنشاء الحساب' : 'Create Account')}
                              </button>
                            </div>
                          </form>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </AnimatePresence>
            <div className="mt-8 text-center text-sm border-t border-slate-100 dark:border-slate-800 pt-6 transition-colors">
              <span className="text-slate-500 dark:text-slate-400">{isRTL ? 'مريض؟ ' : 'Are you a Patient? '}</span>
              <button onClick={() => navigate(`/${locale}/login`)} className="font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
                {isRTL ? 'سجّل دخول كمرضى هنا' : 'Patient Login here'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
