import { motion } from 'framer-motion';
import { Sparkles, Activity, Calendar, CheckCircle2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useAuthStore } from '../../lib/store/authStore';

export function HeroSection() {
  const navigate = useNavigate();
  const { locale, t } = useLanguage();

  const { user } = useAuthStore();

  const handleNavigation = (path: string) => {
    if (!user) {
      navigate(`/${locale}/login`);
    } else {
      navigate(`/${locale}${path}`);
    }
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column - 3D Heart */}
          <motion.div
            initial={{
              opacity: 0,
              x: -20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              duration: 0.6
            }}
            className="relative order-2 lg:order-1 flex justify-center items-center h-[400px] lg:h-[500px]"
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* 3D Heart Image with floating animation */}
              <motion.img
                src="/5ab8163a8c-de4fc8eb909e714d1950.png"
                alt="3D Anatomical Heart"
                className="w-full h-full object-contain drop-shadow-2xl"
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />

              {/* Floating Badge 1 */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: 0.3,
                  duration: 0.5
                }}
                className="absolute -top-6 -left-12 md:-left-20 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700 z-10 transition-colors"
              >
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('landing.hero.aiAccuracy')}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">99.8%</p>
                </div>
              </motion.div>

              {/* Floating Badge 2 */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: -20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: 0.5,
                  duration: 0.5
                }}
                className="absolute -bottom-6 -right-4 md:-right-12 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700 z-10 transition-colors"
              >
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://i.pravatar.cc/100?img=1"
                      alt="Doctor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://i.pravatar.cc/100?img=2"
                      alt="Doctor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                    <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('landing.hero.activeDoctors')}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">500+</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column - Text */}
          <motion.div
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              duration: 0.6
            }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 mb-6 transition-colors">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium text-cyan-700">
                {t('landing.hero.badge')}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
              {t('landing.hero.title')} <br />
              <span className="text-cyan-500 dark:text-cyan-400">{t('landing.hero.titleHighlight')}</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
              {t('landing.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleNavigation('/diagnose')}
                className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3.5 rounded-full font-medium transition-all shadow-lg shadow-cyan-500/30"
              >
                <Activity className="w-5 h-5" />
                {t('landing.hero.startDiagnosis')}
              </button>
              <button
                onClick={() => handleNavigation('/booking')}
                className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-6 py-3.5 rounded-full font-medium transition-all shadow-sm"
              >
                <Calendar className="w-5 h-5" />
                {t('landing.hero.bookAppointment')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
