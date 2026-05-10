import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, AlertTriangleIcon } from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';

interface XrayResultCardProps {
  topPrediction: string;
  confidence: string;
  allResults: {
    label: string;
    score: number;
  }[];
}

export function XrayResultCard({ topPrediction, confidence, allResults }: XrayResultCardProps) {
  const { t, isRTL } = useLanguage();

  const isNormal = topPrediction.toLowerCase() === 'normal';
  const confidenceValue = parseFloat(confidence.replace('%', ''));
  
  const colors = isNormal
    ? {
        bg: 'bg-green-50 dark:bg-green-900/10',
        border: 'border-green-200 dark:border-green-900/20',
        text: 'text-green-700 dark:text-green-400',
        bar: 'bg-gradient-to-r from-green-400 to-green-500'
      }
    : {
        bg: 'bg-amber-50 dark:bg-amber-900/10',
        border: 'border-amber-200 dark:border-amber-900/20',
        text: 'text-amber-700 dark:text-amber-400',
        bar: 'bg-gradient-to-r from-amber-400 to-amber-500'
      };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className={`rounded-xl border-2 p-6 ${colors.bg} ${colors.border} shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {isNormal ? (
          <CheckCircleIcon className="h-8 w-8 text-green-500" />
        ) : (
          <AlertTriangleIcon className="h-8 w-8 text-amber-500" />
        )}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">
            {t('diagnose.xray.result.title')}
          </h3>
          <p className={`text-xl font-black ${colors.text}`}>
            {t(`diagnose.xray.result.findings.${topPrediction}`) || topPrediction.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-6 bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-white/50 dark:border-slate-700/50 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-tighter">
            {t('diagnose.xray.result.primaryConfidence')}
          </label>
          <span className={`text-lg font-black ${colors.text}`}>
            {confidence}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden border border-gray-100 dark:border-slate-600">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidenceValue}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={`h-full rounded-full ${colors.bar}`}
          />
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {isRTL ? 'جميع النتائج' : 'All Findings'}
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {allResults.slice(0, 8).map((result, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white/40 dark:bg-slate-800/40 p-2 rounded-lg border border-white/40 dark:border-slate-700/40 text-xs">
              <span className="font-bold text-gray-700 dark:text-slate-300">
                {t(`diagnose.xray.result.findings.${result.label}`) || result.label.replace(/_/g, ' ')}
              </span>
              <span className="font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                {Math.round(result.score * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-slate-700/50 text-[10px] text-gray-500 dark:text-slate-500 font-medium leading-relaxed italic transition-colors">
        {isNormal ? (
          <p>
            {isRTL 
              ? 'تحليل الأشعة لا يظهر أي علامات مرضية واضحة. يرجى دائماً استشارة طبيب متخصص.'
              : 'The X-ray analysis shows no significant abnormalities detected. However, always consult with a radiologist for professional interpretation.'}
          </p>
        ) : (
          <p>
            {isRTL 
              ? 'اكتشف التحليل علامات مرضية محتملة. يرجى استشارة أخصائي الرعاية الصحية للحصول على تشخيص دقيق.'
              : 'The analysis detected potential abnormalities. Please consult a healthcare professional for proper diagnosis and treatment recommendations.'}
          </p>
        )}
      </div>
    </motion.div>
  );
}
