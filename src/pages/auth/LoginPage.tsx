import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeOffIcon, AlertCircleIcon, ArrowLeftIcon } from 'lucide-react'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { useAuthStore } from '../../lib/store/authStore'
import { authApi } from '../../lib/api/authApi'
import { handleFirebasePasswordReset } from '../../lib/firebaseAuth'
import { motion, AnimatePresence } from 'framer-motion'


function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
    </svg>
  )
}

export function LoginPage() {
  const { t, locale, isRTL } = useLanguage()
  const navigate = useNavigate()
  const { login, setError: setStoreError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSuccessMsg, setResetSuccessMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError(t('common.required'))
      return
    }
    setIsLoading(true)
    try {
      const response = await authApi.login({
        email,
        password,
      })
      login(response.user, response.access_token)
      navigate(`/${locale}/dashboard`)
    } catch (err) {
      let errorMessage = 'Login failed'
      if (err instanceof Error) errorMessage = err.message
      else if (typeof err === 'string') errorMessage = err
      setError(errorMessage)
      setStoreError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResetSuccessMsg('')

    if (!forgotEmail) {
      setError(t('common.required'))
      return
    }

    setIsLoading(true)
    try {
      const result = await handleFirebasePasswordReset(forgotEmail)
      if (result.success) {
        setResetSuccessMsg(t('auth.login.resetLinkSent'))
        // Reset form after 3 seconds
        setTimeout(() => {
          setShowForgotPassword(false)
          setForgotEmail('')
          setResetSuccessMsg('')
        }, 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      let errorMessage = t('common.error')
      if (err instanceof Error) errorMessage = err.message
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e8edf4] dark:bg-slate-950 flex flex-col md:items-center md:justify-center relative overflow-hidden transition-colors duration-300">
      {/* Mobile Header Wave */}
      <div className="md:hidden w-full relative">
        <div className="w-full h-52 bg-gradient-to-br from-cyan-600 via-cyan-500 to-cyan-400 relative overflow-hidden">
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 400 80"
            preserveAspectRatio="none"
          >
            <path d="M0,40 C100,80 300,0 400,40 L400,80 L0,80 Z" className="fill-white dark:fill-slate-900 transition-colors" />
          </svg>
        </div>
      </div>

      {/* Desktop Card */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="w-full max-w-5xl mx-auto md:rounded-3xl md:shadow-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 overflow-hidden relative flex-1 md:flex-none transition-colors"
      >
        {/* Topographic pattern overlay on desktop */}
        <div className="hidden md:block absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none">
            {[...Array(12)].map((_, i) => (
              <path
                key={i}
                d={`M${200 + i * 15},${50 + i * 10} Q${300 + i * 10},${100 + i * 15} ${350 + i * 5},${200 + i * 10} T${300 - i * 5},${350 - i * 10}`}
                stroke="#94a3b8"
                strokeWidth="1"
                fill="none"
              />
            ))}
          </svg>
        </div>

        <div className="flex flex-col md:flex-row md:min-h-[560px]">
          {/* Left side - Doctor with blob shapes (desktop only) */}
          <div className="hidden md:flex md:w-[50%] relative items-end justify-center overflow-visible  bg-transparent p-8">
            {/* Blob shapes */}
            <div className="absolute top-[10%] left-[10%] w-[280px] h-[280px] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-to-br from-cyan-300 to-cyan-400 opacity-70"></div>
            <div className="absolute top-[25%] left-[30%] w-[220px] h-[240px] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-gradient-to-br from-emerald-300 to-teal-300 opacity-50"></div>
            <div className="absolute bottom-[15%] left-[5%] w-[140px] h-[140px] rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-br from-rose-300 to-pink-300 opacity-50"></div>
            <div className="absolute top-[5%] right-[15%] w-[100px] h-[100px] rounded-full bg-gradient-to-br from-rose-200 to-pink-200 opacity-40"></div>

            {/* Decorative sparkles */}
            <SparkleIcon className="absolute top-[12%] right-[25%] w-5 h-5 text-blue-900 opacity-60" />
            <SparkleIcon className="absolute bottom-[30%] left-[8%] w-4 h-4 text-blue-900 opacity-40" />
            <SparkleIcon className="absolute top-[50%] right-[10%] w-3 h-3 text-blue-900 opacity-30" />

            {/* Small decorative circles */}
            <div className="absolute top-[8%] right-[10%] w-8 h-8 rounded-full border-2 border-rose-300 opacity-50"></div>
            <div className="absolute bottom-[20%] right-[20%] w-5 h-5 rounded-full border-2 border-rose-300 opacity-40"></div>

            {/* SMAP logo */}
            <div
              className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} flex items-center gap-1.5 z-20`}
            >
              <span className="text-cyan-700 text-lg font-bold tracking-tight">
                SMAP
              </span>
            </div>

            {/* Doctor image */}
            <img
              src="/Picsart_26-04-20_03-01-24-605.png"
              alt="Doctor"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10
              w-[120%] max-w-[900px] md:w-[100%] lg:w-[100%]
              object-contain pointer-events-none drop-shadow-2xl"
            />
          </div>

          {/* Right side - Form */}
            <div className={`flex-1 px-6 py-6 md:px-12 md:py-10 flex flex-col justify-center ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {t('auth.login.title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                {t('auth.login.subtitle')}
              </p>
            </div>


            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex gap-2 items-start"
              >
                <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {!showForgotPassword ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('auth.login.email')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/20 outline-none transition-all bg-slate-50 dark:bg-slate-800 text-sm dark:text-white"
                      placeholder={t('auth.login.email')}
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('auth.login.password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all bg-slate-50 dark:bg-slate-800 text-sm dark:text-white pr-11"
                        placeholder={t('auth.login.password')}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200 mt-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      t('auth.login.submit')
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="forgot-password"
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-4"
                >
                  {resetSuccessMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex gap-2 items-start"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>{resetSuccessMsg}</span>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      {t('auth.login.email')}
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all bg-slate-50 text-sm"
                      placeholder={t('auth.login.email')}
                      dir="ltr"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">
                      {t('auth.login.resetLinkDesc')}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || resetSuccessMsg !== ''}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200 mt-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      t('auth.login.sendResetLink')
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {showForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false)
                  setError('')
                }}
                className="mt-4 flex items-center justify-center gap-2 w-full text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeftIcon className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                {t('auth.login.backToLogin')}
              </button>
            )}

            {!showForgotPassword && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true)
                    setError('')
                  }}
                  className="mt-3 w-full text-center text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold transition-colors"
                >
                  {t('auth.login.forgotPassword')}
                </button>

                <div className="mt-6 text-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t('auth.login.noAccount')} </span>
                  <Link
                    to={`/${locale}/register`}
                    className="font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                  >
                    {t('auth.login.registerLink')}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
