import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, AlertTriangleIcon, AlertCircleIcon, TrendingUpIcon } from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';

interface DiabetesResultCardProps {
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  glucose?: number;
  bmi?: number;
}

export function DiabetesResultCard({ riskLevel, confidence, glucose, bmi }: DiabetesResultCardProps) {
  const { t } = useLanguage();

  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    const iconProps = "h-8 w-8";
    switch (level) {
      case 'low':
        return <CheckCircleIcon className={`${iconProps} text-green-500`} />;
      case 'medium':
        return <AlertTriangleIcon className={`${iconProps} text-amber-500`} />;
      case 'high':
        return <AlertCircleIcon className={`${iconProps} text-red-500`} />;
    }
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return {
          bg: 'bg-green-50 dark:bg-green-900/10',
          border: 'border-green-200 dark:border-green-900/20',
          text: 'text-green-700 dark:text-green-400',
          badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
          bar: 'bg-gradient-to-r from-green-400 to-green-500'
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/10',
          border: 'border-amber-200 dark:border-amber-900/20',
          text: 'text-amber-700 dark:text-amber-400',
          badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
          bar: 'bg-gradient-to-r from-amber-400 to-amber-500'
        };
      case 'high':
        return {
          bg: 'bg-red-50 dark:bg-red-900/10',
          border: 'border-red-200 dark:border-red-900/20',
          text: 'text-red-700 dark:text-red-400',
          badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
          bar: 'bg-gradient-to-r from-red-400 to-red-500'
        };
    }
  };

  const colors = getRiskColor(riskLevel);
  const riskText = {
    low: t('diagnose.diabetes.result.low'),
    medium: t('diagnose.diabetes.result.medium'),
    high: t('diagnose.diabetes.result.high')
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className={`rounded-xl border-2 p-6 ${colors.bg} ${colors.border}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {getRiskIcon(riskLevel)}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">
            {t('diagnose.diabetes.result.title')}
          </h3>
          <p className={`text-2xl font-bold ${colors.text}`}>
            {riskText[riskLevel]}
          </p>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {t('diagnose.confidence').replace('{value}', '')}
          </label>
          <span className={`text-lg font-bold ${colors.text}`}>
            {confidence}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={`h-full rounded-full ${colors.bar}`}
          />
        </div>
      </div>

      {/* Input Summary */}
      {glucose !== undefined && bmi !== undefined && (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600 dark:text-slate-400 uppercase mb-1">Glucose</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{glucose} mg/dL</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600 dark:text-slate-400 uppercase mb-1">BMI</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{bmi}</p>
          </div>
        </div>
      )}

      {/* Risk Badge */}
      {riskLevel === 'high' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`mt-4 p-3 rounded-lg ${colors.badge} flex items-start gap-2`}
        >
          <TrendingUpIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Action Recommended</p>
            <p className="text-xs mt-1">Please consult a healthcare professional for personalized advice.</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
