import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Calendar, FileText } from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Brain,
      titleKey: 'landing.features.aiDiagnosis.title',
      descKey: 'landing.features.aiDiagnosis.desc',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30'
    },
    {
      icon: MessageSquare,
      titleKey: 'landing.features.smartChatbot.title',
      descKey: 'landing.features.smartChatbot.desc',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/30'
    },
    {
      icon: Calendar,
      titleKey: 'landing.features.instantBooking.title',
      descKey: 'landing.features.instantBooking.desc',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30'
    },
    {
      icon: FileText,
      titleKey: 'landing.features.healthRecords.title',
      descKey: 'landing.features.healthRecords.desc',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/30'
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
          >
            {t('landing.features.title')}
          </motion.h2>
          <motion.p
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              delay: 0.1
            }}
            className="text-lg text-slate-600 dark:text-slate-400"
          >
            {t('landing.features.subtitle')}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 20
              }}
              whileInView={{
                opacity: 1,
                y: 0
              }}
              viewport={{
                once: true
              }}
              transition={{
                delay: index * 0.1
              }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-50 dark:border-slate-800 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 transition-colors`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {t(feature.titleKey)}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {t(feature.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
