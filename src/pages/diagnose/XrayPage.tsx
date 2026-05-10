import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ScanIcon,
  UploadCloudIcon,
  FileIcon,
  XIcon,
  AlertTriangleIcon,
  SaveIcon,
  Loader2Icon } from
'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { DisclaimerBanner } from '../../components/shared/DisclaimerBanner';
import { XrayResultCard } from '../../components/diagnose/XrayResultCard';
import { fetchApi } from '../../lib/api/apiClient';
interface XrayResult {
  top_prediction: string;
  confidence: string;
  all_results: {
    label: string;
    score: number;
  }[];
}
export function XrayPage() {
  const { t, locale, isRTL } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<XrayResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const validateFile = (selectedFile: File): boolean => {
    setError(null);
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'application/dicom'];
    if (
    !validTypes.includes(selectedFile.type) &&
    !selectedFile.name.endsWith('.dcm'))
    {
      setError(t('diagnose.xray.validation.fileType'));
      return false;
    }
    // Check file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(t('diagnose.xray.validation.fileSize'));
      return false;
    }
    return true;
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        processFile(droppedFile);
      }
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        processFile(selectedFile);
      }
    }
  };
  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null); // No preview for DICOM in this mock
    }
  };
  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleAnalyze = async () => {
    if (!file) {
      setError(t('diagnose.xray.validation.required'));
      return;
    }
    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);
    setError(null);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      let currentProgress = 0;
      progressInterval = setInterval(() => {
        if (currentProgress < 90) {
          currentProgress += Math.floor(Math.random() * 20) + 10;
          setProgress(Math.min(currentProgress, 90));
        }
      }, 500);

      const response = await fetchApi(
        'https://mkhaledmali-graduation.hf.space/predict',
        {
          method: 'POST',
          headers: {
            'x-api-key': 'your-static-secret-key'
          },
          body: formData
        }
      );

      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setProgress(95);

      if (!response.ok) {
        throw new Error('Analysis failed. Please try again.');
      }

      const data = await response.json();
      setProgress(100);

      setTimeout(() => {
        setIsAnalyzing(false);
        setResult({
          top_prediction: data.top_prediction,
          confidence: data.confidence,
          all_results: data.all_results || []
        });
      }, 500);
    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : 'Failed to analyze image. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/${locale}/diagnose`}
          className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-secondary transition-colors mb-4">
          
          {isRTL ?
          <ChevronRightIcon className="h-5 w-5 me-1" /> :

          <ChevronLeftIcon className="h-5 w-5 me-1" />
          }
          {t('common.back')}
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-secondary/10 p-2 rounded-lg">
            <ScanIcon className="h-6 w-6 text-secondary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t('diagnose.xray.title')}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2 ms-11">
          {t('diagnose.xray.subtitle')}
        </p>
      </div>

      <DisclaimerBanner />

      <div className="grid md:grid-cols-12 gap-8 mt-8">
        {/* Upload Section */}
        <div className={`${result ? 'md:col-span-7' : 'md:col-span-12'} transition-all duration-500`}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
            {!file ? (
              // Dropzone
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-secondary bg-secondary/10 dark:bg-secondary/20 scale-105'
                    : error
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-300 dark:border-slate-700 hover:border-secondary dark:hover:border-secondary hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.dcm,image/jpeg,image/png,application/dicom"
                  className="hidden"
                />

                <motion.div
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                  className="bg-gradient-to-br from-secondary/20 to-secondary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <UploadCloudIcon className="h-10 w-10 text-secondary" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('diagnose.xray.dropzone')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {t('diagnose.xray.dropzoneHint')}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="font-medium">{t('diagnose.xray.maxSize')}</div>
                  <div className="text-gray-400 dark:text-gray-500">JPG, PNG, or DICOM format</div>
                </div>
              </div>
            ) : (
              // File Preview
              <div className="overflow-hidden">
                {previewUrl ? (
                  <div className="relative h-80 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="X-ray preview"
                      className={`max-h-full max-w-full object-contain transition-opacity ${isAnalyzing ? 'opacity-60' : ''}`}
                    />

                    {isAnalyzing && (
                      <motion.div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
                          <Loader2Icon className="h-12 w-12 text-white" />
                        </motion.div>
                        <p className="text-white mt-4 font-semibold">Analyzing X-ray...</p>
                        <div className="w-64 h-1.5 bg-gray-700/50 rounded-full overflow-hidden mt-4">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-secondary to-secondary/70"
                          />
                        </div>
                        <p className="text-white mt-2 text-sm font-medium">{progress}%</p>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 bg-gray-50 dark:bg-slate-800 flex flex-col items-center justify-center">
                    <FileIcon className="h-14 w-14 text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="font-semibold text-gray-700 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 truncate pr-4">
                    <FileIcon className="h-5 w-5 text-secondary flex-shrink-0" />
                    <div className="truncate">
                      <span className="font-medium text-gray-900 dark:text-white block truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  {!isAnalyzing && !result && (
                    <button
                      onClick={clearFile}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors flex-shrink-0"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-lg flex items-start gap-3"
                role="alert"
              >
                <AlertTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">Analysis Error</p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {!result && (
              <button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className="w-full mt-6 bg-gradient-to-r from-secondary to-secondary/80 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg focus:ring-4 focus:ring-secondary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2 h-[52px] group"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2Icon className="h-5 w-5 animate-spin" />
                    {t('diagnose.xray.analyzing')}
                  </>
                ) : (
                  <>
                    <ScanIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {t('diagnose.xray.upload')}
                  </>
                )}
              </button>
            )}
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
                <XrayResultCard 
                  topPrediction={result.top_prediction} 
                  confidence={result.confidence} 
                  allResults={result.all_results}
                />

                {/* Actions */}
                <div className="space-y-3 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-slate-800 transition-colors">
                  <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-secondary to-secondary/80 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all group">
                    <SaveIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {t('diagnose.diabetes.saveToRecords')}
                  </button>
                  <button
                    onClick={clearFile}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-secondary border-2 border-secondary hover:bg-secondary/5 dark:hover:bg-secondary/10 py-3 px-4 rounded-lg font-semibold transition-all"
                  >
                    <ScanIcon className="h-5 w-5" />
                    {t('diagnose.xray.analyzeAnother')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>);

}
