import React, { Children } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ActivityIcon,
  ScanIcon,
  ChevronRightIcon,
  ChevronLeftIcon } from
'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { DisclaimerBanner } from '../../components/shared/DisclaimerBanner';
export function DiagnoseHubPage() {
  const { t, locale, isRTL } = useLanguage();
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8">
        
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          className="text-center max-w-2xl mx-auto mt-4 mb-12">
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('diagnose.hub.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{t('diagnose.hub.subtitle')}</p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Diabetes Card */}
          <motion.div variants={itemVariants}>
            <Link
              to={`/${locale}/diagnose/diabetes`}
              className="block h-full bg-white dark:bg-slate-900 rounded-card shadow-sm border border-gray-100 dark:border-slate-800 hover:border-primary/30 hover:shadow-md transition-all group overflow-hidden">
              
              <div className="h-2 bg-primary w-full"></div>
              <div className="p-6 md:p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ActivityIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('diagnose.hub.diabetesTitle')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 min-h-[48px]">
                  {t('diagnose.hub.diabetesDesc')}
                </p>
                <div className="flex items-center text-primary font-medium">
                  {t('dashboard.quickActions.diagnose')}
                  {isRTL ?
                  <ChevronLeftIcon className="h-5 w-5 ms-2 group-hover:-translate-x-1 transition-transform" /> :

                  <ChevronRightIcon className="h-5 w-5 ms-2 group-hover:translate-x-1 transition-transform" />
                  }
                </div>
              </div>
            </Link>
          </motion.div>

          {/* X-Ray Card */}
          <motion.div variants={itemVariants}>
            <Link
              to={`/${locale}/diagnose/xray`}
              className="block h-full bg-white dark:bg-slate-900 rounded-card shadow-sm border border-gray-100 dark:border-slate-800 hover:border-secondary/30 hover:shadow-md transition-all group overflow-hidden">
              
              <div className="h-2 bg-secondary w-full"></div>
              <div className="p-6 md:p-8">
                <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ScanIcon className="h-8 w-8 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('diagnose.hub.xrayTitle')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 min-h-[48px]">
                  {t('diagnose.hub.xrayDesc')}
                </p>
                <div className="flex items-center text-secondary font-medium">
                  {t('dashboard.quickActions.diagnose')}
                  {isRTL ?
                  <ChevronLeftIcon className="h-5 w-5 ms-2 group-hover:-translate-x-1 transition-transform" /> :

                  <ChevronRightIcon className="h-5 w-5 ms-2 group-hover:translate-x-1 transition-transform" />
                  }
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* How It Works */}
        <motion.div variants={itemVariants} className="mt-16 mb-12">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('diagnose.hub.howItWorks')}
          </h3>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-0.5 bg-gray-100 dark:bg-slate-800 -z-10"></div>

            {[
            {
              step: t('diagnose.hub.step1'),
              num: '1'
            },
            {
              step: t('diagnose.hub.step2'),
              num: '2'
            },
            {
              step: t('diagnose.hub.step3'),
              num: '3'
            }].
            map((item, i) =>
            <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-2 border-primary text-primary font-bold flex items-center justify-center text-lg mb-4 shadow-sm">
                  {item.num}
                </div>
                <p className="font-medium text-gray-800 dark:text-gray-300">{item.step}</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <DisclaimerBanner />
        </motion.div>
      </motion.div>
    </div>);

}