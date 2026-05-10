import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileTextIcon,
  ActivityIcon,
  MessageSquareIcon,
  CalendarIcon,
  DownloadIcon,
  Loader2Icon,
  AlertTriangleIcon,
  XIcon } from
'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useRecordsStore, MedicalRecord } from '../../lib/store/recordsStore';
import { recordApi } from '../../lib/api/recordApi';

export function RecordsTimelinePage() {
  const { t, locale, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { records, setRecords, isLoading, setLoading, error, setError } = useRecordsStore();
  const [isExporting, setIsExporting] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await recordApi.getMyMedicalRecord();
        if (data && data.record) {
          const transformed: MedicalRecord[] = [];

          // Map diagnostics
          if (data.record.diagnostics) {
            data.record.diagnostics.forEach((d, idx) => {
              // Fix date: "2026-05-08 00:41:13" → "2026-05-08T00:41:13"
              const isoDate = d.date?.replace(' ', 'T') ?? '';
              transformed.push({
                id: isoDate || String(idx), // no id in response, use date
                type: 'diabetesAnalysis',
                title: 'Diabetes Risk Analysis',
                titleAr: 'تحليل خطر السكري',
                date: isoDate,
                data: {
                  // Flatten key_readings for display
                  glucose: d.key_readings?.glucose?.value,
                  bmi: d.key_readings?.bmi?.value,
                  bloodPressure: d.key_readings?.blood_pressure?.value,
                  age: d.key_readings?.age?.value,
                  riskLevel: d.result?.risk_level === '1' ? 'High' : 'Low',
                  confidence: d.result?.confidence_score != null
                    ? Math.round(d.result.confidence_score * 100)
                    : 0
                }
              });
            });
          }

          // Map radiology
          if (data.record.radiology) {
            data.record.radiology.forEach((r) => {
              const firstFinding = r.findings?.[0];
              transformed.push({
                id: r.id,
                type: 'xrayAnalysis',
                title: 'Chest X-Ray Analysis',
                titleAr: 'تحليل أشعة الصدر',
                date: r.uploaded_at,
                data: {
                  finding: firstFinding?.finding_name || 'Normal',
                  confidence: firstFinding?.confidence_score != null
                    ? Math.round(firstFinding.confidence_score * 100)
                    : 0,
                  imageUrl: r.image_path
                    ? (r.image_path.startsWith('http')
                        ? r.image_path
                        : `/api/${r.image_path.replace(/^\//, '')}`)
                    : null
                }
              });
            });
          }

          // Sort by date descending
          transformed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setRecords(transformed);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [setRecords, setLoading, setError]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      // Revoke old URL if exists
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
      const url = await recordApi.getMedicalRecordPdfUrl();
      setPdfUrl(url);
      setIsPdfModalOpen(true);
    } catch (err) {
      alert(t('common.error'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `medical_record_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const filteredRecords = records.filter(
    (r) => filter === 'all' || r.type === filter
  );
  const getIconForType = (type: string) => {
    switch (type) {
      case 'diabetesAnalysis':
      case 'xrayAnalysis':
        return <ActivityIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'chatSession':
        return <MessageSquareIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'doctorVisit':
        return <CalendarIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <FileTextIcon className="w-5 h-5 text-gray-600 dark:text-slate-400" />;
    }
  };
  const getColorForType = (type: string) => {
    switch (type) {
      case 'diabetesAnalysis':
      case 'xrayAnalysis':
        return 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30';
      case 'chatSession':
        return 'bg-teal-100 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/30';
      case 'doctorVisit':
        return 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30';
      default:
        return 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700';
    }
  };
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('records.timeline.title')}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">{t('records.timeline.subtitle')}</p>
        </div>
        <button
          onClick={handleExportPdf}
          disabled={isExporting || records.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {isExporting ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <DownloadIcon className="w-4 h-4" />
          )}
          {t('records.timeline.exportPdf')}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertTriangleIcon className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
        {
          id: 'all',
          label: t('records.timeline.filterAll')
        },
        {
          id: 'diabetesAnalysis',
          label: t('records.timeline.filterAnalysis')
        },
        {
          id: 'chatSession',
          label: t('records.timeline.filterChat')
        },
        {
          id: 'doctorVisit',
          label: t('records.timeline.filterBooking')
        }].
        map((f) =>
        <button
          key={f.id}
          onClick={() => setFilter(f.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f.id ? 'bg-gray-900 dark:bg-primary text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
          
            {f.label}
          </button>
        )}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2Icon className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500 font-medium">{t('common.loading')}</p>
        </div>
      ) : filteredRecords.length > 0 ?
      <div className="relative ms-4 sm:ms-8">
          {/* Vertical Line */}
          <div
          className={`absolute top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700 ${isRTL ? 'right-0' : 'left-0'}`} />
        

          <div className="space-y-8">
            {filteredRecords.map((record, idx) =>
          <motion.div
            key={record.id}
            initial={{
              opacity: 0,
              x: isRTL ? 20 : -20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              delay: idx * 0.1
            }}
            className={`relative flex items-start ${isRTL ? 'pe-8' : 'ps-8'}`}>
            

                {/* Timeline Dot */}
                <div
              className={`absolute top-4 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 bg-gray-400 dark:bg-slate-600 shadow-sm ${isRTL ? '-right-2' : '-left-2'}`} />
            

                {/* Card */}
                <div
              onClick={() => navigate(`/${locale}/records/${record.id}`)}
              className="bg-white dark:bg-slate-800 rounded-card shadow-sm border border-gray-100 dark:border-slate-700 p-5 w-full cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-slate-500 transition-all group">
              
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                    className={`p-2 rounded-lg border ${getColorForType(record.type)}`}>
                    
                        {getIconForType(record.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          {locale === 'ar' ? record.titleAr : record.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {t(`records.types.${record.type}`)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(record.date).toLocaleDateString(
                    locale === 'ar' ? 'ar-SA' : 'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }
                  )}
                    </span>
                  </div>

                  {/* Preview Data based on type */}
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-3 text-sm text-gray-600 dark:text-slate-300 transition-colors">
                    {record.type === 'diabetesAnalysis' &&
                <div className="flex items-center gap-4">
                        <span>
                          Risk:{' '}
                          <strong
                      className={
                      record.data.riskLevel === 'Low' ?
                      'text-green-600 dark:text-green-400' :
                      'text-amber-600 dark:text-amber-400'
                      }>
                      
                            {record.data.riskLevel}
                          </strong>
                        </span>
                        <span>
                          Confidence: <strong>{record.data.confidence}%</strong>
                        </span>
                      </div>
                }
                    {record.type === 'doctorVisit' &&
                <p className="truncate">
                        {record.data.doctorName} - {record.data.notes}
                      </p>
                }
                    {record.type === 'xrayAnalysis' &&
                <div className="flex items-center gap-4">
                        <span>
                          Finding: <strong>{record.data.finding}</strong>
                        </span>
                        <span>
                          Confidence: <strong>{record.data.confidence}%</strong>
                        </span>
                      </div>
                }
                  </div>
                </div>
              </motion.div>
          )}
          </div>
        </div> :

      <div className="bg-white dark:bg-slate-800 rounded-card p-12 text-center border border-gray-100 dark:border-slate-700">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <FileTextIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {t('records.empty')}
          </h3>
        </div>
      }

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {isPdfModalOpen && pdfUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) handleClosePdfModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
              style={{ height: '90vh' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileTextIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                      {locale === 'ar' ? 'السجل الطبي' : 'Medical Record'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {locale === 'ar' ? 'معاينة ملف PDF' : 'PDF Preview'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    {locale === 'ar' ? 'تحميل' : 'Download'}
                  </button>
                  <button
                    onClick={handleClosePdfModal}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* PDF Canvas */}
              <div className="flex-1 overflow-hidden bg-gray-100">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title={locale === 'ar' ? 'السجل الطبي' : 'Medical Record PDF'}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

}