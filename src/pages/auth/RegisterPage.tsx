import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UserIcon,
} from 'lucide-react'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { useAuthStore } from '../../lib/store/authStore'
import { authApi } from '../../lib/api/authApi'
import { motion, AnimatePresence } from 'framer-motion'

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
    </svg>
  )
}

export function RegisterPage() {
  const { locale, isRTL, setLocale } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, setError: setStoreError } = useAuthStore()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    language_preference: locale === 'ar' ? 'ar' : 'en',
    // Step 2 - health profile (optional)
    date_of_birth: '',
    gender: 'male',
    blood_type: '',
    height_cm: '',
    weight_kg: '',
    known_allergies: '',
    chronic_conditions: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value })
    if (name === 'language_preference') {
      const newLocale = value as 'en' | 'ar';
      setLocale(newLocale);
      const pathParts = location.pathname.split('/');
      if (pathParts[1] === 'en' || pathParts[1] === 'ar') {
        pathParts[1] = newLocale;
        navigate(pathParts.join('/') + location.search, { replace: true });
      }
    }
  }

  const validateStep1 = () => {
    if (!formData.full_name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
      setError(isRTL ? 'جميع الحقول مطلوبة' : 'All fields are required')
      return false
    }
    if (formData.password.length < 6) {
      setError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setError('')
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const payload: any = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        language_preference: formData.language_preference,
      }

      // Only add profile if any optional field is filled
      const hasProfile = formData.date_of_birth || formData.blood_type || formData.height_cm || formData.weight_kg
      if (hasProfile) {
        payload.profile = {
          date_of_birth: formData.date_of_birth || undefined,
          gender: formData.gender,
          blood_type: formData.blood_type || undefined,
          height_cm: formData.height_cm ? parseFloat(formData.height_cm) : undefined,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
          known_allergies: formData.known_allergies || undefined,
          chronic_conditions: formData.chronic_conditions || undefined,
          emergency_contact_name: formData.emergency_contact_name || undefined,
          emergency_contact_phone: formData.emergency_contact_phone || undefined,
        }
      }

      const response = await authApi.registerUser(payload)

      login({
        uuid: response.uuid,
        email: response.email,
        full_name: response.full_name,
        phone: response.phone,
        role: response.role,
        is_active: response.is_active,
      })

      navigate(`/${locale}/dashboard`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setError(msg)
      setStoreError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/20 outline-none transition-all bg-slate-50 dark:bg-slate-800 text-sm dark:text-white'
  const labelClass = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5'

  return (
    <div className="min-h-screen bg-[#e8edf4] dark:bg-slate-950 flex flex-col md:items-center md:justify-center relative overflow-hidden transition-colors duration-300">
      {/* Mobile Header */}
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
        <div className="flex flex-col md:flex-row md:min-h-[560px]">
          {/* Left panel */}
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

          {/* Right panel - Form */}
            <div className={`flex-1 px-6 py-6 md:px-12 md:py-10 flex flex-col justify-center ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="mb-4">
              {/* Role badge */}
              <div className="inline-flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/30 rounded-full px-3 py-1 mb-4 transition-colors">
                <UserIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">{isRTL ? 'حساب مريض' : 'Patient Account'}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {isRTL ? 'إنشاء حساب جديد' : 'Create Account'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                {isRTL ? 'انضم إلينا وابدأ رحلتك الصحية' : 'Join us and start your healthcare journey'}
              </p>
            </div>

            {/* Step indicator */}
            <div className="mb-5 flex items-center gap-3">
              <div className={`flex-1 h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-cyan-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {isRTL ? `الخطوة ${step} من 2` : `Step ${step} of 2`}
              </span>
              <div className={`flex-1 h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-cyan-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
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
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{isRTL ? 'الاسم الكامل' : 'Full Name'}</label>
                      <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className={inputClass} placeholder={isRTL ? 'أحمد محمد' : 'John Doe'} />
                    </div>
                    <div>
                      <label className={labelClass}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="john@example.com" dir="ltr" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{isRTL ? 'رقم الهاتف' : 'Phone'}</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="01012345678" dir="ltr" />
                    </div>
                    <div>
                      <label className={labelClass}>{isRTL ? 'تفضيل اللغة' : 'Language'}</label>
                      <select name="language_preference" value={formData.language_preference} onChange={handleChange} className={inputClass}>
                        <option value="en">{isRTL ? 'الإنجليزية' : 'English'}</option>
                        <option value="ar">{isRTL ? 'العربية' : 'Arabic'}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{isRTL ? 'كلمة المرور' : 'Password'}</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className={`${inputClass} pr-11`} placeholder="••••••••" dir="ltr" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`${inputClass} pr-11`} placeholder="••••••••" dir="ltr" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={handleNextStep} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 mt-2">
                    {isRTL ? 'التالي' : 'Next'}
                    <ArrowRightIcon className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-400 italic">{isRTL ? '(اختياري) أضف بياناتك الصحية لتجربة أفضل' : '(Optional) Add your health data for a better experience'}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}</label>
                      <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={inputClass} dir="ltr" />
                    </div>
                    <div>
                      <label className={labelClass}>{isRTL ? 'الجنس' : 'Gender'}</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                        <option value="male">{isRTL ? 'ذكر' : 'Male'}</option>
                        <option value="female">{isRTL ? 'أنثى' : 'Female'}</option>
                        <option value="other">{isRTL ? 'آخر' : 'Other'}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{isRTL ? 'فصيلة الدم' : 'Blood Type'}</label>
                      <select name="blood_type" value={formData.blood_type} onChange={handleChange} className={inputClass}>
                        <option value="">{isRTL ? 'اختر' : 'Select'}</option>
                        {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{isRTL ? 'الطول (سم)' : 'Height (cm)'}</label>
                      <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} className={inputClass} placeholder="178" dir="ltr" />
                    </div>
                    <div>
                      <label className={labelClass}>{isRTL ? 'الوزن (كجم)' : 'Weight (kg)'}</label>
                      <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} className={inputClass} placeholder="75" dir="ltr" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{isRTL ? 'الحساسيات المعروفة' : 'Known Allergies'}</label>
                      <input type="text" name="known_allergies" value={formData.known_allergies} onChange={handleChange} className={inputClass} placeholder={isRTL ? 'مثال: البنسلين' : 'e.g. Penicillin'} />
                    </div>
                    <div>
                      <label className={labelClass}>{isRTL ? 'الأمراض المزمنة' : 'Chronic Conditions'}</label>
                      <input type="text" name="chronic_conditions" value={formData.chronic_conditions} onChange={handleChange} className={inputClass} placeholder={isRTL ? 'مثال: السكري' : 'e.g. Diabetes'} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{isRTL ? 'جهة الاتصال الطارئة' : 'Emergency Contact Name'}</label>
                      <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className={inputClass} placeholder={isRTL ? 'أحمد محمد' : 'Jane Doe'} />
                    </div>
                    <div>
                      <label className={labelClass}>{isRTL ? 'هاتف الاتصال الطارئة' : 'Emergency Contact Phone'}</label>
                      <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} className={inputClass} placeholder="01012345678" dir="ltr" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                      <ArrowLeftIcon className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                      {isRTL ? 'السابق' : 'Back'}
                    </button>
                    <button type="submit" disabled={isLoading} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-cyan-200">
                      {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isRTL ? 'إنشاء الحساب' : 'Create Account')}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-5 text-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">{isRTL ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}</span>
              <button onClick={() => navigate(`/${locale}/login`)} className="font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
                {isRTL ? 'تسجيل الدخول' : 'Sign in'}
              </button>
            </div>
            <div className="mt-3 text-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">{isRTL ? 'طبيب أو عيادة؟ ' : 'Doctor or Clinic? '}</span>
              <button onClick={() => navigate(`/${locale}/join`)} className="font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
                {isRTL ? 'انضم هنا' : 'Join here'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
