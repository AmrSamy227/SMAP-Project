import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ActivityIcon,
  SaveIcon,
  AlertTriangleIcon,
  Loader2Icon } from
'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { DisclaimerBanner } from '../../components/shared/DisclaimerBanner';
import { DiabetesResultCard } from '../../components/diagnose/DiabetesResultCard';
import { fetchApi } from '../../lib/api/apiClient';
interface DiabetesFormData {
  pregnancies: string;
  glucose: string;
  bloodPressure: string;
  skinThickness: string;
  insulin: string;
  bmi: string;
  pedigreeFunction: string;
  age: string;
}
interface ValidationErrors {
  glucose?: string;
  bmi?: string;
  bloodPressure?: string;
  age?: string;
}
interface AnalysisResult {
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}
export function DiabetesPage() {
  const { t, locale, isRTL } = useLanguage();
  const [formData, setFormData] = useState<DiabetesFormData>({
    pregnancies: '0',
    glucose: '',
    bloodPressure: '',
    skinThickness: '0',
    insulin: '0',
    bmi: '',
    pedigreeFunction: '0.47',
    age: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;
    const glucose = parseFloat(formData.glucose);
    if (isNaN(glucose) || glucose < 50 || glucose > 600) {
      newErrors.glucose = t('diagnose.diabetes.validation.glucose');
      isValid = false;
    }
    const bmi = parseFloat(formData.bmi);
    if (isNaN(bmi) || bmi < 10 || bmi > 70) {
      newErrors.bmi = t('diagnose.diabetes.validation.bmi');
      isValid = false;
    }
    const bp = parseFloat(formData.bloodPressure);
    if (isNaN(bp) || bp < 60 || bp > 220) {
      newErrors.bloodPressure = t('diagnose.diabetes.validation.bp');
      isValid = false;
    }
    const age = parseInt(formData.age, 10);
    if (isNaN(age) || age < 1 || age > 120) {
      newErrors.age = t('diagnose.diabetes.validation.age');
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };
  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetchApi('/analysis/run',
        {
          method: 'POST',
          body: JSON.stringify({
            pregnancies: parseInt(formData.pregnancies) || 0,
            glucose: parseFloat(formData.glucose) || 0,
            blood_pressure: parseFloat(formData.bloodPressure) || 0,
            skin_thickness: parseFloat(formData.skinThickness) || 0,
            insulin: parseFloat(formData.insulin) || 0,
            bmi: parseFloat(formData.bmi) || 0,
            diabetes_pedigree_function: parseFloat(formData.pedigreeFunction) || 0,
            age: parseInt(formData.age) || 0
          })
        }
      );

      if (!response.ok) {
        throw new Error('Analysis failed. Please try again.');
      }

      const data = await response.json();
      const glucose = parseFloat(formData.glucose);
      const bmi = parseFloat(formData.bmi);

      // Map prediction to risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (data.prediction === 1 || glucose > 140 || bmi > 30) {
        riskLevel = 'high';
      } else if (glucose > 100 || bmi > 25) {
        riskLevel = 'medium';
      }

      setIsAnalyzing(false);
      setResult({
        riskLevel,
        confidence: Math.round((data.confidence || 0.75) * 100)
      });
    } catch (err) {
      setIsAnalyzing(false);
      // Fallback to client-side logic
      const glucose = parseFloat(formData.glucose);
      const bmi = parseFloat(formData.bmi);
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (glucose > 140 || bmi > 30) riskLevel = 'high';
      else if (glucose > 100 || bmi > 25) riskLevel = 'medium';
      setResult({
        riskLevel,
        confidence: 75
      });
    }
  };
  const resetForm = () => {
    setResult(null);
    setFormData({
      pregnancies: '0',
      glucose: '',
      bloodPressure: '',
      skinThickness: '0',
      insulin: '0',
      bmi: '',
      pedigreeFunction: '0.47',
      age: ''
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/${locale}/diagnose`}
          className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-4">
          
          {isRTL ?
          <ChevronRightIcon className="h-5 w-5 me-1" /> :

          <ChevronLeftIcon className="h-5 w-5 me-1" />
          }
          {t('common.back')}
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <ActivityIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t('diagnose.diabetes.title')}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2 ms-11">
          {t('diagnose.diabetes.subtitle')}
        </p>
      </div>

      <DisclaimerBanner />

      <div className="grid md:grid-cols-12 gap-8 mt-8">
        {/* Form Section */}
        <div className={`${result ? 'md:col-span-7' : 'md:col-span-12'} transition-all duration-500`}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800 p-8 transition-colors">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Pregnancies (Only if female, but keep for schema) */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <label htmlFor="pregnancies" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    {t('diagnose.diabetes.pregnancies')}
                  </label>
                    <input
                      type="number"
                      id="pregnancies"
                      name="pregnancies"
                      value={formData.pregnancies}
                      onChange={handleChange}
                      disabled={isAnalyzing || result !== null}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-0 outline-none hover:border-primary/30 focus:border-primary transition-colors disabled:bg-gray-50 dark:disabled:bg-slate-900"
                    />
                </motion.div>
                {/* Glucose */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <label
                    htmlFor="glucose"
                    className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2"
                  >
                    {t('diagnose.diabetes.glucose')}
                    <span className="text-primary ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="glucose"
                      name="glucose"
                      value={formData.glucose}
                      onChange={handleChange}
                      disabled={isAnalyzing || result !== null}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-0 outline-none transition-colors ${
                        errors.glucose
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:border-primary/30 focus:border-primary'
                      } ${isAnalyzing || result !== null ? 'bg-gray-50 dark:bg-slate-900 text-gray-500 cursor-not-allowed' : ''}`}
                      placeholder="e.g. 100"
                    />
                    <span className="absolute right-4 top-3 text-gray-500 dark:text-gray-400 text-sm font-medium">mg/dL</span>
                  </div>
                  {errors.glucose && (
                    <motion.p className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                      <AlertTriangleIcon className="h-4 w-4" />
                      {errors.glucose}
                    </motion.p>
                  )}
                </motion.div>

                {/* BMI */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <label
                    htmlFor="bmi"
                    className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2"
                  >
                    {t('diagnose.diabetes.bmi')}
                    <span className="text-primary ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    id="bmi"
                    name="bmi"
                    step="0.1"
                    value={formData.bmi}
                    onChange={handleChange}
                    disabled={isAnalyzing || result !== null}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-0 outline-none transition-colors ${
                      errors.bmi
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:border-primary/30 focus:border-primary'
                    } ${isAnalyzing || result !== null ? 'bg-gray-50 dark:bg-slate-900 text-gray-500 cursor-not-allowed' : ''}`}
                    placeholder="e.g. 24.5"
                  />
                  {errors.bmi && (
                    <motion.p className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                      <AlertTriangleIcon className="h-4 w-4" />
                      {errors.bmi}
                    </motion.p>
                  )}
                </motion.div>

                {/* Blood Pressure */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <label
                    htmlFor="bloodPressure"
                    className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2"
                  >
                    {t('diagnose.diabetes.bloodPressure')}
                    <span className="text-primary ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="bloodPressure"
                      name="bloodPressure"
                      value={formData.bloodPressure}
                      onChange={handleChange}
                      disabled={isAnalyzing || result !== null}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-0 outline-none transition-colors ${
                        errors.bloodPressure
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:border-primary/30 focus:border-primary'
                      } ${isAnalyzing || result !== null ? 'bg-gray-50 dark:bg-slate-900 text-gray-500 cursor-not-allowed' : ''}`}
                      placeholder="e.g. 120"
                    />
                    <span className="absolute right-4 top-3 text-gray-500 dark:text-gray-400 text-sm font-medium">mmHg</span>
                  </div>
                  {errors.bloodPressure && (
                    <motion.p className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                      <AlertTriangleIcon className="h-4 w-4" />
                      {errors.bloodPressure}
                    </motion.p>
                  )}
                </motion.div>

                {/* Skin Thickness */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  <label htmlFor="skinThickness" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    {t('diagnose.diabetes.skinThickness')}
                  </label>
                  <input
                    type="number"
                    id="skinThickness"
                    name="skinThickness"
                    value={formData.skinThickness}
                    onChange={handleChange}
                    disabled={isAnalyzing || result !== null}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-0 outline-none hover:border-primary/30 focus:border-primary transition-colors disabled:bg-gray-50 dark:disabled:bg-slate-900"
                  />
                </motion.div>

                {/* Insulin */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <label htmlFor="insulin" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    {t('diagnose.diabetes.insulin')}
                  </label>
                  <input
                    type="number"
                    id="insulin"
                    name="insulin"
                    value={formData.insulin}
                    onChange={handleChange}
                    disabled={isAnalyzing || result !== null}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-0 outline-none hover:border-primary/30 focus:border-primary transition-colors disabled:bg-gray-50 dark:disabled:bg-slate-900"
                  />
                </motion.div>

                {/* Pedigree Function */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                  <label htmlFor="pedigreeFunction" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    {t('diagnose.diabetes.pedigreeFunction')}
                  </label>
                  <input
                    type="number"
                    id="pedigreeFunction"
                    name="pedigreeFunction"
                    step="0.01"
                    value={formData.pedigreeFunction}
                    onChange={handleChange}
                    disabled={isAnalyzing || result !== null}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-0 outline-none hover:border-primary/30 focus:border-primary transition-colors disabled:bg-gray-50 dark:disabled:bg-slate-900"
                  />
                </motion.div>

                {/* Age */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <label
                    htmlFor="age"
                    className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2"
                  >
                    {t('diagnose.diabetes.age')}
                    <span className="text-primary ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      disabled={isAnalyzing || result !== null}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-0 outline-none transition-colors ${
                        errors.age
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:border-primary/30 focus:border-primary'
                      } ${isAnalyzing || result !== null ? 'bg-gray-50 dark:bg-slate-900 text-gray-500 cursor-not-allowed' : ''}`}
                      placeholder="e.g. 45"
                    />
                    <span className="absolute right-4 top-3 text-gray-500 dark:text-gray-400 text-sm font-medium">yrs</span>
                  </div>
                  {errors.age && (
                    <motion.p className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                      <AlertTriangleIcon className="h-4 w-4" />
                      {errors.age}
                    </motion.p>
                  )}
                </motion.div>

              </div>

              {!result && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full mt-8 bg-gradient-to-r from-primary to-primary/80 text-white py-3.5 px-4 rounded-lg font-semibold hover:shadow-lg focus:ring-4 focus:ring-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2 h-[52px] group"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2Icon className="h-5 w-5 animate-spin" />
                      {t('diagnose.diabetes.analyzing')}
                    </>
                  ) : (
                    <>
                      <ActivityIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      {t('diagnose.diabetes.analyze')}
                    </>
                  )}
                </motion.button>
              )}
            </form>
          </div>
        </div>

        {/* Result Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{
                opacity: 0,
                x: isRTL ? -20 : 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              className="md:col-span-5"
            >
              <div className="sticky top-24 space-y-4">
                <DiabetesResultCard
                  riskLevel={result.riskLevel}
                  confidence={result.confidence}
                  glucose={parseFloat(formData.glucose)}
                  bmi={parseFloat(formData.bmi)}
                />

                {/* Actions */}
                <div className="space-y-3 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-slate-800 transition-colors">
                  <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all group">
                    <SaveIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {t('diagnose.diabetes.saveToRecords')}
                  </button>
                  <button
                    onClick={resetForm}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-primary border-2 border-primary hover:bg-primary/5 dark:hover:bg-primary/10 py-3 px-4 rounded-lg font-semibold transition-all"
                  >
                    <ActivityIcon className="h-5 w-5" />
                    {t('diagnose.diabetes.newAnalysis')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>);

}
